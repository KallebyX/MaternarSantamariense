import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { db } from '../src/db/connection.js';
import { seed } from '../src/db/seed.js';
import { migrarProjetos } from '../src/db/migrar-projetos.js';
import { historicoProjetos, importarProjetosHistoricos } from '../src/db/importar-projetos-historicos.js';

before(() => seed({ demo: false }));

test('547 registros históricos preservam dados da fonte e identidades repetidas sem publicar contatos', () => {
  const projetos = historicoProjetos.projetos;
  assert.equal(projetos.length, 547);
  assert.equal(new Set(projetos.map(p => p.id)).size, 547);
  assert.equal(projetos.filter(p => /_2$/.test(p.id) && /pq202(?:2_56|3_(?:27|32|33))_2$/.test(p.id)).length, 4);
  assert.equal(projetos.filter(p => p.inicio && p.fim).length, 43);
  const periodoInconsistente = projetos.find(p => p.id === 'pq2018_27');
  assert.equal(periodoInconsistente.inicio, '');
  assert.equal(periodoInconsistente.fim, '');
  assert.ok(periodoInconsistente.periodo_origem);
  assert.ok(projetos.some(p => p.situacao_origem === 'não autorizado'));
  assert.ok(projetos.some(p => p.situacao_origem === 'cancelado'));
  assert.ok(projetos.some(p => p.situacao_origem === 'retornou para ajustes'));
  for (const projeto of projetos) {
    assert.equal(projeto.status, 'Histórico');
    assert.equal(projeto.historico, 1);
    assert.ok(projeto.titulo.trim());
    assert.doesNotMatch(JSON.stringify(projeto), /@|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\d{8,}/);
  }
});

test('importação adiciona 547 aos 157 atuais, sem alterar situação administrativa ou datas dos atuais', () => {
  const antes = db.prepare("SELECT * FROM projetos WHERE id='pq2026_55'").get();
  const resumo = importarProjetosHistoricos() || JSON.parse(db.prepare('SELECT valor FROM app_meta WHERE chave=?').get(historicoProjetos.chave).valor);
  assert.equal(resumo.inseridos, 547);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM projetos').get().n, 704);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM projetos WHERE historico=1').get().n, 547);
  const depois = db.prepare("SELECT * FROM projetos WHERE id='pq2026_55'").get();
  assert.deepEqual({ ...depois, ano_referencia: antes.ano_referencia }, antes);
  assert.equal(depois.ano_referencia, 2026);
  const antigo = historicoProjetos.projetos.find(p => p.situacao_origem === 'não autorizado');
  assert.equal(db.prepare('SELECT situacao_origem FROM projetos WHERE id=?').get(antigo.id).situacao_origem, 'não autorizado');
});

test('reinícios não sobrescrevem edições, exclusões nem ano informado pelo administrador', () => {
  const primeiro = historicoProjetos.projetos[0];
  const segundo = historicoProjetos.projetos[1];
  db.prepare('UPDATE projetos SET titulo=?, status=?, ano_referencia=? WHERE id=?').run('Título revisado', 'Encerrado', 2017, primeiro.id);
  db.prepare('DELETE FROM projetos WHERE id=?').run(segundo.id);
  assert.equal(importarProjetosHistoricos(), null);
  assert.deepEqual(db.prepare('SELECT titulo,status,ano_referencia FROM projetos WHERE id=?').get(primeiro.id), { titulo: 'Título revisado', status: 'Encerrado', ano_referencia: 2017 });
  assert.equal(db.prepare('SELECT 1 FROM projetos WHERE id=?').get(segundo.id), undefined);
});

test('primeira execução preserva IDs preexistentes e metadados de ano já preenchidos', () => {
  db.prepare('DELETE FROM app_meta WHERE chave=?').run(historicoProjetos.chave);
  db.prepare("UPDATE projetos SET ano_referencia=2024 WHERE id='pq2026_55'").run();
  const resumo = importarProjetosHistoricos();
  assert.equal(resumo.preservados, 546);
  assert.equal(resumo.inseridos, 1);
  assert.equal(db.prepare("SELECT ano_referencia FROM projetos WHERE id='pq2026_55'").get().ano_referencia, 2024);
  assert.equal(db.prepare('SELECT titulo FROM projetos WHERE id=?').get(historicoProjetos.projetos[0].id).titulo, 'Título revisado');
});

function legado() {
  const banco = new Database(':memory:');
  banco.pragma('foreign_keys=ON');
  banco.exec(`CREATE TABLE projetos(id TEXT PRIMARY KEY,titulo TEXT NOT NULL,status TEXT NOT NULL CHECK (status IN ('Ativo','Encerrado')),extra TEXT DEFAULT 'preservar');
    CREATE INDEX projeto_titulo_extra ON projetos(titulo, extra);
    CREATE TABLE auditoria(valor TEXT);
    CREATE TRIGGER auditar_projeto AFTER UPDATE ON projetos BEGIN INSERT INTO auditoria VALUES(new.titulo); END;
    CREATE VIEW visao_projetos AS SELECT id,titulo FROM projetos;
    INSERT INTO projetos VALUES('editado','Edição administrativa','Encerrado','valor extra');`);
  return banco;
}

test('migração do esquema legado conserva linhas, colunas extras, índices, views e triggers', () => {
  const banco = legado();
  try {
    migrarProjetos(banco);
    migrarProjetos(banco);
    const linha = banco.prepare('SELECT * FROM projetos').get();
    assert.deepEqual(linha, { id: 'editado', titulo: 'Edição administrativa', status: 'Encerrado', extra: 'valor extra', ano_referencia: null, historico: 0, situacao_origem: '', periodo_origem: '' });
    assert.ok(banco.prepare("SELECT 1 FROM sqlite_master WHERE name='projeto_titulo_extra'").get());
    assert.equal(banco.prepare('SELECT titulo FROM visao_projetos').get().titulo, linha.titulo);
    banco.prepare('UPDATE projetos SET titulo=? WHERE id=?').run('Revisão posterior', linha.id);
    assert.equal(banco.prepare('SELECT valor FROM auditoria').get().valor, 'Revisão posterior');
    banco.prepare("INSERT INTO projetos(id,titulo,status,historico) VALUES('hist','Registro da fonte','Histórico',1)").run();
    assert.equal(banco.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  } finally { banco.close(); }
});

test('esquema não previsto provoca rollback completo, preservando referências e colunas anteriores', () => {
  const banco = legado();
  try {
    banco.exec("CREATE TABLE referencia(projeto_id TEXT REFERENCES projetos(id) ON DELETE CASCADE); INSERT INTO referencia VALUES('editado')");
    assert.throws(() => migrarProjetos(banco), /referência externa não prevista/);
    assert.equal(banco.prepare('SELECT COUNT(*) n FROM referencia').get().n, 1);
    assert.equal(banco.prepare("SELECT 1 FROM pragma_table_info('projetos') WHERE name='historico'").get(), undefined);
    assert.equal(banco.prepare('SELECT titulo FROM visao_projetos').get().titulo, 'Edição administrativa');
  } finally { banco.close(); }
});
