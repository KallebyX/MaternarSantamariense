import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { config } from '../config.js';
import { erro } from '../lib/http.js';

export function assinarToken(usuario) {
  return jwt.sign({ id: usuario.id, perfil: usuario.perfil }, config.jwtSecret, { expiresIn: config.jwtExpira });
}

export function usuarioPublico(u) {
  const { senha_hash, ...resto } = u;
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
  if (usuario.situacao !== 'Ativo') return erro(res, 403, 'Conta pendente de aprovação ou desativada.');
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
