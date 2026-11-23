import { Router } from 'express';
import { db, registrarLog } from '../db/connection.js';
import { autenticar } from '../auth/middleware.js';
import { erro, ok } from '../lib/http.js';

export const agendaRouter = Router();
export const CORES_ORIGEM = { 'NEPeS': '#6b46a5', Maternar: '#17688a', Profissionais: '#357348' };
const gestao = u => ['Gestor', 'Administrador'].includes(u.perfil);
const normalizar = s => String(s || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const editar = (u, e) => gestao(u) || e.criado_por === u.id;
const visivel = (u, e) => e.visibilidade === 'rede' || editar(u,e) || (normalizar(u.equipe_agenda) && normalizar(u.equipe_agenda) === normalizar(e.equipe));
const saida = (u, e) => ({...e, cor: CORES_ORIGEM[e.origem] || CORES_ORIGEM.Maternar, pode_editar: editar(u,e)});
const buscar = id => /^\d+$/.test(String(id)) ? db.prepare('SELECT * FROM eventos WHERE id=?').get(id) : null;

function dadosEvento(body, usuario, anterior) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return {erro:'Informe os dados do evento.'};
  const texto = ['hora','titulo','local','origem','visibilidade','equipe','fim'];
  for (const c of texto) if (body[c] !== undefined && (typeof body[c] !== 'string' || body[c].length > (c === 'titulo' || c === 'local' ? 250 : 180))) return {erro:'Campo inválido: '+c};
  for (const c of ['dia','mes','ano']) if (body[c] !== undefined && !['string','number'].includes(typeof body[c])) return {erro:'Campo inválido: '+c};
  const d = {...anterior, ...Object.fromEntries(Object.entries(body).filter(([k]) => [...texto,'dia','mes','ano'].includes(k)))};
  d.dia = Number(d.dia); d.mes = Number(d.mes ?? new Date().getMonth()+1); d.ano = Number(d.ano ?? new Date().getFullYear());
  if (![d.dia,d.mes,d.ano].every(Number.isInteger) || d.dia<1 || d.dia>31 || d.mes<1 || d.mes>12 || d.ano<2000 || d.ano>2100 || new Date(d.ano,d.mes-1,d.dia).getMonth()!==d.mes-1) return {erro:'Data inválida.'};
  d.titulo = d.titulo?.trim(); d.local = (d.local || '').trim(); d.fim = d.fim || '';
  if (!d.titulo) return {erro:'Informe o título do evento.'};
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.hora || '') || (d.fim && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.fim) || d.fim<=d.hora))) return {erro:'Informe horários válidos; o término deve ser posterior ao início no mesmo dia.'};
  d.origem = d.origem || (gestao(usuario) ? 'Maternar' : 'Profissionais');
  if (!Object.hasOwn(CORES_ORIGEM,d.origem)) return {erro:'Origem inválida.'};
  if (!gestao(usuario) && d.origem !== 'Profissionais') return {status:403,erro:'Somente a gestão publica eventos do NEPeS ou Maternar.'};
  d.visibilidade = d.visibilidade || 'rede';
  if (!['rede','equipe'].includes(d.visibilidade)) return {erro:'Visibilidade inválida.'};
  d.equipe = gestao(usuario) ? (d.equipe || usuario.equipe_agenda || '').trim() : String(usuario.equipe_agenda || '').trim();
  if (d.visibilidade==='equipe' && !d.equipe) return {erro:'Peça à gestão para vincular você à equipe antes de criar uma atividade da equipe.'};
  d.cor=CORES_ORIGEM[d.origem];
  return {dados:d};
}

