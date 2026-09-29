// Inicializa o acervo e catálogos sem criar pessoas ou atividades de demonstração.
// Idempotente: roda de novo sem duplicar (INSERT OR IGNORE / upsert por chave).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';
import { atualizarCatalogo } from './catalogo.js';
import { normalizarCatalogo } from './normalizar-catalogo.js';
import { revisarCatalogoUx } from './revisao-ux.js';
import { importarAcervoDrive } from './importar-drive.js';
import { importarProjetosHistoricos } from './importar-projetos-historicos.js';

const here = dirname(fileURLToPath(import.meta.url));
const seedsDir = join(here, '..', '..', 'seeds');
const S = nome => JSON.parse(readFileSync(join(seedsDir, nome + '.json'), 'utf-8'));

export function seed({ demo = false } = {}) {
  if (demo) throw new Error('Dados de teste não são permitidos no seed da aplicação.');
  const tx = db.transaction(() => {
    if (db.prepare("SELECT 1 FROM app_meta WHERE chave = 'conteudo-inicial'").get()) {
      atualizarCatalogo();
      normalizarCatalogo();
      revisarCatalogoUx();
      importarAcervoDrive();
      importarProjetosHistoricos();
      return;
    }
    // qualifica (módulos, recursos, trilhas)
    const tipos = S('QUAL_TIPO');
    const insMod = db.prepare(`INSERT OR IGNORE INTO qualifica_modulos (id, titulo, descricao, aulas, duracao, nivel, cor, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const insRec = db.prepare('INSERT INTO qualifica_recursos (modulo_id, titulo, tipo, url, fonte) VALUES (?, ?, ?, ?, ?)');
    const temRec = db.prepare('SELECT COUNT(*) c FROM qualifica_recursos').get().c > 0;
    for (const q of S('QUALIFICA')) {
      insMod.run(q.id, q.t, q.d, q.aulas, q.dur, q.nivel, q.cor, tipos[q.id] || 'Capacitações livres');
      if (!temRec) for (const [titulo, tipo, url, fonte] of q.rec || []) insRec.run(q.id, titulo, tipo, url, fonte);
    }
    const insTrilha = db.prepare('INSERT OR IGNORE INTO trilhas (id, nome, descricao, modulos) VALUES (?, ?, ?, ?)');
    for (const t of S('TRILHAS')) insTrilha.run(t.id, t.n, t.d, JSON.stringify(t.mods));

    // políticas e materiais (acervo real)
    const insPol = db.prepare('INSERT OR IGNORE INTO politicas (nome, cor, descricao, ordem) VALUES (?, ?, ?, ?)');
    const getPol = db.prepare('SELECT id FROM politicas WHERE nome = ?');
    const insMat = db.prepare('INSERT INTO materiais (politica_id, titulo, tipo, url, tags) VALUES (?, ?, ?, ?, ?)');
    const temMat = db.prepare('SELECT COUNT(*) c FROM materiais').get().c > 0;
    S('POLITICAS').forEach((p, i) => {
      insPol.run(p.n, p.cor, p.d, i);
      if (!temMat) {
        const polId = getPol.get(p.n).id;
        for (const [titulo, tipo, url, tags] of p.mats) insMat.run(polId, titulo, tipo, url, JSON.stringify(tags));
      }
    });

    // projetos de pesquisa (registro real NEPeS 2025/2026)
    const insProj = db.prepare(`INSERT OR IGNORE INTO projetos (id, titulo, responsavel, instituicao, local, inicio, fim, status, autorizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of S('PROJETOS_PESQ')) {
      insProj.run(p.id, p.titulo, p.resp, p.inst, p.local, p.ini, p.fim, p.status, p.autorizacao);
    }

    // protocolos, documentos, links, eventos, canais, mensagens
    const insProt = db.prepare(`INSERT OR IGNORE INTO protocolos (id, nome, versao, setor, atualizado, paginas, prazo, pendente, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of S('PROTOCOLOS')) insProt.run(p.id, p.nome, p.versao, p.setor, p.atualizado, p.paginas, p.prazo, p.pendente ? 1 : 0, p.url || '');

    const insDoc = db.prepare(`INSERT OR IGNORE INTO documentos
      (id, titulo, tipo, categoria, setor, autor, status, versao, atualizado, expira, tamanho, visualizacoes, downloads, tags, descricao, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const d of S('DOCS')) {
      insDoc.run(d.id, d.titulo, d.tipo, d.cat, d.setor, d.autor, d.status, d.versao, d.mod, d.expira,
        d.tam, 0, 0, JSON.stringify(d.tags || []), d.desc || '', d.url || '');
    }

    const temLinks = db.prepare('SELECT COUNT(*) c FROM links').get().c > 0;
    if (!temLinks) {
      const insLink = db.prepare('INSERT INTO links (titulo, url, categoria, descricao) VALUES (?, ?, ?, ?)');
      for (const l of S('LINKS_DATA')) insLink.run(l.t, l.url, l.cat, l.desc);
    }

    const insCanal = db.prepare('INSERT OR IGNORE INTO canais (id, nome, subtitulo) VALUES (?, ?, ?)');
    for (const c of S('CANAIS')) insCanal.run(c.id, c.n, c.sub);
    // produtos: contadores começam em zero e recebem ações reais
    const temProd = db.prepare('SELECT COUNT(*) c FROM produtos').get().c > 0;
    if (!temProd) {
      const insProd = db.prepare(`INSERT INTO produtos (tipo, ano, titulo, descricao, url, capa, visualizacoes, downloads)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      S('PRODUTOS').forEach(p => {
        insProd.run(p.tipo, p.ano, p.titulo, p.desc, p.url, p.capa || '', 0, 0);
      });
    }

    db.prepare("INSERT INTO app_meta (chave, valor) VALUES ('conteudo-inicial', '1')").run();
    atualizarCatalogo();
    normalizarCatalogo();
    revisarCatalogoUx();
    importarAcervoDrive();
    importarProjetosHistoricos();
  });
  tx();

  const contagens = {};
  for (const t of ['usuarios', 'cursos', 'aulas', 'politicas', 'materiais', 'projetos', 'produtos', 'documentos', 'links', 'eventos', 'mensagens']) {
    contagens[t] = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
  }
  return contagens;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Seed concluído:', seed());
}
