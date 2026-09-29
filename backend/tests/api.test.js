// Testes da API — banco em memória (NODE_ENV=test força :memory: no config)
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { db } from '../src/db/connection.js';
import { seed } from './fixtures/seed.js';

let app;
let tokenProfissional;
let tokenGestor;
let tokenAdmin;

async function login(email) {
  const r = await request(app).post('/api/auth/login').send({ email, senha: 'demo1234' });
  assert.equal(r.status, 200, `login ${email}: ${JSON.stringify(r.body)}`);
  return r.body.dados.token;
}

before(async () => {
  seed();
  db.prepare("UPDATE aulas SET url = 'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf'").run();
  db.prepare('UPDATE cursos SET publicado=1').run();
  app = criarApp();
  tokenProfissional = await login('ana.ferraz@maternarsm.com.br');
  tokenGestor = await login('maria.rocha@maternarsm.com.br');
  tokenAdmin = await login('kalleby@maternarsm.com.br');
});

test('saúde responde ok sem autenticação', async () => {
  const r = await request(app).get('/api/saude');
  assert.equal(r.status, 200);
  assert.equal(r.body.dados.status, 'ok');
});

test('login falha com senha errada', async () => {
  const r = await request(app).post('/api/auth/login')
    .send({ email: 'ana.ferraz@maternarsm.com.br', senha: 'errada123' });
  assert.equal(r.status, 401);
});

test('usuário pendente não consegue logar', async () => {
  const r = await request(app).post('/api/auth/login')
    .send({ email: 'rafael.nunes@maternarsm.com.br', senha: 'demo1234' });
  assert.equal(r.status, 403);
});

test('registro cria conta pendente e gestor aprova', async () => {
  const reg = await request(app).post('/api/auth/registro')
    .send({ nome: 'Teste da Silva', email: 'teste@maternarsm.com.br', senha: 'senha12345', unidade: 'UBS Centro' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.dados.usuario.situacao, 'Pendente');

  const bloqueado = await request(app).post('/api/auth/login')
    .send({ email: 'teste@maternarsm.com.br', senha: 'senha12345' });
  assert.equal(bloqueado.status, 403);

  const id = reg.body.dados.usuario.id;
  const aprova = await request(app).post(`/api/usuarios/${id}/aprovar`)
    .set('Authorization', `Bearer ${tokenGestor}`);
  assert.equal(aprova.status, 200);

  const agora = await request(app).post('/api/auth/login')
    .send({ email: 'teste@maternarsm.com.br', senha: 'senha12345' });
  assert.equal(agora.status, 200);
});

test('rotas de gestão exigem papel', async () => {
  const negado = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenProfissional}`);
  assert.equal(negado.status, 403);
  const okGestor = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenGestor}`);
  assert.equal(okGestor.status, 200);
  assert.ok(okGestor.body.dados.length >= 8);
});

test('políticas trazem as 17 áreas com materiais do acervo', async () => {
  const r = await request(app).get('/api/politicas');
  assert.equal(r.status, 200);
  assert.equal(r.body.dados.length, 17);
  const mulher = r.body.dados.find(p => p.nome === 'Saúde da Mulher');
  assert.ok(mulher.materiais.length >= 20);
  assert.ok(mulher.materiais.some(m => m.url.startsWith('acervo/')));
});

test('materiais filtram por tag', async () => {
  const politicas = (await request(app).get('/api/politicas')).body.dados;
  const mulher = politicas.find(p => p.nome === 'Saúde da Mulher');
  const r = await request(app).get(`/api/politicas/${mulher.id}/materiais?q=htlv`);
  assert.equal(r.status, 200);
  assert.ok(r.body.dados.length >= 2);
});

test('projetos reais do NEPeS com filtro e busca', async () => {
  const todos = await request(app).get('/api/projetos');
  assert.equal(todos.status, 200);
  assert.equal(todos.body.meta.total, 704);
  const historicos = await request(app).get('/api/projetos?escopo=historicos');
  assert.equal(historicos.body.meta.total, 547);
  const busca = await request(app).get('/api/projetos?q=aleitamento');
  assert.ok(busca.body.meta.total > 0);
  const ativos = await request(app).get('/api/projetos?status=Ativo');
  assert.ok(ativos.body.meta.total < todos.body.meta.total && ativos.body.meta.total > 0);
});

test('gestor cadastra projeto sem inventar autorização NEPeS', async () => {
  const r = await request(app).post('/api/projetos')
    .set('Authorization', `Bearer ${tokenGestor}`)
    .send({ titulo: 'Projeto de teste', responsavel: 'Prof. Teste' });
  assert.equal(r.status, 201);
  assert.equal(r.body.dados.autorizacao, '');
});

