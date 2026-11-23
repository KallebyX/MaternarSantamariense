import { Router } from 'express';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel, usuarioPublico } from '../auth/middleware.js';
import { ok, erro } from '../lib/http.js';
import { ORGAOS_COMUNICADOS, gestao, podePublicarAvisos, podeGerenciarAviso } from '../lib/permissoes.js';

export const avisosRouter = Router();

// A delegação não concede gestão de usuários, projetos, cursos ou arquivos.
avisosRouter.put('/usuarios/:id/comunicacao', autenticar, exigirPapel('Administrador'), (req, res) => {
  const { publicar_avisos, orgao } = req.body || {};
  if (typeof publicar_avisos !== 'boolean' || !['', ...ORGAOS_COMUNICADOS].includes(orgao)) return erro(res, 400, 'Informe a permissão e um órgão válido.');
  if (publicar_avisos && !orgao) return erro(res, 400, 'Selecione o órgão responsável pelos comunicados.');
  const alvo = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!alvo) return erro(res, 404, 'Usuário não encontrado.');
  db.prepare('UPDATE usuarios SET publicar_avisos = ?, orgao = ? WHERE id = ?').run(publicar_avisos ? 1 : 0, orgao, alvo.id);
  registrarLog(req.usuario.email, 'delegar-comunicados', `${alvo.id}: ${publicar_avisos ? orgao : 'revogado'}`);
  return ok(res, usuarioPublico(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(alvo.id)));
});

avisosRouter.get('/notificacoes/todas', autenticar, (req, res) => {
  if (!podePublicarAvisos(req.usuario)) return erro(res, 403, 'Você não tem permissão para publicar avisos.');
  const todas = gestao(req.usuario);
  return ok(res, db.prepare(`SELECT n.*, u.nome destinatario FROM notificacoes n
    LEFT JOIN usuarios u ON u.id = n.usuario_id ${todas ? '' : 'WHERE n.autor_id = ?'} ORDER BY n.id DESC`)
    .all(...(todas ? [] : [req.usuario.id])));
});

avisosRouter.get('/notificacoes', autenticar, (req, res) => {
  const linhas = db.prepare(`SELECT n.*, (nl.notificacao_id IS NOT NULL) lida
    FROM notificacoes n LEFT JOIN notificacoes_lidas nl ON nl.notificacao_id = n.id AND nl.usuario_id = ?
    WHERE n.usuario_id IS NULL OR n.usuario_id = ? ORDER BY n.id DESC`).all(req.usuario.id, req.usuario.id);
  return ok(res, linhas.map(n => ({ ...n, lida: !!n.lida })));
});

function validarAviso(corpo, usuario, atual = {}) {
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return { problema: 'Comunicado inválido.' };
  const titulo = corpo.titulo ?? atual.titulo;
  const texto = corpo.texto ?? atual.texto ?? '';
  if (typeof titulo !== 'string' || !titulo.trim() || titulo.length > 180) return { problema: 'Informe um título com até 180 caracteres.' };
  if (typeof texto !== 'string' || texto.length > 10000) return { problema: 'A mensagem deve ter até 10.000 caracteres.' };
  const bruto = corpo.usuario_id === undefined ? atual.usuario_id : corpo.usuario_id;
  if (bruto !== null && bruto !== undefined && bruto !== '' && !['number', 'string'].includes(typeof bruto)) return { problema: 'Destinatário inválido ou inativo.' };
  const usuario_id = bruto === null || bruto === undefined || bruto === '' ? null : Number(bruto);
  if (usuario_id !== null && (!Number.isSafeInteger(usuario_id) || usuario_id < 1 || !db.prepare("SELECT 1 FROM usuarios WHERE id = ? AND situacao = 'Ativo'").get(usuario_id))) return { problema: 'Destinatário inválido ou inativo.' };
  const orgao = gestao(usuario) ? (corpo.orgao ?? atual.orgao ?? usuario.orgao ?? '') : usuario.orgao;
  if (!['', ...ORGAOS_COMUNICADOS].includes(orgao)) return { problema: 'Órgão inválido.' };
  return { dados: { titulo: titulo.trim(), texto: texto.trim(), usuario_id, orgao } };
}

avisosRouter.post('/notificacoes', autenticar, (req, res) => {
  if (!podePublicarAvisos(req.usuario)) return erro(res, 403, 'Você não tem permissão para publicar avisos.');
  const { dados, problema } = validarAviso(req.body, req.usuario);
  if (problema) return erro(res, 400, problema);
  const info = db.prepare('INSERT INTO notificacoes(titulo,texto,usuario_id,autor_id,orgao) VALUES (?,?,?,?,?)')
    .run(dados.titulo, dados.texto, dados.usuario_id, req.usuario.id, dados.orgao);
  registrarLog(req.usuario.email, 'criar-notificacoes', String(info.lastInsertRowid));
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(info.lastInsertRowid), erro: null });
});

avisosRouter.put('/notificacoes/:id', autenticar, (req, res) => {
  if (!podePublicarAvisos(req.usuario)) return erro(res, 403, 'Você não tem permissão para publicar avisos.');
  const atual = db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(req.params.id);
  if (!atual) return erro(res, 404, 'Aviso não encontrado.');
  if (!podeGerenciarAviso(req.usuario, atual)) return erro(res, 403, 'Você só pode alterar seus próprios avisos.');
  if (!['titulo', 'texto', 'usuario_id', 'orgao'].some(c => req.body?.[c] !== undefined)) return erro(res, 400, 'Envie ao menos um campo para atualizar.');
  const { dados, problema } = validarAviso(req.body, req.usuario, atual);
  if (problema) return erro(res, 400, problema);
  db.transaction(() => {
    db.prepare("UPDATE notificacoes SET titulo=?,texto=?,usuario_id=?,orgao=?,atualizado_em=datetime('now') WHERE id=?")
      .run(dados.titulo, dados.texto, dados.usuario_id, dados.orgao, atual.id);
    // Uma alteração deve voltar a aparecer como nova para quem já havia lido.
    db.prepare('DELETE FROM notificacoes_lidas WHERE notificacao_id = ?').run(atual.id);
  })();
  registrarLog(req.usuario.email, 'atualizar-notificacoes', String(atual.id));
  return ok(res, db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(atual.id));
});

avisosRouter.delete('/notificacoes/:id', autenticar, (req, res) => {
  if (!podePublicarAvisos(req.usuario)) return erro(res, 403, 'Você não tem permissão para publicar avisos.');
  const atual = db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(req.params.id);
  if (!atual) return erro(res, 404, 'Aviso não encontrado.');
  if (!podeGerenciarAviso(req.usuario, atual)) return erro(res, 403, 'Você só pode excluir seus próprios avisos.');
  db.prepare('DELETE FROM notificacoes WHERE id = ?').run(atual.id);
  registrarLog(req.usuario.email, 'remover-notificacoes', String(atual.id));
  return ok(res, { removido: String(atual.id) });
});

avisosRouter.post('/notificacoes/:id/lida', autenticar, (req, res) => {
  if (!db.prepare('SELECT 1 FROM notificacoes WHERE id = ? AND (usuario_id IS NULL OR usuario_id = ?)').get(req.params.id, req.usuario.id)) return erro(res, 404, 'Notificação não encontrada.');
  db.prepare('INSERT OR IGNORE INTO notificacoes_lidas(usuario_id,notificacao_id) VALUES (?,?)').run(req.usuario.id, req.params.id);
  return ok(res, { mensagem: 'Notificação marcada como lida.' });
});
