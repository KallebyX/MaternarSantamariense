import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { assinarToken } from '../src/auth/middleware.js';
import { avisosRouter } from '../src/routes/avisos.js';
import { migrarPermissoes } from '../src/db/permissoes.js';
import { criarApp } from '../src/app.js';

const app = express(); app.use(express.json()); app.use('/api', avisosRouter);
let admin, gestor, autor, outro, leitor;
const auth = (req, u) => req.set('Authorization', 'Bearer ' + assinarToken(u));
function criar(nome, perfil = 'Profissional') {
  const info = db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES (?,?,?,?,'Ativo')")
    .run(nome, nome + '@avisos.example', bcrypt.hashSync('Teste12345', 4), perfil);
  return db.prepare('SELECT * FROM usuarios WHERE id=?').get(info.lastInsertRowid);
}
before(() => {
  migrarPermissoes(db); migrarPermissoes(db);
  admin = criar('Administrador', 'Administrador'); gestor = criar('Gestor', 'Gestor');
  autor = criar('Responsavel'); outro = criar('OutroResponsavel'); leitor = criar('Leitor');
});

test('somente administrador concede publicação por órgão, sem elevar perfil', async () => {
  const url = '/api/usuarios/' + autor.id + '/comunicacao';
  const corpo = { publicar_avisos: true, orgao: 'NEPeS' };
  assert.equal((await request(app).put(url).send(corpo)).status, 401);
  assert.equal((await auth(request(app).put(url), gestor).send(corpo)).status, 403);
  assert.equal((await auth(request(app).put(url), autor).send(corpo)).status, 403);
  for (const dados of [{ publicar_avisos: 'true', orgao: 'NEPeS' }, { publicar_avisos: true, orgao: '' }, { publicar_avisos: true, orgao: 'Outro órgão' }]) {
    assert.equal((await auth(request(app).put(url), admin).send(dados)).status, 400);
  }
  const r = await auth(request(app).put(url), admin).send(corpo);
  assert.equal(r.status, 200); assert.equal(r.body.dados.perfil, 'Profissional');
  assert.equal(r.body.dados.publicar_avisos, 1); assert.equal(r.body.dados.orgao, 'NEPeS');
  await auth(request(app).put('/api/usuarios/' + outro.id + '/comunicacao'), admin).send({ publicar_avisos: true, orgao: 'Políticas de Saúde' });
});

test('delegado gerencia somente próprios avisos e órgão é confirmado no servidor', async () => {
  assert.equal((await auth(request(app).post('/api/notificacoes'), leitor).send({ titulo: 'Sem permissão' })).status, 403);
  const a = await auth(request(app).post('/api/notificacoes'), autor).send({ titulo: 'Aviso do Nepes', texto: 'Encontro da rede', orgao: 'Superintendência da APS', autor_id: outro.id });
  assert.equal(a.status, 201); assert.equal(a.body.dados.autor_id, autor.id); assert.equal(a.body.dados.orgao, 'NEPeS');
  const id = a.body.dados.id;
  await auth(request(app).post('/api/notificacoes'), outro).send({ titulo: 'Outro aviso' });
  assert.equal((await auth(request(app).get('/api/notificacoes/todas'), autor)).body.dados.length, 1);
  assert.equal((await auth(request(app).get('/api/notificacoes/todas'), leitor)).status, 403);
  assert.equal((await auth(request(app).put('/api/notificacoes/' + id), outro).send({ titulo: 'Invasão' })).status, 403);
  assert.equal((await auth(request(app).delete('/api/notificacoes/' + id), outro)).status, 403);
  assert.equal((await auth(request(app).post('/api/notificacoes/' + id + '/lida'), leitor)).status, 200);
  const atualiza = await auth(request(app).put('/api/notificacoes/' + id), autor).send({ texto: 'Horário corrigido' });
  assert.equal(atualiza.status, 200); assert.ok(atualiza.body.dados.atualizado_em);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM notificacoes_lidas WHERE notificacao_id=?').get(id).n, 0);
  assert.equal((await auth(request(app).delete('/api/notificacoes/' + id), gestor)).status, 200);
});

