import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { ajustarCatalogo, CHAVE_AJUSTES_CATALOGO, PDFS_CATALOGO } from '../src/db/ajustes-catalogo.js';

const origem = JSON.parse(readFileSync(new URL('../src/db/catalogo-origem-20261123.json', import.meta.url), 'utf8'));
function legado() {
  const db = new Database(':memory:');
  db.exec(readFileSync(new URL('../src/db/schema.sql', import.meta.url), 'utf8'));
  for (const m of origem.qualifica) {
    db.prepare('INSERT INTO qualifica_modulos(id,titulo,descricao,aulas) VALUES (?,?,?,?)').run(m.id,m.t,m.d,m.aulas);
    for (const [titulo,tipo,url,fonte] of m.rec) db.prepare('INSERT INTO qualifica_recursos(modulo_id,titulo,tipo,url,fonte) VALUES (?,?,?,?,?)').run(m.id,titulo,tipo,url,fonte);
  }
  for (const p of origem.produtos) db.prepare('INSERT INTO produtos(tipo,ano,titulo,descricao,url) VALUES (?,?,?,?,?)').run(p.tipo,p.ano,p.titulo,p.desc,p.url);
  for (const t of origem.trilhas) db.prepare('INSERT INTO trilhas(id,nome,descricao,modulos) VALUES (?,?,?,?)').run(t.id,t.n,t.d,JSON.stringify(t.mods));
  return db;
}

test('migração reorganiza referências existentes sem perder destinos e deixa somente formação em Qualifica', () => {
  const db=legado();
  ajustarCatalogo(db);
  assert.deepEqual(db.prepare('SELECT titulo FROM qualifica_modulos').all().map(m=>m.titulo),['Curso Introdutório Online']);
  assert.deepEqual(db.prepare('SELECT titulo FROM qualifica_recursos').all().map(m=>m.titulo),['Curso Introdutório Online']);
  const p=db.prepare('SELECT * FROM produtos').all();
  assert.ok(p.some(x=>x.titulo==='Tecnologias em Saúde — Puerpério'));
  assert.ok(p.some(x=>x.titulo==='Portfólio de Cuidados no Puerpério'));
  assert.ok(p.some(x=>x.url==='https://www.sbp.com.br/especiais/reanimacao-/'));
  assert.equal(p.filter(x=>x.url.includes('youtube.com/results')).length,0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM trilhas').get().n,0);
  const backup=JSON.parse(db.prepare('SELECT valor FROM app_meta WHERE chave=?').get(CHAVE_AJUSTES_CATALOGO).valor);
  assert.ok(backup.anteriores.qualifica_recursos.length>20);
  db.close();
});

test('preserva conteúdo editado e cadastrado pela gestão e não desfaz decisões após reinício', () => {
  const db=legado();
  db.prepare("UPDATE qualifica_recursos SET url='https://example.test/revisado' WHERE titulo='Guia do Pré-Natal RS 2024'").run();
  db.prepare("INSERT INTO qualifica_recursos(modulo_id,titulo,tipo,url,fonte) VALUES (1,'Evento da unidade','Evento','https://example.test/evento','NEPeS')").run();
  db.prepare("UPDATE produtos SET url='https://example.test/neonatal' WHERE titulo='Reanimação neonatal — busca de vídeos'").run();
  ajustarCatalogo(db);
  assert.equal(db.prepare("SELECT url FROM qualifica_recursos WHERE titulo='Guia do Pré-Natal RS 2024'").get().url,'https://example.test/revisado');
  assert.ok(db.prepare("SELECT 1 FROM qualifica_recursos WHERE titulo='Evento da unidade'").get());
  assert.ok(db.prepare("SELECT 1 FROM produtos WHERE url='https://example.test/neonatal'").get());
  db.prepare("DELETE FROM produtos WHERE titulo='App SOS Kids'").run();
  const antes=JSON.stringify(db.prepare('SELECT * FROM produtos').all());
  ajustarCatalogo(db);
  assert.equal(JSON.stringify(db.prepare('SELECT * FROM produtos').all()),antes);
  db.close();
});

test('substitui os oito destinos DOCX por PDFs existentes mantendo metadados e originais', () => {
  const db=legado();
  db.prepare("INSERT INTO politicas(id,nome) VALUES (1,'Área')").run();
  PDFS_CATALOGO.forEach((base,i)=>db.prepare('INSERT INTO materiais(politica_id,titulo,tipo,url) VALUES (1,?,?,?)').run('Material '+i,'Formulário',base+'.docx'));
  ajustarCatalogo(db);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM materiais WHERE url LIKE '%.pdf'").get().n,8);
  for (const base of PDFS_CATALOGO) {
    assert.ok(readFileSync(new URL('../../'+base+'.pdf',import.meta.url)).subarray(0,5).equals(Buffer.from('%PDF-')));
    assert.ok(readFileSync(new URL('../../'+base+'.docx',import.meta.url)).length>0);
  }
  const saved=JSON.parse(db.prepare('SELECT valor FROM app_meta WHERE chave=?').get(CHAVE_AJUSTES_CATALOGO).valor);
  assert.equal(saved.anteriores.materiais.length,8);
  db.close();
});
