// Cursos, progresso (XP), certificados e verificação pública, mensagens e notificações.
import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db, registrarLog } from '../db/connection.js';
import { autenticar } from '../auth/middleware.js';
import { erro, ok, exigir } from '../lib/http.js';

export const aprendizagemRouter = Router();

const XP_POR_AULA = 40;

// ------------------------------------------------------------------- cursos
aprendizagemRouter.get('/cursos', (req, res) => {
  const cursos = db.prepare('SELECT * FROM cursos').all();
  const aulas = db.prepare('SELECT * FROM aulas ORDER BY curso_id, ordem').all();
  return ok(res, cursos.map(c => ({ ...c, aulas: aulas.filter(a => a.curso_id === c.id) })));
});

aprendizagemRouter.get('/cursos/:id', (req, res) => {
  const curso = db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.params.id);
  if (!curso) return erro(res, 404, 'Curso não encontrado.');
  curso.aulas = db.prepare('SELECT * FROM aulas WHERE curso_id = ? ORDER BY ordem').all(curso.id);
  return ok(res, curso);
});

aprendizagemRouter.get('/progresso', autenticar, (req, res) => {
  const linhas = db.prepare('SELECT curso_id, aula_ordem, concluido_em FROM progresso WHERE usuario_id = ?').all(req.usuario.id);
  return ok(res, { progresso: linhas, xp: req.usuario.xp, streak: req.usuario.streak });
});

aprendizagemRouter.post('/cursos/:id/aulas/:ordem/concluir', autenticar, (req, res) => {
  const curso = db.prepare('SELECT id FROM cursos WHERE id = ?').get(req.params.id);
  if (!curso) return erro(res, 404, 'Curso não encontrado.');
  const ordem = Number(req.params.ordem);
  const aula = db.prepare('SELECT 1 FROM aulas WHERE curso_id = ? AND ordem = ?').get(curso.id, ordem);
  if (!aula) return erro(res, 404, 'Aula não encontrada.');
  const r = db.prepare('INSERT OR IGNORE INTO progresso (usuario_id, curso_id, aula_ordem) VALUES (?, ?, ?)')
    .run(req.usuario.id, curso.id, ordem);
  let xp = req.usuario.xp;
  if (r.changes) {
    xp += XP_POR_AULA;
    db.prepare('UPDATE usuarios SET xp = ? WHERE id = ?').run(xp, req.usuario.id);
  }
  const total = db.prepare('SELECT COUNT(*) c FROM aulas WHERE curso_id = ?').get(curso.id).c;
  const feitas = db.prepare('SELECT COUNT(*) c FROM progresso WHERE usuario_id = ? AND curso_id = ?').get(req.usuario.id, curso.id).c;
  return ok(res, { xp, aulasConcluidas: feitas, totalAulas: total, cursoConcluido: feitas >= total });
});

// ------------------------------------------------------------- certificados
function gerarCodigo() {
  return 'MSM-' + new Date().getFullYear() + '-' + randomBytes(4).toString('hex').toUpperCase();
}

aprendizagemRouter.post('/certificados', autenticar, (req, res) => {
  const falta = exigir(req.body, ['cursoId']);
  if (falta) return erro(res, 400, falta);
  const curso = db.prepare('SELECT * FROM cursos WHERE id = ?').get(req.body.cursoId);
  if (!curso) return erro(res, 404, 'Curso não encontrado.');
  const total = db.prepare('SELECT COUNT(*) c FROM aulas WHERE curso_id = ?').get(curso.id).c;
  const feitas = db.prepare('SELECT COUNT(*) c FROM progresso WHERE usuario_id = ? AND curso_id = ?').get(req.usuario.id, curso.id).c;
  if (feitas < total) return erro(res, 422, `Conclua todas as aulas antes de emitir o certificado (${feitas}/${total}).`);
  const existente = db.prepare('SELECT * FROM certificados WHERE usuario_id = ? AND curso_id = ?').get(req.usuario.id, curso.id);
  if (existente) return ok(res, existente);
  const codigo = gerarCodigo();
  db.prepare('INSERT INTO certificados (codigo, usuario_id, curso_id, modelo) VALUES (?, ?, ?, ?)')
    .run(codigo, req.usuario.id, curso.id, curso.area);
  registrarLog(req.usuario.email, 'emitir-certificado', `${curso.id} ${codigo}`);
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM certificados WHERE codigo = ?').get(codigo), erro: null });
});

aprendizagemRouter.get('/certificados/meus', autenticar, (req, res) => {
  const certs = db.prepare(`SELECT ce.*, cu.titulo curso, cu.horas, cu.area
    FROM certificados ce JOIN cursos cu ON cu.id = ce.curso_id WHERE ce.usuario_id = ?`).all(req.usuario.id);
  return ok(res, certs);
});

// Verificação pública por código (anti-fraude)
aprendizagemRouter.get('/certificados/verificar/:codigo', (req, res) => {
  const cert = db.prepare(`SELECT ce.codigo, ce.modelo, ce.emitido_em, cu.titulo curso, cu.horas, cu.area, u.nome portador
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
  return ok(res, db.prepare('SELECT * FROM mensagens WHERE canal_id = ? ORDER BY id').all(req.params.id));
});

aprendizagemRouter.post('/canais/:id/mensagens', autenticar, (req, res) => {
  const falta = exigir(req.body, ['texto']);
  if (falta) return erro(res, 400, falta);
  if (!db.prepare('SELECT 1 FROM canais WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Canal não encontrado.');
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const info = db.prepare('INSERT INTO mensagens (canal_id, autor, iniciais, texto, hora) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, req.usuario.nome, req.usuario.iniciais, String(req.body.texto).trim().slice(0, 2000), hora);
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM mensagens WHERE id = ?').get(info.lastInsertRowid), erro: null });
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

aprendizagemRouter.post('/notificacoes/:id/lida', autenticar, (req, res) => {
  if (!db.prepare('SELECT 1 FROM notificacoes WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Notificação não encontrada.');
  db.prepare('INSERT OR IGNORE INTO notificacoes_lidas (usuario_id, notificacao_id) VALUES (?, ?)')
    .run(req.usuario.id, req.params.id);
  return ok(res, { mensagem: 'Notificação marcada como lida.' });
});

// --------------------------------------------------------------- conquistas
aprendizagemRouter.get('/conquistas', (req, res) => ok(res, db.prepare('SELECT * FROM conquistas ORDER BY nivel').all()));
