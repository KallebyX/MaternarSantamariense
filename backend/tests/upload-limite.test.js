import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import request from 'supertest';

// Limite menor no processo isolado do teste; exercita o mesmo caminho do
// limite de 64 MB da produção sem criar um arquivo grande a cada execução.
process.env.UPLOAD_MAX_MB = '1';
const { criarApp } = await import('../src/app.js');
const { seed } = await import('./fixtures/seed.js');
const { config } = await import('../src/config.js');
const app = criarApp();
let token;
before(async () => {
  seed();
  const r = await request(app).post('/api/auth/login').send({ email: 'maria.rocha@maternarsm.com.br', senha: 'demo1234' });
  token = r.body.dados.token;
});

test('upload acima do limite retorna 413 e não deixa arquivo parcial', async () => {
  const antes = readdirSync(config.uploadDir);
  const r = await request(app).post('/api/arquivos').set('Authorization', 'Bearer ' + token)
    .attach('arquivo', Buffer.alloc(2 * 1024 * 1024), 'grande.pdf');
  assert.equal(r.status, 413);
  assert.match(r.body.erro, /limite de 1 MB/);
  assert.deepEqual(readdirSync(config.uploadDir), antes);
});

test('campo de upload inesperado retorna 400 e preserva a disponibilidade da API', async () => {
  const r = await request(app).post('/api/arquivos').set('Authorization', 'Bearer ' + token)
    .attach('campo-incorreto', Buffer.from('%PDF-1.4'), 'teste.pdf');
  assert.equal(r.status, 400);
  assert.equal((await request(app).get('/api/saude')).status, 200);
  assert.deepEqual(readdirSync(config.uploadDir), []);
});
