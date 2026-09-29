import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { seed } from '../src/db/seed.js';
import { revisarCatalogoUx } from '../src/db/revisao-ux.js';
import { criarApp } from '../src/app.js';
const app=criarApp();
let token, canal, outro;
const auth=r=>r.set('Authorization','Bearer '+token);
before(async()=>{
  seed();
  db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES (?,?,?,'Profissional','Ativo')").run('Pessoa do chat','chat@example.test',bcrypt.hashSync('Chat12345',10));
  token=(await request(app).post('/api/auth/login').send({email:'chat@example.test',senha:'Chat12345'})).body.dados.token;
  [canal,outro]=db.prepare('SELECT id FROM canais').all().map(c=>c.id);
});
test('mensagem exige sessão, texto válido, canal existente e autoria real',async()=>{
  const url='/api/canais/'+canal+'/mensagens';
  assert.equal((await request(app).get(url)).status,401);
  for(const texto of ['', '   ', 10, {}, 'a'.repeat(2001)]) assert.equal((await auth(request(app).post(url)).send({texto})).status,400);
  assert.equal((await auth(request(app).post('/api/canais/inexistente/mensagens')).send({texto:'Olá'})).status,404);
  const r=await auth(request(app).post(url)).send({texto:'<script>alert(1)</script>\nOlá',autor:'Impostor'});
  assert.equal(r.status,201);assert.equal(r.body.dados.autor,'Pessoa do chat');
  assert.equal(r.body.dados.hora,new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}));
  assert.equal(r.body.dados.usuario_id,undefined);
});
test('reenvio após perda de resposta mantém uma única mensagem e rejeita chave conflitante',async()=>{
  const url='/api/canais/'+canal+'/mensagens',body={texto:'Envio confirmado uma vez',clientId:'chat-reenvio-12345678'};
  const a=await auth(request(app).post(url)).send(body);
  const b=await auth(request(app).post(url)).send(body);
  assert.equal(a.status,201);assert.equal(b.status,200);assert.equal(a.body.dados.id,b.body.dados.id);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM mensagens WHERE client_id=?').get(body.clientId).n,1);
  assert.equal((await auth(request(app).post(url)).send({...body,texto:'Outro texto'})).status,409);
  assert.equal((await auth(request(app).post('/api/canais/'+outro+'/mensagens')).send(body)).status,409);
});
test('histórico paginado e atualização incremental não omitem mensagens nem misturam canais',async()=>{
  const inserir=db.prepare("INSERT INTO mensagens(canal_id,autor,texto,hora) VALUES (?,'Pessoa',?,'12:00')");
  for(let i=0;i<260;i++)inserir.run(canal,'Histórico '+i);
  inserir.run(outro,'Outro canal');
  const url='/api/canais/'+canal+'/mensagens';
  let pagina=(await auth(request(app).get(url))).body;
  assert.equal(pagina.dados.length,50);assert.equal(pagina.meta.temAnteriores,true);
  const ids=new Set();
  while(pagina.dados.length){
    for(const m of pagina.dados){assert.equal(m.canal_id,canal);assert.equal(ids.has(m.id),false);ids.add(m.id);}
    pagina=(await auth(request(app).get(url+'?antes='+pagina.dados[0].id))).body;
  }
  assert.equal(ids.size,262);
  const novas=(await auth(request(app).get(url+'?depois=0'))).body;
  assert.equal(novas.dados.length,200);assert.equal(novas.meta.maisNovas,true);
  const resto=(await auth(request(app).get(url+'?depois='+novas.dados.at(-1).id))).body;
  assert.equal(resto.dados.length,62);assert.equal(resto.meta.maisNovas,false);
  for(const query of ['?antes=x','?depois=-1','?antes=1&depois=2','?antes[]=1','?depois=999999999999999999999'])assert.equal((await auth(request(app).get(url+query))).status,400);
});
test('referência removida não volta no catálogo e migração preserva recursos editados',async()=>{
  assert.doesNotMatch(JSON.stringify((await request(app).get('/api/qualifica')).body),/luisapinheiro/i);
  const modulo=db.prepare('SELECT id FROM qualifica_modulos LIMIT 1').get().id;
  db.prepare('INSERT INTO qualifica_recursos(modulo_id,titulo,url) VALUES (?,?,?)').run(modulo,'Remover','https://www.pediatraluisapinheiro.com.br/');
  const mantido=db.prepare('INSERT INTO qualifica_recursos(modulo_id,titulo,url) VALUES (?,?,?)').run(modulo,'Recurso cadastrado','https://toolnurse.ufn.edu.br/');
  db.prepare("DELETE FROM app_meta WHERE chave='catalogo-ux-20260929'").run();
  db.transaction(revisarCatalogoUx)();seed();
  assert.ok(db.prepare('SELECT 1 FROM qualifica_recursos WHERE id=?').get(mantido.lastInsertRowid));
  assert.equal(db.prepare("SELECT COUNT(*) n FROM qualifica_recursos WHERE url LIKE '%pediatraluisapinheiro.com.br%'").get().n,0);
});
