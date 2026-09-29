// Rotas de conteúdo: políticas/acervo, projetos, protocolos, documentos, links,
// eventos, produtos (com contadores), qualifica e busca global.
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { db, registrarLog } from '../db/connection.js';
import { autenticar, exigirPapel } from '../auth/middleware.js';
import { erro, ok, exigir, urlValida, tagsValidas } from '../lib/http.js';
import { cursosPublicados } from '../lib/cursos.js';

export const conteudoRouter = Router();

conteudoRouter.get('/resumo', (req, res) => ok(res, { profissionais: db.prepare("SELECT COUNT(*) n FROM usuarios WHERE situacao = 'Ativo'").get().n }));

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
  if (!urlValida(req.body.url)) return erro(res, 400, 'Endereço inválido.');
  if (req.body.tags !== undefined && !tagsValidas(req.body.tags)) return erro(res, 400, 'Etiquetas inválidas.');
  if (!db.prepare('SELECT 1 FROM politicas WHERE id = ?').get(req.params.id)) return erro(res, 404, 'Política não encontrada.');
  const info = db.prepare('INSERT INTO materiais (politica_id, titulo, tipo, url, tags) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, String(req.body.titulo).trim(), String(req.body.tipo || 'Material'), String(req.body.url).trim(),
      JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []));
  registrarLog(req.usuario.email, 'criar-material', req.body.titulo);
  return res.status(201).json({ ok: true, dados: comTags(db.prepare('SELECT * FROM materiais WHERE id = ?').get(info.lastInsertRowid)), erro: null });
});

