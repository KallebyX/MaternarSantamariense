import { readFileSync } from 'node:fs';
import { db } from './connection.js';

const anteriores = JSON.parse(readFileSync(new URL('./catalogo-anterior.json', import.meta.url), 'utf8'));
const ler = nome => JSON.parse(readFileSync(new URL('../../seeds/' + nome + '.json', import.meta.url), 'utf8'));

/** Corrige somente registros herdados que ainda correspondem à fonte anterior. */
export function normalizarCatalogo() {
  const chave = 'catalogo-operacional-20260929';
  if (db.prepare('SELECT 1 FROM app_meta WHERE chave = ?').get(chave)) return;
  const preservados = {};
  function guardar(tabela, linha) { (preservados[tabela] ??= []).push(linha); }
  const produtos = ler('PRODUTOS');
  anteriores.PRODUTOS.forEach((antigo, i) => {
    const linha = db.prepare('SELECT * FROM produtos WHERE titulo = ? AND descricao = ?').get(antigo.titulo, antigo.desc);
    const novo = produtos[i];
    if (!linha || ![antigo.url, novo.url].includes(linha.url)) return;
    guardar('produtos', linha);
    db.prepare('UPDATE produtos SET titulo=?,descricao=?,tipo=?,ano=?,capa=? WHERE id=?')
      .run(novo.titulo,novo.desc,novo.tipo,novo.ano,novo.capa,linha.id);
  });
  db.prepare("UPDATE produtos SET ano=0 WHERE titulo='ToolNurse — UFN' AND url='https://toolnurse.ufn.edu.br/' AND ano=2026").run();
  const canais = ler('CANAIS');
  for (const antigo of anteriores.CANAIS) {
    const linha = db.prepare('SELECT * FROM canais WHERE id=? AND nome=? AND subtitulo=?').get(antigo.id,antigo.n,antigo.sub);
    if (!linha) continue;
    const novo = canais.find(c => c.id === antigo.id);
    guardar('canais',linha);
    db.prepare('UPDATE canais SET nome=?,subtitulo=? WHERE id=?').run(novo.n,novo.sub,linha.id);
  }
  for (const antigo of anteriores.QUALIFICA) {
    const linha = db.prepare('SELECT * FROM qualifica_modulos WHERE id=? AND titulo=? AND aulas=? AND duracao=?').get(antigo.id,antigo.t,antigo.aulas,antigo.dur);
    if (!linha) continue;
    guardar('qualifica_modulos',linha);
    db.prepare("UPDATE qualifica_modulos SET aulas=(SELECT COUNT(*) FROM qualifica_recursos WHERE modulo_id=?),duracao='',nivel='',tipo='Capacitações livres' WHERE id=?").run(linha.id,linha.id);
  }
  // Não declarar aprovação, revisão ou vigência sem registro da coordenação.
  for (const antigo of anteriores.DOCS) {
    const linha = db.prepare('SELECT * FROM documentos WHERE id=? AND titulo=? AND url=? AND atualizado=? AND status=?')
      .get(antigo.id,antigo.titulo,antigo.url,antigo.mod,antigo.status);
    if (!linha) continue;
    guardar('documentos',linha);
    db.prepare("UPDATE documentos SET status='Em revisão',versao='',atualizado='',expira='' WHERE id=?").run(linha.id);
  }
  for (const antigo of anteriores.PROTOCOLOS) {
    const linha = db.prepare('SELECT * FROM protocolos WHERE id=? AND nome=? AND url=? AND atualizado=?')
      .get(antigo.id,antigo.nome,antigo.url,antigo.atualizado);
    if (!linha) continue;
    guardar('protocolos',linha);
    db.prepare("UPDATE protocolos SET versao='',atualizado='',prazo='',pendente=1 WHERE id=?").run(linha.id);
  }
  // Exclusão autorizada dos cursos demonstrativos; preservar qualquer uso real.
  for (const antigo of anteriores.CURSOS) {
    const linha = db.prepare('SELECT * FROM cursos WHERE id=? AND titulo=? AND descricao=?').get(antigo.id,antigo.titulo,antigo.desc);
    if (!linha) continue;
    const aulas = db.prepare('SELECT * FROM aulas WHERE curso_id=? ORDER BY ordem').all(linha.id);
    if (aulas.length !== antigo.aulas.length || aulas.some((a,i) => a.url || a.titulo !== antigo.aulas[i].t)) continue;
    if (db.prepare('SELECT 1 FROM progresso WHERE curso_id=?').get(linha.id) || db.prepare('SELECT 1 FROM certificados WHERE curso_id=?').get(linha.id)) continue;
    guardar('cursos',{...linha,aulas});
    db.prepare('DELETE FROM cursos WHERE id=?').run(linha.id);
  }
  for (const c of anteriores.CONQUISTAS) {
    const linha = db.prepare('SELECT * FROM conquistas WHERE nome=? AND descricao=? AND nivel=?').get(c.nome,c.desc,c.n);
    if (!linha) continue;
    guardar('conquistas',linha);
    db.prepare('DELETE FROM conquistas WHERE id=?').run(linha.id);
  }
  db.prepare('INSERT INTO app_meta(chave,valor) VALUES (?,?)').run(chave,JSON.stringify({em:new Date().toISOString(),anteriores:preservados}));
}
