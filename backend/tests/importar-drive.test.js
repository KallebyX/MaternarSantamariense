import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { db } from '../src/db/connection.js';
import { seed } from '../src/db/seed.js';
import { catalogoDrive, importarAcervoDrive } from '../src/db/importar-drive.js';

before(() => seed({ demo: false }));

test('os 13 arquivos novos correspondem integralmente à fonte Drive por tamanho e SHA-256', () => {
  assert.equal(catalogoDrive.materiais.length, 13);
  assert.equal(new Set(catalogoDrive.materiais.map(m => m.driveId)).size, 13);
  for (const material of catalogoDrive.materiais) {
    const arquivo = readFileSync(new URL('../../' + material.url, import.meta.url));
    assert.equal(arquivo.length, material.bytes, material.titulo);
    assert.equal(createHash('sha256').update(arquivo).digest('hex'), material.sha256, material.titulo);
  }
});

test('importação preenche acervo e documentos com os 7 protocolos, sem criar cursos ou declarar aprovação', () => {
  const resumo = importarAcervoDrive() || JSON.parse(db.prepare('SELECT valor FROM app_meta WHERE chave=?').get(catalogoDrive.chave).valor);
  assert.equal(resumo.materiais, 13);
  assert.equal(resumo.documentos, 13);
  assert.equal(resumo.protocolos, 7);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM cursos').get().n, 0);
  for (const m of catalogoDrive.materiais) {
    assert.equal(db.prepare('SELECT COUNT(*) n FROM materiais WHERE url=?').get(m.url).n, 1);
    assert.equal(db.prepare('SELECT status FROM documentos WHERE url=?').get(m.url).status, 'Em revisão');
    if (m.tipo === 'Protocolo') assert.equal(db.prepare('SELECT pendente FROM protocolos WHERE url=?').get(m.url).pendente, 1);
  }
});

test('reinícios conservam edição e remoção administrativa sem duplicar ou recriar material', () => {
  const primeiro = catalogoDrive.materiais[0];
  const segundo = catalogoDrive.materiais[1];
  db.prepare('UPDATE materiais SET titulo=?, url=? WHERE url=?').run('Título revisado pela equipe', '/arquivo-revisado.pdf', primeiro.url);
  db.prepare('DELETE FROM materiais WHERE url=?').run(segundo.url);
  assert.equal(importarAcervoDrive(), null);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM materiais WHERE titulo=?').get('Título revisado pela equipe').n, 1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM materiais WHERE url=?').get(segundo.url).n, 0);
});

test('reconhece fonte Drive já cadastrada, mantém associações em áreas distintas e área renomeada', () => {
  db.prepare('DELETE FROM app_meta WHERE chave=?').run(catalogoDrive.chave);
  for (const m of catalogoDrive.materiais) {
    db.prepare('DELETE FROM materiais WHERE url=? OR titulo=?').run(m.url, 'Título revisado pela equipe');
    db.prepare('DELETE FROM documentos WHERE url=?').run(m.url);
    db.prepare('DELETE FROM protocolos WHERE url=?').run(m.url);
  }
  const m = catalogoDrive.materiais[0];
  const politica = db.prepare('SELECT id FROM politicas WHERE nome=?').get(m.politica);
  const outra = db.prepare('SELECT id FROM politicas WHERE nome=?').get('Saúde da Criança');
  const url = `https://drive.google.com/file/d/${m.driveId}/view`;
  db.prepare('INSERT INTO materiais(politica_id,titulo,tipo,url) VALUES (?,?,?,?)').run(politica.id, 'Revisado', 'Guia', url);
  db.prepare('INSERT INTO materiais(politica_id,titulo,tipo,url) VALUES (?,?,?,?)').run(outra.id, 'Compartilhado', 'Guia', m.url);
  db.prepare('UPDATE politicas SET nome=? WHERE id=?').run('PICS revisada', politica.id);
  const resumo = importarAcervoDrive();
  assert.equal(resumo.materiais, 12);
  assert.equal(db.prepare('SELECT titulo FROM materiais WHERE politica_id=? AND url=?').get(politica.id, url).titulo, 'Revisado');
  assert.equal(db.prepare('SELECT titulo FROM materiais WHERE politica_id=? AND url=?').get(outra.id, m.url).titulo, 'Compartilhado');
});

test('falha na identificação de área desfaz a importação inteira e não grava sucesso parcial', () => {
  db.prepare('DELETE FROM app_meta WHERE chave=?').run(catalogoDrive.chave);
  db.prepare("DELETE FROM politicas WHERE nome='Alimentação e Nutrição'").run();
  const antes = db.prepare('SELECT COUNT(*) n FROM materiais').get().n;
  assert.throws(() => importarAcervoDrive(), /Não foi possível identificar a área/);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM materiais').get().n, antes);
  assert.equal(db.prepare('SELECT 1 FROM app_meta WHERE chave=?').get(catalogoDrive.chave), undefined);
});