// ----------------------------------------------------------------- projetos
conteudoRouter.get('/projetos', (req, res) => {
  const campos = ['q', 'ano', 'status', 'instituicao', 'escopo', 'situacao_origem', 'pagina', 'limite'];
  if (campos.some(c => req.query[c] !== undefined && typeof req.query[c] !== 'string')) return erro(res, 400, 'Filtro de projetos inválido.');
  const { q = '', ano = '', status = '', instituicao = '', escopo = '', situacao_origem = '' } = req.query;
  if (!['', 'atuais', 'historicos'].includes(escopo)) return erro(res, 400, 'Escolha registros atuais ou históricos.');
  if (ano && ano !== 'sem-ano' && !/^\d{4}$/.test(ano)) return erro(res, 400, 'Ano de referência inválido.');
  const paginado = req.query.pagina !== undefined || req.query.limite !== undefined;
  const paginaSolicitada = Number(req.query.pagina ?? 1), limite = Number(req.query.limite ?? 24);
  if (!Number.isSafeInteger(paginaSolicitada) || paginaSolicitada < 1 || !Number.isSafeInteger(limite) || limite < 1 || limite > 100) return erro(res, 400, 'Paginação inválida. Use uma página positiva e até 100 registros por página.');
  const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  const todos = db.prepare('SELECT * FROM projetos ORDER BY criado_em DESC, id DESC').all()
    .map(p => ({ ...p, historico: !!p.historico }))
    .sort((a, b) => Number(a.historico) - Number(b.historico) || (b.ano_referencia || 0) - (a.ano_referencia || 0) || a.titulo.localeCompare(b.titulo, 'pt-BR') || a.id.localeCompare(b.id));
  const opcoesDe = campo => [...new Map(todos.filter(p => String(p[campo] ?? '').trim()).map(p => [normalizar(p[campo]), String(p[campo]).trim()])).values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const termos = normalizar(q).split(' ').filter(Boolean);
  const projetos = todos.filter(p =>
    (!ano || (ano === 'sem-ano' ? !p.ano_referencia : String(p.ano_referencia) === ano)) &&
    (!status || status === 'Todos' || p.status === status) &&
    (!instituicao || normalizar(p.instituicao) === normalizar(instituicao)) &&
    (!situacao_origem || normalizar(p.situacao_origem) === normalizar(situacao_origem)) &&
    (!escopo || p.historico === (escopo === 'historicos')) &&
    termos.every(termo => normalizar([p.titulo, p.responsavel, p.instituicao, p.local].join(' ')).includes(termo)));
  const total = projetos.length, paginas = Math.max(1, Math.ceil(total / limite));
  const pagina = Math.min(paginaSolicitada, paginas);
  return ok(res, paginado ? projetos.slice((pagina - 1) * limite, pagina * limite) : projetos, {
    total, totalGeral: todos.length, pagina: paginado ? pagina : 1,
    paginas: paginado ? paginas : 1, limite: paginado ? limite : total,
    opcoes: { anos: [...new Set(todos.map(p => p.ano_referencia).filter(Boolean))].sort((a, b) => b - a), semAno: todos.some(p => !p.ano_referencia),
      instituicoes: opcoesDe('instituicao'), situacoes: opcoesDe('status'), situacoesOrigem: opcoesDe('situacao_origem') },
  });
});

conteudoRouter.post('/projetos', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['titulo', 'responsavel']);
  if (falta) return erro(res, 400, falta);
  const ano = new Date().getFullYear();
  const id = `pq${ano}_${randomUUID()}`;
  db.prepare(`INSERT INTO projetos (id, titulo, responsavel, instituicao, local, inicio, fim, status, autorizacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Ativo', ?)`)
    .run(id, String(req.body.titulo).trim(), String(req.body.responsavel).trim(),
      String(req.body.instituicao || 'Instituição não informada').trim(),
      String(req.body.local || 'Rede municipal de saúde').trim(),
      String(req.body.inicio || '—'), String(req.body.fim || '—'),
      String(req.body.autorizacao || ''));
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
  if (req.body.url !== undefined && !urlValida(req.body.url)) return erro(res, 400, 'Endereço inválido.');
  if (req.body.tags !== undefined && !tagsValidas(req.body.tags)) return erro(res, 400, 'Etiquetas inválidas.');
  const id = 'd' + randomUUID();
  const status = ['Aprovado', 'Em revisão', 'Vencido'].includes(req.body.status) ? req.body.status : 'Em revisão';
  db.prepare(`INSERT INTO documentos
      (id, titulo, tipo, categoria, setor, autor, status, versao, expira, tamanho, tags, descricao, url, atualizado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, String(req.body.titulo).trim(), String(req.body.tipo || 'Documento'), String(req.body.categoria || ''),
      String(req.body.setor || ''), String(req.body.autor || req.usuario.nome), status,
      String(req.body.versao || ''), String(req.body.expira || ''), String(req.body.tamanho || ''),
      JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []), String(req.body.descricao || ''),
      String(req.body.url || ''),
      String(req.body.atualizado || new Date().toISOString().slice(0, 10)));
  registrarLog(req.usuario.email, 'criar-documento', req.body.titulo);
  return res.status(201).json({ ok: true, dados: comTags(db.prepare('SELECT * FROM documentos WHERE id = ?').get(id)), erro: null });
});

conteudoRouter.get('/links', (req, res) => ok(res, db.prepare('SELECT * FROM links ORDER BY categoria, titulo').all()));

// ------------------------------------------------------------------ eventos
conteudoRouter.get('/eventos', (req, res) => ok(res, db.prepare('SELECT * FROM eventos ORDER BY ano, mes, dia, hora').all()));

conteudoRouter.post('/eventos', autenticar, exigirPapel('Gestor', 'Administrador'), (req, res) => {
  const falta = exigir(req.body, ['dia', 'hora', 'titulo']);
  if (falta) return erro(res, 400, falta);
  const dia = Number(req.body.dia), mes = Number(req.body.mes || 8);
  if (!Number.isInteger(dia) || dia < 1 || dia > 31) return erro(res, 400, 'Dia inválido.');
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return erro(res, 400, 'Mês inválido.');
  const ano = Number(req.body.ano || new Date().getFullYear());
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100 || new Date(ano, mes - 1, dia).getMonth() !== mes - 1) return erro(res, 400, 'Data inválida.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(req.body.hora))) return erro(res, 400, 'Horário inválido.');
  const info = db.prepare('INSERT INTO eventos (dia, mes, hora, titulo, local, cor, criado_por, ano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(dia, mes, String(req.body.hora), String(req.body.titulo).trim(),
      String(req.body.local || ''), String(req.body.cor || '#1E4A7A'), req.usuario.id, ano);
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
  for (const c of cursosPublicados()) {
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