test('fluxo completo: concluir aulas → emitir certificado → verificar público', async () => {
  const curso = (await request(app).get('/api/cursos/c5')).body.dados; // 3 aulas
  const bloqueado = await request(app).post('/api/certificados')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ cursoId: 'c5' });
  assert.equal(bloqueado.status, 422);

  for (let i = 0; i < curso.aulas.length; i++) {
    const r = await request(app).post(`/api/cursos/c5/aulas/${i}/concluir`)
      .set('Authorization', `Bearer ${tokenProfissional}`);
    assert.equal(r.status, 200);
    if (i === curso.aulas.length - 1) assert.equal(r.body.dados.cursoConcluido, true);
  }

  const cert = await request(app).post('/api/certificados')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ cursoId: 'c5' });
  assert.equal(cert.status, 201);
  const codigo = cert.body.dados.codigo;
  assert.match(codigo, /^MSM-\d{4}-[0-9A-F]{8}$/);

  // verificação é pública (sem token)
  const verifica = await request(app).get(`/api/certificados/verificar/${codigo}`);
  assert.equal(verifica.status, 200);
  assert.equal(verifica.body.dados.valido, true);
  assert.equal(verifica.body.dados.curso, curso.titulo);

  const invalido = await request(app).get('/api/certificados/verificar/MSM-2026-FFFFFFFF');
  assert.equal(invalido.status, 404);

  // reemissão devolve o mesmo certificado
  const denovo = await request(app).post('/api/certificados')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ cursoId: 'c5' });
  assert.equal(denovo.status, 200);
  assert.equal(denovo.body.dados.codigo, codigo);
});

test('concluir aula soma 40 XP uma única vez', async () => {
  const antes = (await request(app).get('/api/auth/eu').set('Authorization', `Bearer ${tokenGestor}`)).body.dados.xp;
  await request(app).post('/api/cursos/c1/aulas/0/concluir').set('Authorization', `Bearer ${tokenGestor}`);
  await request(app).post('/api/cursos/c1/aulas/0/concluir').set('Authorization', `Bearer ${tokenGestor}`); // repetida
  const depois = (await request(app).get('/api/auth/eu').set('Authorization', `Bearer ${tokenGestor}`)).body.dados.xp;
  assert.equal(depois, antes + 40);
});

test('contadores de produtos incrementam', async () => {
  const antes = (await request(app).get('/api/produtos')).body.dados[0];
  await request(app).post(`/api/produtos/${antes.id}/download`);
  await request(app).post(`/api/produtos/${antes.id}/visualizacao`);
  const depois = (await request(app).get('/api/produtos')).body.dados.find(p => p.id === antes.id);
  assert.equal(depois.downloads, antes.downloads + 1);
  assert.equal(depois.visualizacoes, antes.visualizacoes + 1);
});

test('busca global encontra por título e tag', async () => {
  const r = await request(app).get('/api/busca?q=htlv');
  assert.equal(r.status, 200);
  assert.ok(r.body.dados.some(x => x.tipo === 'material'));
  const curto = await request(app).get('/api/busca?q=a');
  assert.equal(curto.status, 400);
});

test('mensagens: enviar e listar em canal', async () => {
  const envia = await request(app).post('/api/canais/obst/mensagens')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ texto: 'Mensagem de teste' });
  assert.equal(envia.status, 201);
  const lista = await request(app).get('/api/canais/obst/mensagens')
    .set('Authorization', `Bearer ${tokenProfissional}`);
  assert.ok(lista.body.dados.some(m => m.texto === 'Mensagem de teste'));
});

test('admin: backup JSON sem hashes e estatísticas', async () => {
  const negado = await request(app).get('/api/admin/backup').set('Authorization', `Bearer ${tokenGestor}`);
  assert.equal(negado.status, 403);
  const r = await request(app).get('/api/admin/backup').set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(r.status, 200);
  assert.ok(r.body.tabelas.usuarios.length >= 8);
  assert.ok(!('senha_hash' in r.body.tabelas.usuarios[0]));
  assert.equal(r.body.tabelas.projetos.length, 705); // 704 + 1 criado no teste
  const est = await request(app).get('/api/admin/estatisticas').set('Authorization', `Bearer ${tokenAdmin}`);
  assert.ok(est.body.dados.contagens.materiais > 90);
});

test('rota inexistente na API devolve 404 padronizado', async () => {
  const r = await request(app).get('/api/nao-existe');
  assert.equal(r.status, 404);
  assert.equal(r.body.ok, false);
});
