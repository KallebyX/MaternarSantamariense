// Rotas de conteúdo: políticas/acervo, projetos, protocolos, documentos, links,
// eventos, produtos (com contadores), qualifica e busca global.
import { Router } from 'express';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { erro, ok, exigir } from '../lib/http.js';

export const conteudoRouter = Router();

const comTags = m => ({ ...m, tags: JSON.parse(m.tags || '[]') });

// ---------------------------------------------------------------- políticas
conteudoRouter.get('/politicas', (req, res) => {
  const politicas = db.prepare('SELECT * FROM politicas ORDER BY ordem').all();
  const materiais = db.prepare('SELECT * FROM materiais').all().map(comTags);
  const porPolitica = new Map(politicas.map(p => [p.id, []]));
  for (const m of materiais) porPolitica.get(m.politica_id)?.push(m);
  return ok(res, politicas.map(p => ({ ...p, materiais: porPolitica.get(p.id) })));
});

conteudoRouter.get('/politicas/:id/materiais', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const materiais = db.prepare('SELECT * FROM materiais WHERE politica_id = ?').all(req.params.id)
    .map(comTags)
    .filter(m => !q || m.titulo.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)));
  return ok(res, materiais);
});

conteudoRouter.post('/politicas/:id/materiais', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['titulo', 'url']);
  if (falta) return erro(res, 400, falta);
  if (!db.prepare('SELECT 1 FROM politicas WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Política não encontrada.');
  const info = db.prepare('INSERT INTO materiais (politica_id, titulo, tipo, url, tags) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, req.body.titulo.trim(), String(req.body.tipo || 'Material'), req.body.url.trim(),
      JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []));
  registrarLog(req.usuario.email, 'criar-material', req.body.titulo);
  return res.status(201).json({ ok: true, dados: comTags(db.prepare('SELECT * FROM materiais WHERE id = ?').get(info.lastInsertRowid)), erro: null });
});

// ----------------------------------------------------------------- projetos
conteudoRouter.get('/projetos', (req, res) => {
  const { q = '', status = '' } = req.query;
  let projetos = db.prepare('SELECT * FROM projetos ORDER BY criado_em DESC, id DESC').all();
  if (status && status !== 'Todos') projetos = projetos.filter(p => p.status === status);
  const busca = String(q).toLowerCase();
  if (busca) {
    projetos = projetos.filter(p =>
      [p.titulo, p.responsavel, p.instituicao, p.local].join(' ').toLowerCase().includes(busca));
  }
  return ok(res, projetos, { total: projetos.length });
});

conteudoRouter.post('/projetos', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['titulo', 'responsavel']);
  if (falta) return erro(res, 400, falta);
  const ano = new Date().getFullYear();
  const seq = db.prepare("SELECT COUNT(*) c FROM projetos WHERE id LIKE ?").get(`pq${ano}_%`).c + 1;
  const id = `pq${ano}_n${seq}`;
  db.prepare(`INSERT INTO projetos (id, titulo, responsavel, instituicao, local, inicio, fim, status, autorizacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Ativo', ?)`)
    .run(id, req.body.titulo.trim(), req.body.responsavel.trim(),
      String(req.body.instituicao || 'Instituição não informada').trim(),
      String(req.body.local || 'Rede municipal de saúde').trim(),
      String(req.body.inicio || '—'), String(req.body.fim || '—'),
      `NEPeS reg. nº ${String(seq).padStart(3, '0')}/${ano}`);
  registrarLog(req.usuario.email, 'criar-projeto', req.body.titulo);
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM projetos WHERE id = ?').get(id), erro: null });
});

conteudoRouter.post('/projetos/:id/encerrar', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const r = db.prepare("UPDATE projetos SET status = 'Encerrado' WHERE id = ?").run(req.params.id);
  if (!r.changes) return erro(res, 404, 'Projeto não encontrado.');
  registrarLog(req.usuario.email, 'encerrar-projeto', req.params.id);
  return ok(res, { mensagem: 'Projeto encerrado.' });
});

// ------------------------------------------- protocolos, documentos e links
conteudoRouter.get('/protocolos', (req, res) =>
  ok(res, db.prepare('SELECT * FROM protocolos').all().map(p => ({ ...p, pendente: !!p.pendente }))));

conteudoRouter.get('/documentos', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  let docs = db.prepare('SELECT * FROM documentos ORDER BY criado_em DESC').all().map(comTags);
  if (q) docs = docs.filter(d => (d.titulo + ' ' + d.descricao).toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)));
  return ok(res, docs);
});

conteudoRouter.post('/documentos', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['titulo']);
  if (falta) return erro(res, 400, falta);
  const id = 'd' + Date.now().toString(36);
  db.prepare(`INSERT INTO documentos (id, titulo, tipo, categoria, setor, autor, status, tags, descricao, atualizado)
    VALUES (?, ?, ?, ?, ?, ?, 'Em revisão', ?, ?, date('now'))`)
    .run(id, req.body.titulo.trim(), String(req.body.tipo || 'Documento'), String(req.body.categoria || ''),
      String(req.body.setor || ''), req.usuario.nome,
      JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []), String(req.body.descricao || ''));
  registrarLog(req.usuario.email, 'criar-documento', req.body.titulo);
  return res.status(201).json({ ok: true, dados: comTags(db.prepare('SELECT * FROM documentos WHERE id = ?').get(id)), erro: null });
});

