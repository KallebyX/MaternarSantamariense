// Popula o banco a partir de backend/seeds/*.json (extraídos do protótipo).
// Idempotente: roda de novo sem duplicar (INSERT OR IGNORE / upsert por chave).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db } from './connection.js';

const here = dirname(fileURLToPath(import.meta.url));
const seedsDir = join(here, '..', '..', 'seeds');
const S = nome => JSON.parse(readFileSync(join(seedsDir, nome + '.json'), 'utf-8'));

// Contadores iniciais de produtos exibidos no protótipo (visualizações, downloads)
const PRODUTO_STATS = [[1240, 386], [890, 214], [1560, 92], [670, 158], [2100, 133], [540, 121]];
const SENHA_DEMO = 'demo1234';

export function seed() {
  const hash = bcrypt.hashSync(SENHA_DEMO, 10);

  const tx = db.transaction(() => {
    // usuários (perfis demo + equipe)
    const insUser = db.prepare(`INSERT OR IGNORE INTO usuarios
      (nome, email, senha_hash, cargo, unidade, perfil, iniciais, coren, situacao, xp, streak, admissao)
      VALUES (@nome, @email, @senha, @cargo, @unidade, @perfil, @iniciais, @coren, @situacao, @xp, @streak, @admissao)`);
    for (const p of Object.values(S('PERFIS'))) {
      insUser.run({ nome: p.nome, email: p.email, senha: hash, cargo: p.cargo, unidade: p.unidade,
        perfil: p.perfil, iniciais: p.iniciais, coren: p.coren || '', situacao: 'Ativo',
        xp: p.xp || 0, streak: p.streak || 0, admissao: p.admissao || '' });
    }
    for (const u of S('USUARIOS')) {
      insUser.run({ nome: u.nome, email: u.email, senha: hash, cargo: '', unidade: u.unidade,
        perfil: u.perfil, iniciais: u.ini, coren: '', situacao: u.situacao === 'Pendente' ? 'Pendente' : 'Ativo',
        xp: 0, streak: 0, admissao: '' });
    }

    // cursos e aulas
    const insCurso = db.prepare(`INSERT OR IGNORE INTO cursos (id, titulo, area, horas, nivel, tag, inscritos, descricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const insAula = db.prepare('INSERT OR IGNORE INTO aulas (curso_id, ordem, titulo, duracao) VALUES (?, ?, ?, ?)');
    for (const c of S('CURSOS')) {
      insCurso.run(c.id, c.titulo, c.area, c.horas, c.nivel, c.tag, c.inscritos, c.desc);
      c.aulas.forEach((a, i) => insAula.run(c.id, i, a.t, a.d));
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
        d.tam, d.views || 0, d.downloads || 0, JSON.stringify(d.tags || []), d.desc || '', d.url || '');
    }

    const temLinks = db.prepare('SELECT COUNT(*) c FROM links').get().c > 0;
    if (!temLinks) {
      const insLink = db.prepare('INSERT INTO links (titulo, url, categoria, descricao) VALUES (?, ?, ?, ?)');
      for (const l of S('LINKS_DATA')) insLink.run(l.t, l.url, l.cat, l.desc);
    }

    const temEventos = db.prepare('SELECT COUNT(*) c FROM eventos').get().c > 0;
    if (!temEventos) {
      const insEv = db.prepare('INSERT INTO eventos (dia, mes, hora, titulo, local, cor) VALUES (?, ?, ?, ?, ?, ?)');
      for (const e of S('EVENTOS')) insEv.run(e.dia, e.dia <= 3 ? 8 : 7, e.hora, e.t, e.local, e.cor);
    }

    const insCanal = db.prepare('INSERT OR IGNORE INTO canais (id, nome, subtitulo) VALUES (?, ?, ?)');
    for (const c of S('CANAIS')) insCanal.run(c.id, c.n, c.sub);
    const temMsg = db.prepare('SELECT COUNT(*) c FROM mensagens').get().c > 0;
    if (!temMsg) {
      const insMsg = db.prepare('INSERT INTO mensagens (canal_id, autor, iniciais, texto, hora) VALUES (?, ?, ?, ?, ?)');
      for (const [canal, msgs] of Object.entries(S('MSGS'))) {
        for (const m of msgs) insMsg.run(canal, m.q, m.i, m.t, m.h);
      }
    }

    // produtos com contadores reais do protótipo
    const temProd = db.prepare('SELECT COUNT(*) c FROM produtos').get().c > 0;
    if (!temProd) {
      const insProd = db.prepare(`INSERT INTO produtos (tipo, ano, titulo, descricao, url, capa, visualizacoes, downloads)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      S('PRODUTOS').forEach((p, i) => {
        const [v, d] = PRODUTO_STATS[i] || [0, 0];
        insProd.run(p.tipo, p.ano, p.titulo, p.desc, p.url, p.capa || '', v, d);
      });
    }

    // conquistas, tarefas, notificações broadcast
    const temConq = db.prepare('SELECT COUNT(*) c FROM conquistas').get().c > 0;
    if (!temConq) {
      const insConq = db.prepare('INSERT INTO conquistas (nome, descricao, cor, nivel) VALUES (?, ?, ?, ?)');
      for (const c of S('CONQUISTAS')) insConq.run(c.nome, c.desc, c.cor, c.n);
    }
    const insTarefa = db.prepare('INSERT OR IGNORE INTO tarefas (id, titulo, prioridade, responsavel, prazo, coluna) VALUES (?, ?, ?, ?, ?, ?)');
    for (const t of S('TAREFAS')) insTarefa.run(t.id, t.titulo, t.prio, t.resp, t.prazo, t.col);
    const temNotif = db.prepare('SELECT COUNT(*) c FROM notificacoes').get().c > 0;
    if (!temNotif) {
      const insNotif = db.prepare('INSERT INTO notificacoes (usuario_id, titulo, texto) VALUES (NULL, ?, ?)');
      for (const n of S('NOTIFS_SEED')) insNotif.run(n.t, n.q);
    }
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
