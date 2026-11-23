import { Router } from 'express';
import multer from 'multer';
import { AREAS_PROFISSIONAIS } from '../db/comunicacao.js';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel, usuarioPublico, assinarToken } from '../auth/middleware.js';
import { erro, ok, exigir, emailValido, senhaFraca, validarTextos } from '../lib/http.js';
import { enviarAcesso } from '../lib/email.js';

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
  const invalido = validarTextos(req.body, ['nome', 'cargo', 'unidade', 'telefone', 'formacao']);
  if (invalido) return erro(res, 400, invalido);
  const { nome, cargo, unidade, telefone, formacao, area } = req.body || {};
  if (area !== undefined && !AREAS_PROFISSIONAIS.includes(area)) return erro(res, 400, 'Área profissional inválida.');
  db.prepare(`UPDATE usuarios SET nome = COALESCE(?, nome), cargo = COALESCE(?, cargo),
    unidade = COALESCE(?, unidade), telefone = COALESCE(?, telefone), formacao = COALESCE(?, formacao), area = COALESCE(?, area), iniciais = COALESCE(?, iniciais) WHERE id = ?`)
    .run(nome === undefined ? null : String(nome).trim() || null, cargo === undefined ? null : String(cargo).trim(), unidade === undefined ? null : String(unidade).trim(),
      telefone === undefined ? null : String(telefone).trim(), formacao === undefined ? null : String(formacao).trim(), area ?? null, nome === undefined ? null : iniciaisDe(nome), req.usuario.id);
  registrarLog(req.usuario.email, 'atualizar-perfil');
  return ok(res, usuarioPublico(buscar(req.usuario.id)));
});

// Fotos ficam no banco privado; o diretório as entrega apenas a sessões ativas.
const receberFoto = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 } }).single('foto');
function tipoFoto(bytes) {
  const dimensoesValidas = (largura, altura) => largura > 0 && altura > 0 && largura <= 4096 && altura <= 4096;
  if (bytes.length >= 33 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.subarray(12,16).toString() === 'IHDR') {
    return dimensoesValidas(bytes.readUInt32BE(16),bytes.readUInt32BE(20)) ? 'image/png' : null;
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes.at(-2) === 255 && bytes.at(-1) === 217) {
    let pos = 2;
    while (pos + 4 <= bytes.length) {
      if (bytes[pos++] !== 255) return null;
      while (pos < bytes.length && bytes[pos] === 255) pos++;
      if (pos + 2 >= bytes.length) return null;
      const marcador = bytes[pos++];
      if (marcador === 217 || marcador === 218) break;
      const tamanho = bytes.readUInt16BE(pos);
      if (tamanho < 2 || pos + tamanho > bytes.length) return null;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marcador)) {
        if (tamanho < 8) return null;
        return dimensoesValidas(bytes.readUInt16BE(pos+5),bytes.readUInt16BE(pos+3)) ? 'image/jpeg' : null;
      }
      pos += tamanho;
    }
    return null;
  }
  if (bytes.length >= 30 && bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP' && bytes.readUInt32LE(4) + 8 === bytes.length) {
    const formato = bytes.subarray(12,16).toString();
    let largura = 0, altura = 0;
    if (formato === 'VP8X') {
      largura = bytes.readUIntLE(24,3)+1; altura = bytes.readUIntLE(27,3)+1;
    } else if (formato === 'VP8L' && bytes[20] === 47) {
      largura = 1 + bytes[21] + ((bytes[22]&63)<<8);
      altura = 1 + ((bytes[22]&192)>>6) + (bytes[23]<<2) + ((bytes[24]&15)<<10);
    } else if (formato === 'VP8 ' && bytes.subarray(23,26).equals(Buffer.from([157,1,42]))) {
      largura = bytes.readUInt16LE(26)&16383; altura = bytes.readUInt16LE(28)&16383;
    }
    return dimensoesValidas(largura,altura) ? 'image/webp' : null;
  }
  return null;
}
usuariosRouter.post('/eu/foto', (req, res) => {
  receberFoto(req, res, error => {
    if (error) return erro(res, error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, error.code === 'LIMIT_FILE_SIZE' ? 'A foto deve ter até 2 MB.' : 'Envie somente uma foto no campo foto.');
    if (!req.file) return erro(res, 400, 'Selecione uma foto.');
    const tipo = tipoFoto(req.file.buffer);
    if (!tipo || tipo !== req.file.mimetype) return erro(res, 400, 'Use uma imagem JPG, PNG ou WebP válida, com até 4096 pixels por lado.');
    const foto = `data:${tipo};base64,${req.file.buffer.toString('base64')}`;
    const versao = createHash('sha256').update(foto).digest('hex').slice(0,20);
    db.prepare('UPDATE usuarios SET foto=?,foto_versao=? WHERE id=?').run(foto, versao, req.usuario.id);
    registrarLog(req.usuario.email, 'atualizar-foto-perfil');
    return ok(res, usuarioPublico(buscar(req.usuario.id)));
  });
});
usuariosRouter.delete('/eu/foto', (req, res) => {
  db.prepare("UPDATE usuarios SET foto='',foto_versao='' WHERE id=?").run(req.usuario.id);
  registrarLog(req.usuario.email, 'remover-foto-perfil');
  return ok(res, usuarioPublico(buscar(req.usuario.id)));
});

