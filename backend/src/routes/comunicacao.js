import { Router } from 'express';
import { db } from '../db/connection.js';
import { autenticar } from '../auth/middleware.js';
import { erro, ok } from '../lib/http.js';
import { AREAS_PROFISSIONAIS } from '../db/comunicacao.js';

export const comunicacaoRouter = Router();
const normalizar = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const CAMPOS_COLEGA = 'id, nome, area, cargo, unidade, foto';
const CAMPOS_MENSAGEM = 'm.id, m.conversa_id, m.autor, m.iniciais, m.texto, m.hora, m.criado_em, u.foto';
const idValido = valor => /^\d+$/.test(String(valor)) && Number.isSafeInteger(Number(valor)) && Number(valor) > 0;

comunicacaoRouter.get('/areas', autenticar, (req, res) => ok(res, AREAS_PROFISSIONAIS));

// Lista profissional distinta da gestão de contas: nunca inclui CPF, telefone,
// e-mail, privilégios, senha ou dados de sessão de outra pessoa.
comunicacaoRouter.get(['/colegas', '/diretorio'], autenticar, (req, res) => {
  const { q = '', area = '', pagina = '1' } = req.query;
  if (typeof q !== 'string' || q.length > 180 || typeof area !== 'string' || (area && !AREAS_PROFISSIONAIS.includes(area)) || !idValido(pagina)) return erro(res, 400, 'Filtro de colegas inválido.');
  const termos = normalizar(q).split(/\s+/).filter(Boolean);
  const todos = db.prepare(`SELECT ${CAMPOS_COLEGA} FROM usuarios WHERE situacao='Ativo' AND id<>? ORDER BY nome`).all(req.usuario.id)
    .filter(u => (!area || u.area === area) && termos.every(t => normalizar([u.nome,u.cargo,u.unidade].join(' ')).includes(t)));
  const limite = 40, inicio = (Number(pagina) - 1) * limite;
  return ok(res, todos.slice(inicio, inicio + limite), { total: todos.length, pagina: Number(pagina), paginas: Math.max(1, Math.ceil(todos.length / limite)) });
});

function conversaPublica(conversa, usuarioId) {
  const colegaId = conversa.usuario_menor === usuarioId ? conversa.usuario_maior : conversa.usuario_menor;
  const colega = db.prepare(`SELECT ${CAMPOS_COLEGA} FROM usuarios WHERE id=?`).get(colegaId);
  const ultimaMensagem = db.prepare('SELECT id, texto, autor, criado_em FROM mensagens_diretas WHERE conversa_id=? ORDER BY id DESC LIMIT 1').get(conversa.id) || null;
  return { id: conversa.id, colega, ultimaMensagem, criado_em: conversa.criado_em };
}

comunicacaoRouter.get('/conversas', autenticar, (req, res) => {
  const conversas = db.prepare(`SELECT c.* FROM conversas c WHERE usuario_menor=? OR usuario_maior=?
    ORDER BY COALESCE((SELECT MAX(id) FROM mensagens_diretas m WHERE m.conversa_id=c.id),0) DESC, c.id DESC`).all(req.usuario.id, req.usuario.id);
  return ok(res, conversas.map(c => conversaPublica(c, req.usuario.id)));
});

comunicacaoRouter.post('/conversas', autenticar, (req, res) => {
  const colegaId = req.body?.usuarioId;
  if (!['number','string'].includes(typeof colegaId) || !idValido(colegaId) || Number(colegaId) === req.usuario.id) return erro(res, 400, 'Selecione outro colega para conversar.');
  if (!db.prepare("SELECT 1 FROM usuarios WHERE id=? AND situacao='Ativo'").get(Number(colegaId))) return erro(res, 404, 'Colega não encontrado ou indisponível.');
  const [menor, maior] = [req.usuario.id, Number(colegaId)].sort((a,b) => a-b);
  const { conversa, criada } = db.transaction(() => {
    const r = db.prepare('INSERT OR IGNORE INTO conversas(usuario_menor,usuario_maior) VALUES (?,?)').run(menor, maior);
    return { criada: !!r.changes, conversa: db.prepare('SELECT * FROM conversas WHERE usuario_menor=? AND usuario_maior=?').get(menor,maior) };
  })();
  return res.status(criada ? 201 : 200).json({ ok: true, dados: conversaPublica(conversa, req.usuario.id), erro: null });
});

