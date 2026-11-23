import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { migrarComunicacao, AREAS_PROFISSIONAIS } from '../src/db/comunicacao.js';
import { comunicacaoRouter } from '../src/routes/comunicacao.js';
import { usuariosRouter } from '../src/routes/usuarios.js';
import { assinarToken } from '../src/auth/middleware.js';

const app = express();
app.use(express.json());
app.use('/api/usuarios', usuariosRouter);
app.use('/api', comunicacaoRouter);
const pessoas = {};
const auth = (r, nome = 'Ana') => r.set('Authorization', 'Bearer ' + pessoas[nome].token);
let conversa;

before(() => {
  migrarComunicacao(db);
  for (const [nome, area, situacao] of [['Ana','Enfermagem','Ativo'],['Bia','Medicina','Ativo'],['Cris','Odontologia','Ativo'],['Inativa','Outros','Desativado']]) {
    const r = db.prepare(`INSERT INTO usuarios(nome,email,senha_hash,cpf,telefone,area,situacao) VALUES (?,?,?,?,?,?,?)`)
      .run(nome, nome.toLowerCase() + '@chat.test', bcrypt.hashSync('Senha1234',4), '12345678900','5551999999999',area,situacao);
    const usuario = db.prepare('SELECT * FROM usuarios WHERE id=?').get(r.lastInsertRowid);
    pessoas[nome] = { ...usuario, token: assinarToken(usuario) };
  }
});

test('diretório autenticado filtra por nome/área, limita campos e omite contas inativas', async () => {
  assert.equal((await request(app).get('/api/colegas')).status,401);
  const r = await auth(request(app).get('/api/colegas?q=bía&area=Medicina'));
  assert.equal(r.status,200);
  assert.equal(r.body.dados.length,1);
  assert.deepEqual(Object.keys(r.body.dados[0]).sort(),['id','nome','area','cargo','unidade','foto'].sort());
  assert.equal(r.body.dados[0].nome,'Bia');
  const lista = (await auth(request(app).get('/api/colegas'))).body.dados;
  assert.deepEqual(lista.map(x => x.nome),['Bia','Cris']);
  assert.deepEqual((await auth(request(app).get('/api/areas'))).body.dados,AREAS_PROFISSIONAIS);
  for (const q of ['?area=Desconhecida','?pagina=-1','?q[]=x']) assert.equal((await auth(request(app).get('/api/colegas'+q))).status,400);
});

test('conversa direta é única por par de colegas e só participantes acessam', async () => {
  const a = await auth(request(app).post('/api/conversas')).send({usuarioId:pessoas.Bia.id});
  assert.equal(a.status,201); conversa = a.body.dados.id;
  assert.equal(a.body.dados.colega.nome,'Bia');
  const b = await auth(request(app).post('/api/conversas'),'Bia').send({usuarioId:pessoas.Ana.id});
  assert.equal(b.status,200); assert.equal(b.body.dados.id,conversa);
  assert.equal(b.body.dados.colega.nome,'Ana');
  assert.equal((await auth(request(app).get('/api/conversas'),'Cris')).body.dados.length,0);
  for (const method of ['get','post']) {
    const r = await auth(request(app)[method](`/api/conversas/${conversa}/mensagens`),'Cris').send({texto:'Não autorizada'});
    assert.equal(r.status,404);
  }
  for (const usuarioId of [pessoas.Ana.id,pessoas.Inativa.id,{},-1,999999]) {
    assert.ok([400,404].includes((await auth(request(app).post('/api/conversas')).send({usuarioId})).status));
  }
});

test('mensagens usam autoria real, histórico e idempotência sem vazar entre conversas', async () => {
  const url = `/api/conversas/${conversa}/mensagens`, body = {texto:'Olá, Bia',clientId:'envio-direto-123456789',autor:'Impostor'};
  const a = await auth(request(app).post(url)).send(body);
  assert.equal(a.status,201);assert.equal(a.body.dados.autor,'Ana');assert.equal(a.body.dados.usuario_id,undefined);
  const b = await auth(request(app).post(url)).send(body);
  assert.equal(b.status,200);assert.equal(b.body.dados.id,a.body.dados.id);
  assert.equal((await auth(request(app).post(url)).send({...body,texto:'Mudou'})).status,409);
  const outra = (await auth(request(app).post('/api/conversas')).send({usuarioId:pessoas.Cris.id})).body.dados.id;
  assert.equal((await auth(request(app).post(`/api/conversas/${outra}/mensagens`)).send(body)).status,409);
  const mensagens = (await auth(request(app).get(url),'Bia')).body.dados;
  assert.equal(mensagens.length,1);assert.equal(mensagens[0].texto,body.texto);
  assert.equal((await auth(request(app).get(`/api/conversas/${outra}/mensagens`))).body.dados.length,0);
  for(const texto of ['', '   ', {}, 'a'.repeat(2001)])assert.equal((await auth(request(app).post(url)).send({texto})).status,400);
});