conteudoRouter.get('/links', (req, res) => ok(res, db.prepare('SELECT * FROM links ORDER BY categoria, titulo').all()));

// ------------------------------------------------------------------ eventos
conteudoRouter.get('/eventos', (req, res) => ok(res, db.prepare('SELECT * FROM eventos ORDER BY mes, dia, hora').all()));

conteudoRouter.post('/eventos', autenticar, (req, res) => {
  const falta = exigir(req.body, ['dia', 'hora', 'titulo']);
  if (falta) return erro(res, 400, falta);
  const dia = Number(req.body.dia), mes = Number(req.body.mes || 8);
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return erro(res, 400, 'Dia inválido.');
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return erro(res, 400, 'Mês inválido.');
  const info = db.prepare('INSERT INTO eventos (dia, mes, hora, titulo, local, cor, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(dia, mes, String(req.body.hora), req.body.titulo.trim(),
      String(req.body.local || ''), String(req.body.cor || '#1E4A7A'), req.usuario.id);
  registrarLog(req.usuario.email, 'criar-evento', req.body.titulo);
  return res.status(201).json({ ok: true, dados: db.prepare('SELECT * FROM eventos WHERE id = ?').get(info.lastInsertRowid), erro: null });
});

// -------------------------------------------- produtos PPGSMI e contadores
conteudoRouter.get('/produtos', (req, res) => {
  const produtos = db.prepare('SELECT * FROM produtos ORDER BY ano DESC, id').all();
  const maxDownloads = Math.max(...produtos.map(p => p.downloads), 0);
  return ok(res, produtos.map(p => ({ ...p, maisBaixado: p.downloads === maxDownloads && maxDownloads > 0 })));
});

for (const [rota, coluna] of [['visualizacao', 'visualizacoes'], ['download', 'downloads']]) {
  conteudoRouter.post(`/produtos/:id/${rota}`, (req, res) => {
    const r = db.prepare(`UPDATE produtos SET ${coluna} = ${coluna} + 1 WHERE id = ?`).run(req.params.id);
    if (!r.changes) return erro(res, 404, 'Produto não encontrado.');
    return ok(res, db.prepare('SELECT id, visualizacoes, downloads FROM produtos WHERE id = ?').get(req.params.id));
  });
}

// ---------------------------------------------------------------- qualifica
conteudoRouter.get('/qualifica', (req, res) => {
  const modulos = db.prepare('SELECT * FROM qualifica_modulos ORDER BY id').all();
  const recursos = db.prepare('SELECT * FROM qualifica_recursos').all();
  const trilhas = db.prepare('SELECT * FROM trilhas').all().map(t => ({ ...t, modulos: JSON.parse(t.modulos) }));
  return ok(res, {
    modulos: modulos.map(m => ({ ...m, recursos: recursos.filter(r => r.modulo_id === m.id) })),
    trilhas,
  });
});

// ------------------------------------------------------------- busca global
conteudoRouter.get('/busca', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (q.length < 2) return erro(res, 400, 'Informe pelo menos 2 caracteres em ?q=');
  const resultados = [];
  for (const m of db.prepare(`SELECT m.*, p.nome politica FROM materiais m JOIN politicas p ON p.id = m.politica_id`).all().map(comTags)) {
    if (m.titulo.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q))) {
      resultados.push({ tipo: 'material', titulo: m.titulo, contexto: m.politica, url: m.url });
    }
  }
  for (const c of db.prepare('SELECT * FROM cursos').all()) {
    if (c.titulo.toLowerCase().includes(q)) resultados.push({ tipo: 'curso', titulo: c.titulo, contexto: c.area, url: null, id: c.id });
  }
  for (const d of db.prepare('SELECT * FROM documentos').all().map(comTags)) {
    if (d.titulo.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))) {
      resultados.push({ tipo: 'documento', titulo: d.titulo, contexto: d.setor, id: d.id });
    }
  }
  for (const l of db.prepare('SELECT * FROM links').all()) {
    if (l.titulo.toLowerCase().includes(q)) resultados.push({ tipo: 'link', titulo: l.titulo, contexto: l.categoria, url: l.url });
  }
  for (const p of db.prepare('SELECT * FROM projetos').all()) {
    if ((p.titulo + ' ' + p.responsavel).toLowerCase().includes(q)) {
      resultados.push({ tipo: 'projeto', titulo: p.titulo, contexto: p.autorizacao, id: p.id });
    }
  }
  for (const p of db.prepare('SELECT * FROM produtos').all()) {
    if (p.titulo.toLowerCase().includes(q)) resultados.push({ tipo: 'produto', titulo: p.titulo, contexto: p.tipo, url: p.url, id: p.id });
  }
  return ok(res, resultados.slice(0, 50), { total: resultados.length });
});