function exigirParticipante(req, res, next) {
  if (!idValido(req.params.id)) return erro(res, 404, 'Conversa não encontrada.');
  const conversa = db.prepare('SELECT * FROM conversas WHERE id=? AND (usuario_menor=? OR usuario_maior=?)').get(Number(req.params.id), req.usuario.id, req.usuario.id);
  if (!conversa) return erro(res, 404, 'Conversa não encontrada.');
  req.conversa = conversa;
  next();
}

comunicacaoRouter.get('/conversas/:id/mensagens', autenticar, exigirParticipante, (req, res) => {
  const { antes, depois } = req.query;
  if ((antes !== undefined && depois !== undefined) || [antes,depois].some(v => v !== undefined && (typeof v !== 'string' || !/^\d+$/.test(v) || !Number.isSafeInteger(Number(v))))) return erro(res, 400, 'Cursor de mensagens inválido.');
  const incremental = depois !== undefined, limite = incremental ? 200 : 50, cursor = incremental ? depois : antes;
  let linhas = db.prepare(`SELECT ${CAMPOS_MENSAGEM} FROM mensagens_diretas m JOIN usuarios u ON u.id=m.usuario_id WHERE conversa_id=?
    ${cursor !== undefined ? `AND m.id ${incremental ? '>' : '<'} ?` : ''} ORDER BY m.id ${incremental ? 'ASC' : 'DESC'} LIMIT ?`)
    .all(req.conversa.id, ...(cursor !== undefined ? [Number(cursor)] : []), limite + 1);
  const temMais = linhas.length > limite;
  linhas = linhas.slice(0, limite);
  if (!incremental) linhas.reverse();
  return ok(res, linhas, { temAnteriores: !incremental && temMais, maisNovas: incremental && temMais });
});

comunicacaoRouter.post('/conversas/:id/mensagens', autenticar, exigirParticipante, (req, res) => {
  const { texto, clientId } = req.body || {};
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 2000) return erro(res, 400, 'Escreva uma mensagem de até 2.000 caracteres.');
  if (clientId !== undefined && (typeof clientId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(clientId))) return erro(res, 400, 'Identificador de envio inválido.');
  const colegaId = req.conversa.usuario_menor === req.usuario.id ? req.conversa.usuario_maior : req.conversa.usuario_menor;
  if (!db.prepare("SELECT 1 FROM usuarios WHERE id=? AND situacao='Ativo'").get(colegaId)) return erro(res, 403, 'Este colega não está disponível para receber mensagens.');
  const buscarMensagem = id => db.prepare(`SELECT ${CAMPOS_MENSAGEM} FROM mensagens_diretas m JOIN usuarios u ON u.id=m.usuario_id WHERE m.id=?`).get(id);
  const anterior = clientId && db.prepare('SELECT * FROM mensagens_diretas WHERE usuario_id=? AND client_id=?').get(req.usuario.id,clientId);
  if (anterior) {
    if (anterior.conversa_id !== req.conversa.id || anterior.texto !== texto.trim()) return erro(res, 409, 'Este envio já foi usado para outra mensagem.');
    return ok(res, buscarMensagem(anterior.id));
  }
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const r = db.prepare('INSERT INTO mensagens_diretas(conversa_id,usuario_id,autor,iniciais,texto,client_id,hora) VALUES (?,?,?,?,?,?,?)')
    .run(req.conversa.id, req.usuario.id, req.usuario.nome, req.usuario.iniciais, texto.trim(), clientId || null, hora);
  return res.status(201).json({ ok: true, dados: buscarMensagem(r.lastInsertRowid), erro: null });
});