test('histórico direto pagina sem perdas e valida cursores', async () => {
  const inserir = db.prepare("INSERT INTO mensagens_diretas(conversa_id,usuario_id,autor,texto) VALUES (?,?,'Ana',?)");
  for(let i=0;i<251;i++)inserir.run(conversa,pessoas.Ana.id,'Mensagem '+i);
  const url = `/api/conversas/${conversa}/mensagens`;
  let pagina = (await auth(request(app).get(url))).body;
  assert.equal(pagina.dados.length,50);assert.equal(pagina.meta.temAnteriores,true);
  const ids = new Set();
  while(pagina.dados.length){
    for(const m of pagina.dados){ assert.equal(ids.has(m.id),false);ids.add(m.id); }
    pagina = (await auth(request(app).get(url+'?antes='+pagina.dados[0].id))).body;
  }
  assert.equal(ids.size,252);
  const novas = (await auth(request(app).get(url+'?depois=0'))).body;
  assert.equal(novas.dados.length,200);assert.equal(novas.meta.maisNovas,true);
  assert.equal((await auth(request(app).get(url+'?depois='+novas.dados.at(-1).id))).body.dados.length,52);
  for(const q of ['?antes=x','?depois=-1','?antes=1&depois=2','?antes[]=1','?depois=999999999999999999999'])assert.equal((await auth(request(app).get(url+q))).status,400);
});

test('área de perfil usa catálogo validado e foto aceita só imagem limitada do próprio usuário', async () => {
  assert.equal((await auth(request(app).put('/api/usuarios/eu')).send({area:'Não existe'})).status,400);
  const perfil = await auth(request(app).put('/api/usuarios/eu')).send({area:'Políticas'});
  assert.equal(perfil.status,200);assert.equal(perfil.body.dados.area,'Políticas');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jKxkAAAAASUVORK5CYII=','base64');
  const foto = await auth(request(app).post('/api/usuarios/eu/foto')).attach('foto',png,{filename:'foto.png',contentType:'image/png'});
  assert.equal(foto.status,200);assert.match(foto.body.dados.foto,/^data:image\/png;base64,/);
  assert.equal(db.prepare('SELECT foto FROM usuarios WHERE id=?').get(pessoas.Bia.id).foto,'');
  const enorme = Buffer.from(png); enorme.writeUInt32BE(100000,16);
  assert.equal((await auth(request(app).post('/api/usuarios/eu/foto')).attach('foto',enorme,{filename:'dimensoes.png',contentType:'image/png'})).status,400);
  assert.equal((await auth(request(app).post('/api/usuarios/eu/foto')).attach('foto',Buffer.from('<svg onload="alert(1)"></svg>'),{filename:'foto.png',contentType:'image/png'})).status,400);
  assert.equal((await auth(request(app).post('/api/usuarios/eu/foto')).attach('foto',Buffer.alloc(2*1024*1024+1),{filename:'grande.png',contentType:'image/png'})).status,413);
  assert.equal((await auth(request(app).delete('/api/usuarios/eu/foto'))).body.dados.foto,'');
});

test('migração repetida preserva usuários, fotos e mensagens', () => {
  const antes = db.prepare('SELECT COUNT(*) n FROM mensagens_diretas').get().n;
  // Fotos gravadas pela versão inicial ganham referência sem alterar o conteúdo.
  const fotoAntiga='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
  for(const pessoa of [pessoas.Ana,pessoas.Bia])db.prepare("UPDATE usuarios SET foto=?,foto_versao='' WHERE id=?").run(fotoAntiga,pessoa.id);
  migrarComunicacao(db);migrarComunicacao(db);
  for(const pessoa of [pessoas.Ana,pessoas.Bia]){
    const depois=db.prepare('SELECT foto,foto_versao FROM usuarios WHERE id=?').get(pessoa.id);
    assert.equal(depois.foto,fotoAntiga);assert.match(depois.foto_versao,/^[a-f0-9]{20}$/);
  }
  assert.equal(db.prepare('SELECT COUNT(*) n FROM mensagens_diretas').get().n,antes);
  assert.equal(db.prepare('SELECT area FROM usuarios WHERE id=?').get(pessoas.Ana.id).area,'Políticas');
});
