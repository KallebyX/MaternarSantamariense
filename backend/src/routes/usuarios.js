import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel, usuarioPublico } from '../auth/middleware.js';
import { erro, ok, exigir, emailValido } from '../lib/http.js';

export const usuariosRouter = Router();
usuariosRouter.use(autenticar);

// Perfil próprio
usuariosRouter.put('/eu', (req, res) => {
  const { nome, cargo, unidade } = req.body || {};
  db.prepare('UPDATE usuarios SET nome = COALESCE(?, nome), cargo = COALESCE(?, cargo), unidade = COALESCE(?, unidade) WHERE id = ?')
    .run(nome?.trim() || null, cargo?.trim() ?? null, unidade?.trim() ?? null, req.usuario.id);
  registrarLog(req.usuario.email, 'atualizar-perfil');
  return ok(res, usuarioPublico(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id)));
});

usuariosRouter.put('/eu/senha', (req, res) => {
  const falta = exigir(req.body, ['senhaAtual', 'senhaNova']);
  if (falta) return erro(res, 400, falta);
  if (!bcrypt.compareSync(req.body.senhaAtual, req.usuario.senha_hash)) {
    return erro(res, 401, 'Senha atual incorreta.');
  }
  if (String(req.body.senhaNova).length < 8) return erro(res, 400, 'A nova senha deve ter pelo menos 8 caracteres.');
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(String(req.body.senhaNova), 10), req.usuario.id);
  registrarLog(req.usuario.email, 'trocar-senha');
  return ok(res, { mensagem: 'Senha atualizada.' });
});

// Gestão de usuários (Gestor/Admin)
usuariosRouter.get('/', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const usuarios = db.prepare('SELECT * FROM usuarios ORDER BY nome').all().map(usuarioPublico);
  return ok(res, usuarios);
});

usuariosRouter.post('/convite', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['nome', 'email']);
  if (falta) return erro(res, 400, falta);
  const email = String(req.body.email).toLowerCase().trim();
  if (!emailValido(email)) return erro(res, 400, 'E-mail inválido.');
  if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email)) return erro(res, 409, 'E-mail já cadastrado.');
  const perfil = ['Profissional', 'Gestor', 'Administrador'].includes(req.body.perfil) ? req.body.perfil : 'Profissional';
  const senhaProvisoria = Math.random().toString(36).slice(2, 10);
  const nome = String(req.body.nome).trim();
  const iniciais = nome.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  db.prepare(`INSERT INTO usuarios (nome, email, senha_hash, unidade, perfil, iniciais, situacao)
    VALUES (?, ?, ?, ?, ?, ?, 'Ativo')`)
    .run(nome, email, bcrypt.hashSync(senhaProvisoria, 10), String(req.body.unidade || '').trim(), perfil, iniciais);
  registrarLog(req.usuario.email, 'convidar-usuario', email);
  // A senha provisória é devolvida ao gestor para repasse pessoal (sem SMTP na VM).
  return res.status(201).json({ ok: true, dados: { email, senhaProvisoria }, erro: null });
});

usuariosRouter.post('/:id/aprovar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const r = db.prepare("UPDATE usuarios SET situacao = 'Ativo' WHERE id = ? AND situacao = 'Pendente'").run(req.params.id);
  if (!r.changes) return erro(res, 404, 'Usuário pendente não encontrado.');
  registrarLog(req.usuario.email, 'aprovar-usuario', req.params.id);
  return ok(res, { mensagem: 'Usuário aprovado.' });
});

usuariosRouter.post('/:id/desativar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return erro(res, 400, 'Não é possível desativar a própria conta.');
  const r = db.prepare("UPDATE usuarios SET situacao = 'Desativado' WHERE id = ?").run(req.params.id);
  if (!r.changes) return erro(res, 404, 'Usuário não encontrado.');
  registrarLog(req.usuario.email, 'desativar-usuario', req.params.id);
  return ok(res, { mensagem: 'Usuário desativado.' });
});

usuariosRouter.put('/:id/perfil', exigirPapel('Administrador'), (req, res) => {
  if (!['Profissional', 'Gestor', 'Administrador'].includes(req.body?.perfil)) {
    return erro(res, 400, 'Perfil inválido.');
  }
  const r = db.prepare('UPDATE usuarios SET perfil = ? WHERE id = ?').run(req.body.perfil, req.params.id);
  if (!r.changes) return erro(res, 404, 'Usuário não encontrado.');
  registrarLog(req.usuario.email, 'alterar-perfil-usuario', `${req.params.id} → ${req.body.perfil}`);
  return ok(res, { mensagem: 'Perfil atualizado.' });
});
