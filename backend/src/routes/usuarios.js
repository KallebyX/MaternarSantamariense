import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel, usuarioPublico } from '../auth/middleware.js';
import { erro, ok, exigir, emailValido, senhaFraca } from '../lib/http.js';

export const usuariosRouter = Router();
usuariosRouter.use(autenticar);

const PERFIS = ['Profissional', 'Gestor', 'Administrador'];
const SITUACOES = ['Ativo', 'Pendente', 'Desativado'];

const iniciaisDe = nome => String(nome).trim().split(/\s+/).map(p => p[0]).filter(Boolean)
  .slice(0, 2).join('').toUpperCase();

/** Senha provisória legível: 10 caracteres com letras e dígitos. */
function senhaSugerida() {
  const alfabeto = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(10);
  let senha = '';
  for (const b of bytes) senha += alfabeto[b % alfabeto.length];
  return senha.slice(0, 8) + (bytes[0] % 10) + String.fromCharCode(97 + (bytes[1] % 26));
}

const buscar = id => db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);

/**
 * Um Gestor administra a equipe, mas não mexe em contas de Administrador —
 * só outro Administrador faz isso. Devolve mensagem de bloqueio ou null.
 */
function podeGerenciar(autor, alvo) {
  if (autor.perfil === 'Administrador') return null;
  if (alvo.perfil === 'Administrador') return 'Somente um Administrador altera contas de Administrador.';
  return null;
}

// ------------------------------------------------------------- perfil próprio
usuariosRouter.put('/eu', (req, res) => {
  const { nome, cargo, unidade, telefone } = req.body || {};
  db.prepare(`UPDATE usuarios SET nome = COALESCE(?, nome), cargo = COALESCE(?, cargo),
    unidade = COALESCE(?, unidade), telefone = COALESCE(?, telefone) WHERE id = ?`)
    .run(nome?.trim() || null, cargo?.trim() ?? null, unidade?.trim() ?? null,
      telefone?.trim() ?? null, req.usuario.id);
  registrarLog(req.usuario.email, 'atualizar-perfil');
  return ok(res, usuarioPublico(buscar(req.usuario.id)));
});

usuariosRouter.put('/eu/senha', (req, res) => {
  const falta = exigir(req.body, ['senhaAtual', 'senhaNova']);
  if (falta) return erro(res, 400, falta);
  if (!bcrypt.compareSync(req.body.senhaAtual, req.usuario.senha_hash)) {
    return erro(res, 401, 'Senha atual incorreta.');
  }
  const fraca = senhaFraca(req.body.senhaNova);
  if (fraca) return erro(res, 400, fraca);
  // Trocou a provisória: a conta deixa de ser marcada como senha temporária.
  db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = 0 WHERE id = ?')
    .run(bcrypt.hashSync(String(req.body.senhaNova), 10), req.usuario.id);
  registrarLog(req.usuario.email, 'trocar-senha');
  return ok(res, { mensagem: 'Senha atualizada.' });
});

// ------------------------------------------------- gestão da equipe (Gestor+)
usuariosRouter.get('/', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const { perfil = '', situacao = '' } = req.query;
  let usuarios = db.prepare('SELECT * FROM usuarios ORDER BY nome').all().map(usuarioPublico);
  if (perfil && perfil !== 'Todos') usuarios = usuarios.filter(u => u.perfil === perfil);
  if (situacao && situacao !== 'Todas') usuarios = usuarios.filter(u => u.situacao === situacao);
  if (q) usuarios = usuarios.filter(u => (u.nome + ' ' + u.email + ' ' + u.unidade + ' ' + u.cargo).toLowerCase().includes(q));
  return ok(res, usuarios, { total: usuarios.length, perfis: PERFIS, situacoes: SITUACOES });
});

usuariosRouter.get('/:id', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const usuario = buscar(req.params.id);
  if (!usuario) return erro(res, 404, 'Usuário não encontrado.');
  return ok(res, usuarioPublico(usuario));
});

/**
 * Convite da equipe: o Gestor/Admin cadastra o convidado já com a senha que vai
 * repassar (não há SMTP na VM). Sem `senha` no corpo, a API sugere uma e devolve
 * em texto claro uma única vez, aqui na resposta.
 */
usuariosRouter.post('/convite', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['nome', 'email']);
  if (falta) return erro(res, 400, falta);
  const email = String(req.body.email).toLowerCase().trim();
  if (!emailValido(email)) return erro(res, 400, 'E-mail inválido.');
  if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email)) return erro(res, 409, 'E-mail já cadastrado.');

  const perfil = PERFIS.includes(req.body.perfil) ? req.body.perfil : 'Profissional';
  if (perfil === 'Administrador' && req.usuario.perfil !== 'Administrador') {
    return erro(res, 403, 'Somente um Administrador cria contas de Administrador.');
  }

  const senhaDefinida = req.body.senha !== undefined && String(req.body.senha).trim() !== '';
  const senha = senhaDefinida ? String(req.body.senha) : senhaSugerida();
  if (senhaDefinida) {
    const fraca = senhaFraca(senha);
    if (fraca) return erro(res, 400, fraca);
  }
  // trocarSenha=false quando o gestor quer que a senha combinada continue valendo
  const temporaria = req.body.trocarSenha === false ? 0 : 1;
  const nome = String(req.body.nome).trim();

  const info = db.prepare(`INSERT INTO usuarios
    (nome, email, senha_hash, cargo, unidade, telefone, perfil, iniciais, coren, situacao, senha_temporaria)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo', ?)`)
    .run(nome, email, bcrypt.hashSync(senha, 10), String(req.body.cargo || '').trim(),
      String(req.body.unidade || '').trim(), String(req.body.telefone || '').trim(),
      perfil, iniciaisDe(nome), String(req.body.coren || '').trim(), temporaria);
  registrarLog(req.usuario.email, 'convidar-usuario', `${email} (${perfil})`);
  return res.status(201).json({
    ok: true,
    erro: null,
    dados: {
      usuario: usuarioPublico(buscar(info.lastInsertRowid)),
      senha, // texto claro só nesta resposta, para o gestor repassar ao convidado
      senhaDefinidaPeloGestor: senhaDefinida,
      trocaObrigatoria: !!temporaria,
    },
  });
});

