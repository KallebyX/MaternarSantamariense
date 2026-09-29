import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { config } from '../config.js';
import { erro } from '../lib/http.js';

export function assinarToken(usuario) {
  return jwt.sign({ id: usuario.id, perfil: usuario.perfil, versao: usuario.token_version || 0 }, config.jwtSecret, { expiresIn: config.jwtExpira });
}

export function usuarioPublico(u) {
  const { senha_hash, token_version, ...resto } = u;
  return resto;
}

/** Exige Authorization: Bearer <token>; anexa req.usuario. */
export function autenticar(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return erro(res, 401, 'Token de acesso ausente.');
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return erro(res, 401, 'Token inválido ou expirado.');
  }
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(payload.id);
  if (!usuario) return erro(res, 401, 'Usuário não encontrado.');
  if ((payload.versao || 0) !== usuario.token_version) return erro(res, 401, 'Sessão encerrada. Entre novamente.');
  if (usuario.situacao !== 'Ativo') return erro(res, 403, 'Conta pendente de aprovação ou desativada.');
  if (usuario.senha_temporaria && !['/api/auth/eu', '/api/auth/logout', '/api/usuarios/eu/senha'].includes(req.originalUrl.split('?')[0])) {
    return erro(res, 403, 'Troque sua senha provisória no perfil para continuar.');
  }
  req.usuario = usuario;
  next();
}

/** Restringe a rota aos perfis informados (Gestor, Administrador). */
export function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (!req.usuario) return erro(res, 401, 'Não autenticado.');
    if (!papeis.includes(req.usuario.perfil)) {
      return erro(res, 403, 'Acesso restrito aos perfis: ' + papeis.join(', ') + '.');
    }
    next();
  };
}
