import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, registrarLog } from '../db/connection.js';
import { assinarToken, autenticar, usuarioPublico } from './middleware.js';
import { erro, ok, exigir, emailValido, senhaFraca } from '../lib/http.js';
import { emailConfigurado, enviarAcesso, hashToken } from '../lib/email.js';

export const authRouter = Router();

// Rate limit simples de login por IP (10 tentativas / 5 min)
const tentativas = new Map();
const JANELA_MS = 5 * 60 * 1000;
const MAX_TENTATIVAS = 10;
function limitado(ip) {
  const agora = Date.now();
  const registro = tentativas.get(ip) || { inicio: agora, n: 0 };
  if (agora - registro.inicio > JANELA_MS) { registro.inicio = agora; registro.n = 0; }
  if (tentativas.size > 1000) for (const [chave, valor] of tentativas) { if (agora - valor.inicio > JANELA_MS) tentativas.delete(chave); }
  registro.n++;
  tentativas.set(ip, registro);
  return registro.n > MAX_TENTATIVAS;
}

authRouter.post('/login', (req, res) => {
  if (limitado(req.ip + ':' + String(req.body?.email || '').toLowerCase().trim())) return erro(res, 429, 'Muitas tentativas. Aguarde alguns minutos.');
  const falta = exigir(req.body, ['email', 'senha']);
  if (falta) return erro(res, 400, falta);
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(String(req.body.email).toLowerCase().trim());
  if (!usuario || !bcrypt.compareSync(String(req.body.senha), usuario.senha_hash)) {
    return erro(res, 401, 'E-mail ou senha incorretos.');
  }
  if (usuario.situacao === 'Pendente') return erro(res, 403, 'Cadastro aguardando aprovação da coordenação.');
  if (usuario.situacao === 'Desativado') return erro(res, 403, 'Conta desativada. Procure a coordenação.');
  tentativas.delete(req.ip + ':' + usuario.email);
  registrarLog(usuario.email, 'login');
  return ok(res, { token: assinarToken(usuario), usuario: usuarioPublico(usuario) });
});

authRouter.post('/registro', (req, res) => {
  if (limitado('registro:' + req.ip)) return erro(res, 429, 'Muitas solicitações. Aguarde alguns minutos.');
  const falta = exigir(req.body, ['nome', 'email', 'senha']);
  if (falta) return erro(res, 400, falta);
  const email = String(req.body.email).toLowerCase().trim();
  if (!emailValido(email)) return erro(res, 400, 'E-mail inválido.');
  const fraca = senhaFraca(req.body.senha);
  if (fraca) return erro(res, 400, fraca);
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

authRouter.post('/recuperar', async (req, res, next) => {
  const falta = exigir(req.body, ['email']);
  if (falta) return erro(res, 400, falta);
  if (!emailValido(req.body.email)) return erro(res, 400, 'E-mail inválido.');
  if (limitado('recuperar:' + req.ip)) return erro(res, 429, 'Muitas solicitações. Aguarde alguns minutos.');
  if (!emailConfigurado()) return erro(res, 503, 'Envio de e-mail indisponível. Solicite a redefinição à coordenação.');
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const usuario = db.prepare("SELECT * FROM usuarios WHERE email = ? AND situacao = 'Ativo'").get(email);
    if (usuario) await enviarAcesso(usuario, email, 'recuperacao');
    // A mesma resposta para contas ausentes, pendentes, desativadas ou limitadas.
    return ok(res, { mensagem: 'Se houver uma conta ativa com esse e-mail, você receberá um link válido por 1 hora. Confira também o spam.' });
  } catch (error) { next(error); }
});

authRouter.post('/redefinir', (req, res) => {
  if (limitado('redefinir:' + req.ip)) return erro(res, 429, 'Muitas solicitações. Aguarde alguns minutos.');
  if (typeof req.body?.token !== 'string' || !/^[a-f0-9]{64}$/.test(req.body.token)) return erro(res, 400, 'Link inválido ou expirado. Solicite outro e-mail de acesso.');
  const fraca = senhaFraca(req.body.senhaNova);
  if (fraca) return erro(res, 400, fraca);
  const usuario = db.transaction(() => {
    const acesso = db.prepare('SELECT * FROM acessos_email WHERE token_hash = ? AND usado_em IS NULL AND enviado = 1 AND expira_em > ?').get(hashToken(req.body.token), Date.now());
    if (!acesso) return null;
    const alvo = db.prepare("SELECT * FROM usuarios WHERE id = ? AND situacao = 'Ativo' AND token_version = ?").get(acesso.usuario_id, acesso.token_version);
    if (!alvo) return null;
    db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = 0, token_version = token_version + 1 WHERE id = ?').run(bcrypt.hashSync(String(req.body.senhaNova), 10), alvo.id);
    db.prepare('UPDATE acessos_email SET usado_em = ? WHERE usuario_id = ? AND usado_em IS NULL').run(Date.now(), alvo.id);
    return alvo;
  })();
  if (!usuario) return erro(res, 400, 'Link inválido ou expirado. Solicite outro e-mail de acesso.');
  registrarLog(usuario.email, 'redefinir-senha-email');
  return ok(res, { mensagem: 'Senha atualizada. Entre com seu e-mail e a nova senha.' });
});

authRouter.post('/logout', autenticar, (req, res) => {
  db.prepare('UPDATE usuarios SET token_version = token_version + 1 WHERE id = ?').run(req.usuario.id);
  return ok(res, { mensagem: 'Sessão encerrada.' });
});

authRouter.get('/eu', autenticar, (req, res) => ok(res, usuarioPublico(req.usuario)));
