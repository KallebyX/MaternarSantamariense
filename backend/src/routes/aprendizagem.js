// Cursos, progresso (XP), certificados e verificação pública, mensagens e notificações.
import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { erro, ok, exigir } from '../lib/http.js';
import { XP_POR_AULA } from '../lib/progresso.js';
import { montarCurso, cursosPublicados } from '../lib/cursos.js';

export const aprendizagemRouter = Router();

// ------------------------------------------------------------------- cursos
function acessoGestao(req, res, next) {
  if (req.query.gestao !== '1') return next();
  return autenticar(req, res, () => exigirPapel('Gestor', 'Administrador')(req, res, next));
}

aprendizagemRouter.get('/cursos', acessoGestao, (req, res) => {
  return ok(res, req.query.gestao === '1'
    ? db.prepare('SELECT * FROM cursos').all().map(montarCurso)
    : cursosPublicados());
});

aprendizagemRouter.get('/cursos/:id', acessoGestao, (req, res) => {
  const curso = montarCurso(db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.params.id));
  if (!curso || (!curso.disponivel && req.query.gestao !== '1')) return erro(res, 404, 'Curso não encontrado ou ainda não publicado.');
  return ok(res, curso);
});

aprendizagemRouter.get('/progresso', autenticar, (req, res) => {
  const linhas = db.prepare('SELECT p.curso_id, p.aula_ordem, p.concluido_em FROM progresso p JOIN aulas a ON a.curso_id = p.curso_id AND a.ordem = p.aula_ordem WHERE p.usuario_id = ?').all(req.usuario.id);
  return ok(res, { progresso: linhas, xp: req.usuario.xp, streak: req.usuario.streak });
});

aprendizagemRouter.post('/cursos/:id/aulas/:ordem/concluir', autenticar, (req, res) => {
  const curso = montarCurso(db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.params.id));
  if (!curso) return erro(res, 404, 'Curso não encontrado.');
  if (!curso.disponivel) return erro(res, 422, 'Este curso ainda não está publicado com todas as aulas disponíveis.');
  const ordem = Number(req.params.ordem);
  const aula = db.prepare('SELECT * FROM aulas WHERE curso_id = ? AND ordem = ?').get(curso.id, ordem);
  if (!aula) return erro(res, 404, 'Aula não encontrada.');
  if (!aula.url) return erro(res, 422, 'Esta aula ainda não possui conteúdo publicado.');
  const r = db.prepare('INSERT OR IGNORE INTO progresso (usuario_id, curso_id, aula_ordem) VALUES (?, ?, ?)')
    .run(req.usuario.id, curso.id, ordem);
  let xp = req.usuario.xp;
  if (r.changes) {
    xp += XP_POR_AULA;
    db.prepare('UPDATE usuarios SET xp = ? WHERE id = ?').run(xp, req.usuario.id);
  }
  const total = db.prepare('SELECT COUNT(*) c FROM aulas WHERE curso_id = ?').get(curso.id).c;
  const feitas = db.prepare('SELECT COUNT(*) c FROM progresso p JOIN aulas a ON a.curso_id = p.curso_id AND a.ordem = p.aula_ordem WHERE p.usuario_id = ? AND p.curso_id = ?').get(req.usuario.id, curso.id).c;
  return ok(res, { xp, aulasConcluidas: feitas, totalAulas: total, cursoConcluido: feitas >= total });
});

// ------------------------------------------------------------- certificados
function gerarCodigo() {
  return 'MSM-' + new Date().getFullYear() + '-' + randomBytes(4).toString('hex').toUpperCase();
}

