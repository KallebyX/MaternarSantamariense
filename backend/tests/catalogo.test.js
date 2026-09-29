import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { db } from '../src/db/connection.js';
import { seed } from '../src/db/seed.js';
import { criarApp } from '../src/app.js';
import { TOOLNURSE, URL_COREN } from '../src/db/catalogo.js';

const app = criarApp();
before(() => seed({ demo: false }));

test('catálogo real mantém os seis produtos e acrescenta ToolNurse em produtos, links e busca', async () => {
  const produtos = (await request(app).get('/api/produtos')).body.dados;
  assert.equal(produtos.length, 7);
  assert.equal(produtos.filter(p => p.url === TOOLNURSE.url).length, 1);
  assert.equal((await request(app).get('/api/links')).body.dados.filter(p => p.url === TOOLNURSE.url).length, 1);
  assert.equal((await request(app).get('/api/busca?q=ToolNurse')).body.dados.length, 2);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM usuarios').get().n, 0);
});

test('links do COREN e atalhos internos apontam para destinos corrigidos', async () => {
  assert.equal(db.prepare("SELECT url FROM produtos WHERE titulo='Protocolos Municipais de Enfermagem — COREN-RS'").get().url, URL_COREN);
  assert.equal(db.prepare("SELECT url FROM qualifica_recursos WHERE titulo='Protocolos de Enfermagem COREN-RS'").get().url, URL_COREN);
  assert.equal(db.prepare("SELECT url FROM links WHERE titulo='Portal interno Maternar'").get().url, '/app#inicio');
  assert.equal(db.prepare("SELECT url FROM links WHERE titulo='Suporte técnico da plataforma'").get().url, '/app#mensagens');
  assert.equal(db.prepare("SELECT url FROM links WHERE titulo='TelessaúdeRS — UFRGS'").get().url, 'https://telessauders.ufrgs.br/');
});

test('reinício não duplica ToolNurse nem desfaz edição ou remoção posterior', () => {
  seed({ demo: false });
  assert.equal(db.prepare('SELECT COUNT(*) n FROM produtos').get().n, 7);
  db.prepare('UPDATE produtos SET url = ? WHERE titulo = ?').run('https://example.org/revisado', TOOLNURSE.titulo);
  db.prepare('DELETE FROM links WHERE titulo = ?').run(TOOLNURSE.titulo);
  seed({ demo: false });
  assert.equal(db.prepare('SELECT url FROM produtos WHERE titulo = ?').get(TOOLNURSE.titulo).url, 'https://example.org/revisado');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM links WHERE titulo = ?').get(TOOLNURSE.titulo).n, 0);
});