test('avisos individuais só aparecem para destinatário; revogar delegação tem efeito imediato', async () => {
  const r = await auth(request(app).post('/api/notificacoes'), autor).send({ titulo: 'Individual', usuario_id: leitor.id });
  assert.equal(r.status, 201); const id = r.body.dados.id;
  const naoDestinatario = await auth(request(app).get('/api/notificacoes'), outro);
  assert.ok(!naoDestinatario.body.dados.some(n => n.id === id));
  assert.equal((await auth(request(app).post('/api/notificacoes/' + id + '/lida'), outro)).status, 404);
  assert.ok((await auth(request(app).get('/api/notificacoes'), leitor)).body.dados.some(n => n.id === id));
  assert.equal((await auth(request(app).post('/api/notificacoes'), autor).send({ titulo: 'Inválido', usuario_id: -1 })).status, 400);
  await auth(request(app).put('/api/usuarios/' + autor.id + '/comunicacao'), admin).send({ publicar_avisos: false, orgao: '' });
  assert.equal((await auth(request(app).post('/api/notificacoes'), autor).send({ titulo: 'Revogado' })).status, 403);
  assert.equal((await auth(request(app).put('/api/notificacoes/' + id), autor).send({ titulo: 'Revogado' })).status, 403);
});

test('aplicação integrada não oferece bypass por CRUD antigo nem delegação pelo perfil', async () => {
  const integrada = criarApp();
  const privada = await auth(request(integrada).post('/api/notificacoes'), gestor)
    .send({ titulo: 'Somente destinatário', texto: 'Comunicado restrito', usuario_id: leitor.id });
  assert.equal(privada.status, 201);
  const id = privada.body.dados.id;
  assert.equal((await request(integrada).get('/api/notificacoes')).status, 401);
  assert.equal((await request(integrada).get('/api/notificacoes/todas')).status, 401);
  assert.equal((await request(integrada).get('/api/notificacoes/' + id)).status, 404);
  assert.equal((await auth(request(integrada).get('/api/notificacoes/' + id), outro)).status, 404);
  assert.equal((await auth(request(integrada).get('/api/notificacoes/todas'), leitor)).status, 403);
  assert.equal((await auth(request(integrada).put('/api/notificacoes/999999'), leitor).send({ titulo: 'Negado' })).status, 403);
  assert.equal((await auth(request(integrada).delete('/api/notificacoes/999999'), leitor)).status, 403);
  const avisosOutro = await auth(request(integrada).get('/api/notificacoes/todas'), outro);
  assert.equal(avisosOutro.status, 200);
  assert.ok(!avisosOutro.body.dados.some(n => n.id === id));
  assert.equal((await auth(request(integrada).put('/api/notificacoes/' + id), outro).send({ titulo: 'Tentativa' })).status, 403);
  assert.equal((await auth(request(integrada).delete('/api/notificacoes/' + id), outro)).status, 403);
  assert.equal((await auth(request(integrada).post('/api/notificacoes/' + id + '/lida'), outro)).status, 404);
  // A rota geral de perfil nunca deve permitir autoconcessão dos novos campos.
  const perfil = await auth(request(integrada).put('/api/usuarios/eu'), leitor)
    .send({ publicar_avisos: true, orgao: 'NEPeS', equipe_agenda: 'Equipe restrita' });
  assert.equal(perfil.status, 200);
  assert.equal(perfil.body.dados.publicar_avisos, 0);
  assert.equal(perfil.body.dados.orgao, '');
  assert.notEqual(perfil.body.dados.equipe_agenda, 'Equipe restrita');
  assert.equal((await auth(request(integrada).post('/api/notificacoes'), leitor).send({ titulo: 'Autoconcessão' })).status, 403);
  assert.equal((await auth(request(integrada).get('/api/usuarios'), outro)).status, 403);
  assert.equal((await auth(request(integrada).put('/api/usuarios/' + leitor.id + '/comunicacao'), outro)
    .send({ publicar_avisos: true, orgao: 'NEPeS' })).status, 403);
});