// A equipe da agenda é atribuída pela gestão: unidade do perfil é autoeditável e não autoriza acesso.
agendaRouter.get('/agenda/equipes', autenticar, (req,res) => {
  const equipes=gestao(req.usuario)
    ? db.prepare("SELECT DISTINCT equipe_agenda FROM usuarios WHERE equipe_agenda<>'' ORDER BY equipe_agenda").all().map(u=>u.equipe_agenda)
    : [req.usuario.equipe_agenda].filter(Boolean);
  return ok(res,equipes);
});
agendaRouter.put('/agenda/equipe/:usuarioId', autenticar, (req,res) => {
  if (!gestao(req.usuario)) return erro(res,403,'Somente a gestão pode atribuir equipes.');
  if (typeof req.body?.equipe!=='string'||req.body.equipe.length>180) return erro(res,400,'Informe uma equipe válida.');
  const equipe=req.body.equipe.trim();
  const alvo=db.prepare('SELECT id FROM usuarios WHERE id=?').get(req.params.usuarioId);
  if (!alvo) return erro(res,404,'Usuário não encontrado.');
  db.prepare('UPDATE usuarios SET equipe_agenda=? WHERE id=?').run(equipe,alvo.id);
  registrarLog(req.usuario.email,'atribuir-equipe-agenda',String(alvo.id));
  return ok(res,{id:alvo.id,equipe_agenda:equipe});
});

agendaRouter.get('/eventos', autenticar, (req,res) => {
  const {mes,ano}=req.query;
  if ((mes!==undefined && (typeof mes!=='string'||!/^\d{1,2}$/.test(mes)||+mes<1||+mes>12)) || (ano!==undefined && (typeof ano!=='string'||!/^\d{4}$/.test(ano)||+ano<2000||+ano>2100))) return erro(res,400,'Mês ou ano inválido.');
  const lista=db.prepare('SELECT * FROM eventos ORDER BY ano,mes,dia,hora,id').all()
    .filter(e=>(mes===undefined||e.mes===+mes)&&(ano===undefined||e.ano===+ano)&&visivel(req.usuario,e));
  return ok(res,lista.map(e=>saida(req.usuario,e)));
});
agendaRouter.get('/eventos/:id', autenticar, (req,res) => {
  const e=buscar(req.params.id);
  if (!e || !visivel(req.usuario,e)) return erro(res,404,'Evento não encontrado.');
  return ok(res,saida(req.usuario,e));
});
agendaRouter.post('/eventos', autenticar, (req,res) => {
  const resultado=dadosEvento(req.body,req.usuario);
  if (resultado.erro) return erro(res,resultado.status||400,resultado.erro);
  const d=resultado.dados;
  const info=db.prepare('INSERT INTO eventos(dia,mes,ano,hora,titulo,local,cor,criado_por,origem,visibilidade,equipe,fim) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(d.dia,d.mes,d.ano,d.hora,d.titulo,d.local,d.cor,req.usuario.id,d.origem,d.visibilidade,d.equipe,d.fim);
  registrarLog(req.usuario.email,'criar-evento',String(info.lastInsertRowid));
  return res.status(201).json({ok:true,dados:saida(req.usuario,buscar(info.lastInsertRowid)),erro:null});
});
agendaRouter.put('/eventos/:id', autenticar, (req,res) => {
  const e=buscar(req.params.id);
  if (!e || !visivel(req.usuario,e)) return erro(res,404,'Evento não encontrado.');
  if (!editar(req.usuario,e)) return erro(res,403,'Você só pode editar suas próprias atividades.');
  const resultado=dadosEvento(req.body,req.usuario,e);
  if (resultado.erro) return erro(res,resultado.status||400,resultado.erro);
  const d=resultado.dados;
  db.prepare('UPDATE eventos SET dia=?,mes=?,ano=?,hora=?,titulo=?,local=?,cor=?,origem=?,visibilidade=?,equipe=?,fim=? WHERE id=?')
    .run(d.dia,d.mes,d.ano,d.hora,d.titulo,d.local,d.cor,d.origem,d.visibilidade,d.equipe,d.fim,e.id);
  registrarLog(req.usuario.email,'atualizar-evento',String(e.id));
  return ok(res,saida(req.usuario,buscar(e.id)));
});
agendaRouter.delete('/eventos/:id', autenticar, (req,res) => {
  const e=buscar(req.params.id);
  if (!e || !visivel(req.usuario,e)) return erro(res,404,'Evento não encontrado.');
  if (!editar(req.usuario,e)) return erro(res,403,'Você só pode remover suas próprias atividades.');
  db.prepare('DELETE FROM eventos WHERE id=?').run(e.id);
  registrarLog(req.usuario.email,'remover-evento',String(e.id));
  return ok(res,{mensagem:'Evento removido.'});
});