/** Redefinição de senha pelo Gestor/Admin (esqueceu a senha, conta nova, etc.). */
usuariosRouter.post('/:id/senha', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);

  const definida = req.body?.senha !== undefined && String(req.body.senha).trim() !== '';
  const senha = definida ? String(req.body.senha) : senhaSugerida();
  if (definida) {
    const fraca = senhaFraca(senha);
    if (fraca) return erro(res, 400, fraca);
  }
  const temporaria = req.body?.trocarSenha === false ? 0 : 1;
  db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = ? WHERE id = ?')
    .run(bcrypt.hashSync(senha, 10), temporaria, alvo.id);
  registrarLog(req.usuario.email, 'definir-senha-usuario', alvo.email);
  return ok(res, { usuario: usuarioPublico(buscar(alvo.id)), senha, trocaObrigatoria: !!temporaria });
});

usuariosRouter.put('/:id', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);

  const campos = { nome: null, cargo: null, unidade: null, telefone: null, coren: null };
  for (const c of Object.keys(campos)) {
    if (req.body?.[c] !== undefined) campos[c] = String(req.body[c]).trim();
  }
  if (req.body?.perfil !== undefined) {
    if (req.usuario.perfil !== 'Administrador') return erro(res, 403, 'Somente um Administrador altera o perfil de acesso.');
    if (!PERFIS.includes(req.body.perfil)) return erro(res, 400, 'Perfil inválido.');
    if (alvo.id === req.usuario.id && req.body.perfil !== 'Administrador') {
      return erro(res, 400, 'Não é possível rebaixar o próprio perfil.');
    }
  }
  if (req.body?.situacao !== undefined) {
    if (!SITUACOES.includes(req.body.situacao)) return erro(res, 400, 'Situação inválida.');
    if (alvo.id === req.usuario.id && req.body.situacao !== 'Ativo') {
      return erro(res, 400, 'Não é possível desativar a própria conta.');
    }
  }

  db.prepare(`UPDATE usuarios SET nome = COALESCE(?, nome), cargo = COALESCE(?, cargo),
      unidade = COALESCE(?, unidade), telefone = COALESCE(?, telefone), coren = COALESCE(?, coren),
      iniciais = CASE WHEN ? IS NULL THEN iniciais ELSE ? END,
      perfil = COALESCE(?, perfil), situacao = COALESCE(?, situacao)
    WHERE id = ?`)
    .run(campos.nome, campos.cargo, campos.unidade, campos.telefone, campos.coren,
      campos.nome, campos.nome ? iniciaisDe(campos.nome) : null,
      req.body?.perfil ?? null, req.body?.situacao ?? null, alvo.id);
  registrarLog(req.usuario.email, 'atualizar-usuario', alvo.email);
  return ok(res, usuarioPublico(buscar(alvo.id)));
});

usuariosRouter.post('/:id/aprovar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const r = db.prepare("UPDATE usuarios SET situacao = 'Ativo' WHERE id = ? AND situacao = 'Pendente'").run(req.params.id);
  if (!r.changes) return erro(res, 404, 'Usuário pendente não encontrado.');
  registrarLog(req.usuario.email, 'aprovar-usuario', req.params.id);
  return ok(res, { mensagem: 'Usuário aprovado.' });
});

usuariosRouter.post('/:id/desativar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return erro(res, 400, 'Não é possível desativar a própria conta.');
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);
  db.prepare("UPDATE usuarios SET situacao = 'Desativado' WHERE id = ?").run(alvo.id);
  registrarLog(req.usuario.email, 'desativar-usuario', alvo.email);
  return ok(res, { mensagem: 'Usuário desativado.' });
});

usuariosRouter.post('/:id/reativar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);
  db.prepare("UPDATE usuarios SET situacao = 'Ativo' WHERE id = ?").run(alvo.id);
  registrarLog(req.usuario.email, 'reativar-usuario', alvo.email);
  return ok(res, { mensagem: 'Usuário reativado.' });
});

usuariosRouter.put('/:id/perfil', exigirPapel('Administrador'), (req, res) => {
  if (!PERFIS.includes(req.body?.perfil)) return erro(res, 400, 'Perfil inválido.');
  if (Number(req.params.id) === req.usuario.id && req.body.perfil !== 'Administrador') {
    return erro(res, 400, 'Não é possível rebaixar o próprio perfil.');
  }
  const r = db.prepare('UPDATE usuarios SET perfil = ? WHERE id = ?').run(req.body.perfil, req.params.id);
  if (!r.changes) return erro(res, 404, 'Usuário não encontrado.');
  registrarLog(req.usuario.email, 'alterar-perfil-usuario', `${req.params.id} → ${req.body.perfil}`);
  return ok(res, { mensagem: 'Perfil atualizado.' });
});

usuariosRouter.delete('/:id', exigirPapel('Administrador'), (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return erro(res, 400, 'Não é possível excluir a própria conta.');
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(alvo.id);
  registrarLog(req.usuario.email, 'excluir-usuario', alvo.email);
  return ok(res, { removido: alvo.id });
});