usuariosRouter.put('/eu/senha', (req, res) => {
  const falta = exigir(req.body, ['senhaAtual', 'senhaNova']);
  if (falta) return erro(res, 400, falta);
  if (!bcrypt.compareSync(String(req.body.senhaAtual), req.usuario.senha_hash)) {
    return erro(res, 400, 'Senha atual incorreta.');
  }
  const fraca = senhaFraca(req.body.senhaNova);
  if (fraca) return erro(res, 400, fraca);
  // Trocou a provisória: a conta deixa de ser marcada como senha temporária.
  db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = 0, token_version = token_version + 1 WHERE id = ?')
    .run(bcrypt.hashSync(String(req.body.senhaNova), 10), req.usuario.id);
  registrarLog(req.usuario.email, 'trocar-senha');
  const usuario = buscar(req.usuario.id);
  return ok(res, { mensagem: 'Senha atualizada.', token: assinarToken(usuario), usuario: usuarioPublico(usuario) });
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
 * repassar. Sem `senha` no corpo, a API sugere uma e devolve
 * em texto claro uma única vez, aqui na resposta.
 */
usuariosRouter.post('/convite', exigirPapel('Gestor', 'Administrador'), async (req, res, next) => {
  try {
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
    (nome, email, senha_hash, cargo, unidade, telefone, perfil, iniciais, coren, situacao, senha_temporaria, formacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo', ?, ?)`)
    .run(nome, email, bcrypt.hashSync(senha, 10), String(req.body.cargo || '').trim(),
      String(req.body.unidade || '').trim(), String(req.body.telefone || '').trim(),
      perfil, iniciaisDe(nome), String(req.body.coren || '').trim(), temporaria, String(req.body.formacao || '').trim());
  registrarLog(req.usuario.email, 'convidar-usuario', `${email} (${perfil})`);
  const usuario = buscar(info.lastInsertRowid);
  const emailEnvio = req.body.enviarEmail === true ? await enviarAcesso(usuario, req.usuario.email) : null;
  return res.status(201).json({
    ok: true,
    erro: null,
    dados: {
      usuario: usuarioPublico(buscar(info.lastInsertRowid)),
      senha, // texto claro só nesta resposta, para o gestor repassar ao convidado
      senhaDefinidaPeloGestor: senhaDefinida,
      trocaObrigatoria: !!temporaria,
      emailEnvio,
    },
  });
  } catch (error) { next(error); }
});

usuariosRouter.post('/:id/enviar-acesso', exigirPapel('Gestor', 'Administrador'), async (req, res, next) => {
  try {
    const alvo = buscar(req.params.id);
    if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
    const bloqueio = podeGerenciar(req.usuario, alvo);
    if (bloqueio) return erro(res, 403, bloqueio);
    const resultado = await enviarAcesso(alvo, req.usuario.email);
    return resultado.enviado ? ok(res, resultado) : erro(res, 422, resultado.mensagem);
  } catch (error) { next(error); }
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
  db.prepare('UPDATE usuarios SET senha_hash = ?, senha_temporaria = ?, token_version = token_version + 1 WHERE id = ?')
    .run(bcrypt.hashSync(senha, 10), temporaria, alvo.id);
  registrarLog(req.usuario.email, 'definir-senha-usuario', alvo.email);
  return ok(res, { usuario: usuarioPublico(buscar(alvo.id)), senha, trocaObrigatoria: !!temporaria });
});

usuariosRouter.put('/:id', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);

  const campos = { nome: null, cargo: null, unidade: null, telefone: null, coren: null, formacao: null };
  const invalido = validarTextos(req.body, Object.keys(campos));
  if (invalido) return erro(res, 400, invalido);
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
      unidade = COALESCE(?, unidade), telefone = COALESCE(?, telefone), coren = COALESCE(?, coren), formacao = COALESCE(?, formacao),
      iniciais = CASE WHEN ? IS NULL THEN iniciais ELSE ? END,
      perfil = COALESCE(?, perfil), situacao = COALESCE(?, situacao), token_version = token_version + ?
    WHERE id = ?`)
    .run(campos.nome, campos.cargo, campos.unidade, campos.telefone, campos.coren, campos.formacao,
      campos.nome, campos.nome ? iniciaisDe(campos.nome) : null,
      req.body?.perfil ?? null, req.body?.situacao ?? null,
      req.body?.situacao !== undefined && req.body.situacao !== alvo.situacao ? 1 : 0, alvo.id);
  registrarLog(req.usuario.email, 'atualizar-usuario', alvo.email);
  return ok(res, usuarioPublico(buscar(alvo.id)));
});

usuariosRouter.post('/:id/aprovar', exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const alvo = buscar(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário pendente não encontrado.');
  const bloqueio = podeGerenciar(req.usuario, alvo);
  if (bloqueio) return erro(res, 403, bloqueio);
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
  db.prepare("UPDATE usuarios SET situacao = 'Desativado', token_version = token_version + 1 WHERE id = ?").run(alvo.id);
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