aprendizagemRouter.post('/certificados', autenticar, (req, res) => {
  const falta = exigir(req.body, ['cursoId']);
  if (falta) return erro(res, 400, falta);
  const curso = montarCurso(db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.body.cursoId));
  if (!curso) return erro(res, 404, 'Curso não encontrado.');
  if (!curso.disponivel) return erro(res, 422, 'Este curso ainda não está publicado com todas as aulas disponíveis.');
  const total = db.prepare('SELECT COUNT(*) c FROM aulas WHERE curso_id = ?').get(curso.id).c;
  const feitas = db.prepare('SELECT COUNT(*) c FROM progresso p JOIN aulas a ON a.curso_id = p.curso_id AND a.ordem = p.aula_ordem WHERE p.usuario_id = ? AND p.curso_id = ?').get(req.usuario.id, curso.id).c;
  if (!total) return erro(res, 422, 'Este curso ainda não possui aulas publicadas.');
  if (feitas < total) return erro(res, 422, `Conclua todas as aulas antes de emitir o certificado (${feitas}/${total}).`);
  const existente = db.prepare('SELECT * FROM certificados WHERE usuario_id = ? AND curso_id = ?').get(req.usuario.id, curso.id);
  if (existente) return ok(res, existente);
  const codigo = gerarCodigo();
  db.prepare('INSERT INTO certificados (codigo, usuario_id, curso_id, modelo, nome_portador, titulo_curso, horas_curso, area_curso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(codigo, req.usuario.id, curso.id, curso.area, req.usuario.nome, curso.titulo, curso.horas, curso.area);
  registrarLog(req.usuario.email, 'emitir-certificado', `${curso.id} ${codigo}`);
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM certificados WHERE codigo = ?').get(codigo), erro: null });
});

aprendizagemRouter.get('/certificados/meus', autenticar, (req, res) => {
  const certs = db.prepare(`SELECT ce.*, COALESCE(NULLIF(ce.titulo_curso, ''), cu.titulo) curso, COALESCE(ce.horas_curso, cu.horas) horas, COALESCE(NULLIF(ce.area_curso, ''), cu.area) area
    FROM certificados ce JOIN cursos cu ON cu.id = ce.curso_id WHERE ce.usuario_id = ?`).all(req.usuario.id);
  return ok(res, certs);
});

// Verificação pública por código (anti-fraude)
aprendizagemRouter.get('/certificados/verificar/:codigo', (req, res) => {
  const cert = db.prepare(`SELECT ce.codigo, ce.modelo, ce.emitido_em, COALESCE(NULLIF(ce.titulo_curso, ''), cu.titulo) curso, COALESCE(ce.horas_curso, cu.horas) horas, COALESCE(NULLIF(ce.area_curso, ''), cu.area) area, COALESCE(NULLIF(ce.nome_portador, ''), u.nome) portador
    FROM certificados ce JOIN cursos cu ON cu.id = ce.curso_id JOIN usuarios u ON u.id = ce.usuario_id
    WHERE ce.codigo = ?`).get(String(req.params.codigo).toUpperCase());
  if (!cert) return erro(res, 404, 'Certificado não encontrado. Verifique o código.');
  return ok(res, { valido: true, ...cert });
});

// -------------------------------------------------------- canais e mensagens
aprendizagemRouter.get('/canais', autenticar, (req, res) => {
  const canais = db.prepare('SELECT * FROM canais').all();
  const contagens = db.prepare('SELECT canal_id, COUNT(*) c FROM mensagens GROUP BY canal_id').all();
  const mapa = Object.fromEntries(contagens.map(x => [x.canal_id, x.c]));
  return ok(res, canais.map(c => ({ ...c, mensagens: mapa[c.id] || 0 })));
});

