import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, registrarLog } from '../db/connection.js';
import { assinarToken, autenticar, usuarioPublico } from './middleware.js';
import { erro, ok, exigir, emailValido } from '../lib/http.js';

export const authRouter = Router();

// Rate limit simples de login por IP (10 tentativas / 5 min)
const tentativas = new Map();
const JANELA_MS = 5 * 60 * 1000;
const MAX_TENTATIVAS = 10;
function limitado(ip) {
  const agora = Date.now();
  const registro = tentativas.get(ip) || { inicio: agora, n: 0 };
  if (agora - registro.inicio > JANELA_MS) { registro.inicio = agora; registro.n = 0; }
  registro.n++;
  tentativas.set(ip, registro);
  return registro.n > MAX_TENTATIVAS;
}

authRouter.post('/login', (req, res) => {
  if (limitado(req.ip)) return erro(res, 429, 'Muitas tentativas. Aguarde alguns minutos.');
  const falta = exigir(req.body, ['email', 'senha']);
  if (falta) return erro(res, 400, falta);
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(String(req.body.email).toLowerCase().trim());
  if (!usuario || !bcrypt.compareSync(req.body.senha, usuario.senha_hash)) {
    return erro(res, 401, 'E-mail ou senha incorretos.');
  }
  if (usuario.situacao === 'Pendente') return erro(res, 403, 'Cadastro aguardando aprovação da coordenação.');
  if (usuario.situacao === 'Desativado') return erro(res, 403, 'Conta desativada. Procure a coordenação.');
  registrarLog(usuario.email, 'login');
  return ok(res, { token: assinarToken(usuario), usuario: usuarioPublico(usuario) });
});

authRouter.post('/registro', (req, res) => {
  const falta = exigir(req.body, ['nome', 'email', 'senha']);
  if (falta) return erro(res, 400, falta);
  const email = String(req.body.email).toLowerCase().trim();
  if (!emailValido(email)) return erro(res, 400, 'E-mail inválido.');
  if (String(req.body.senha).length < 8) return erro(res, 400, 'A senha deve ter pelo menos 8 caracteres.');
  if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email)) {
    return erro(res, 409, 'Já existe uma conta com este e-mail.');
  }
  const nome = String(req.body.nome).trim();
  const iniciais = nome.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const info = db.prepare(`INSERT INTO usuarios (nome, email, senha_hash, cargo, unidade, perfil, iniciais, situacao)
    VALUES (?, ?, ?, ?, ?, 'Profissional', ?, 'Pendente')`)
    .run(nome, email, bcrypt.hashSync(String(req.body.senha), 10),
      String(req.body.cargo || '').trim(), String(req.body.unidade || '').trim(), iniciais);
  registrarLog(email, 'registro', 'aguardando aprovação');
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json({ ok: true, dados: { usuario: usuarioPublico(usuario) }, erro: null });
});

authRouter.post('/recuperar', (req, res) => {
  const falta = exigir(req.body, ['email']);
  if (falta) return erro(res, 400, falta);
  // Sem SMTP na VM por padrão: registra a solicitação para a coordenação atender.
  registrarLog(String(req.body.email).toLowerCase().trim(), 'recuperar-senha', 'solicitação registrada');
  return ok(res, { mensagem: 'Se o e-mail estiver cadastrado, a coordenação fará contato para redefinir a senha.' });
});

authRouter.get('/eu', autenticar, (req, res) => ok(res, usuarioPublico(req.usuario)));