aprendizagemRouter.get('/canais/:id/mensagens', autenticar, (req, res) => {
  if (!db.prepare('SELECT 1 FROM canais WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Canal não encontrado.');
  const { antes, depois } = req.query;
  if ((antes !== undefined && depois !== undefined) || [antes, depois].some(v => v !== undefined && (typeof v !== 'string' || !/^\d+$/.test(v) || !Number.isSafeInteger(Number(v))))) return erro(res, 400, 'Cursor de mensagens inválido.');
  const incremental = depois !== undefined;
  const limite = incremental ? 200 : 50;
  const cursor = incremental ? depois : antes;
  const campos = 'id, canal_id, autor, iniciais, texto, hora, criado_em';
  let linhas = db.prepare(`SELECT ${campos} FROM mensagens WHERE canal_id = ? ${cursor !== undefined ? `AND id ${incremental ? '>' : '<'} ?` : ''} ORDER BY id ${incremental ? 'ASC' : 'DESC'} LIMIT ?`)
    .all(req.params.id, ...(cursor !== undefined ? [Number(cursor)] : []), limite + 1);
  const temMais = linhas.length > limite;
  linhas = linhas.slice(0, limite);
  if (!incremental) linhas.reverse();
  return ok(res, linhas, { temAnteriores: !incremental && temMais, maisNovas: incremental && temMais });
});

aprendizagemRouter.post('/canais/:id/mensagens', autenticar, (req, res) => {
  const { texto, clientId } = req.body || {};
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 2000) return erro(res, 400, 'Escreva uma mensagem de até 2.000 caracteres.');
  if (clientId !== undefined && (typeof clientId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(clientId))) return erro(res, 400, 'Identificador de envio inválido.');
  if (!db.prepare('SELECT 1 FROM canais WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Canal não encontrado.');
  const campos = 'id, canal_id, autor, iniciais, texto, hora, criado_em';
  const anterior = clientId && db.prepare(`SELECT ${campos} FROM mensagens WHERE usuario_id=? AND client_id=?`).get(req.usuario.id, clientId);
  if (anterior) {
    if (anterior.canal_id !== req.params.id || anterior.texto !== texto.trim()) return erro(res, 409, 'Este envio já foi usado para outra mensagem.');
    return ok(res, anterior);
  }
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const info = db.prepare('INSERT INTO mensagens (canal_id, autor, iniciais, texto, hora, usuario_id, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(req.params.id, req.usuario.nome, req.usuario.iniciais, texto.trim(), hora, req.usuario.id, clientId || null);
  return res.status(201).json({ ok: true, dados: db.prepare(`SELECT ${campos} FROM mensagens WHERE id = ?`).get(info.lastInsertRowid), erro: null });
});

// -------------------------------------------------------------- notificações
aprendizagemRouter.get('/notificacoes', autenticar, (req, res) => {
  const notifs = db.prepare(`SELECT n.*, (nl.notificacao_id IS NOT NULL) lida
    FROM notificacoes n
    LEFT JOIN notificacoes_lidas nl ON nl.notificacao_id = n.id AND nl.usuario_id = ?
    WHERE n.usuario_id IS NULL OR n.usuario_id = ?
    ORDER BY n.id DESC`).all(req.usuario.id, req.usuario.id);
  return ok(res, notifs.map(n => ({ ...n, lida: !!n.lida })));
});

// Painel de gestão: todos os avisos, inclusive os dirigidos a uma pessoa só.
aprendizagemRouter.get('/notificacoes/todas', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) =>
  ok(res, db.prepare(`SELECT n.*, u.nome destinatario
    FROM notificacoes n LEFT JOIN usuarios u ON u.id = n.usuario_id
    ORDER BY n.id DESC`).all()));

aprendizagemRouter.post('/notificacoes/:id/lida', autenticar, (req, res) => {
  if (!db.prepare('SELECT 1 FROM notificacoes WHERE id = ? AND (usuario_id IS NULL OR usuario_id = ?)').get(req.params.id, req.usuario.id)) return erro(res, 404, 'Notificação não encontrada.');
  db.prepare('INSERT OR IGNORE INTO notificacoes_lidas (usuario_id, notificacao_id) VALUES (?, ?)')
    .run(req.usuario.id, req.params.id);
  return ok(res, { mensagem: 'Notificação marcada como lida.' });
});

// --------------------------------------------------------------- conquistas
aprendizagemRouter.get('/conquistas', (req, res) => ok(res, db.prepare('SELECT * FROM conquistas ORDER BY nivel').all()));
