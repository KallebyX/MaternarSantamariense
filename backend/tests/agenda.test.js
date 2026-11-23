import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import { db } from '../src/db/connection.js';
import { migrarAgenda } from '../src/db/agenda.js';
import { agendaRouter } from '../src/routes/agenda.js';
import { assinarToken } from '../src/auth/middleware.js';

const app=express();app.use(express.json());app.use('/api',agendaRouter);
const usuarios={};
const auth=(r,nome='ana')=>r.set('Authorization','Bearer '+usuarios[nome].token);
const evento={dia:23,mes:11,ano:2026,hora:'14:00',fim:'15:00',titulo:'Roda de conversa',local:'UBS Centro'};
before(()=>{
  migrarAgenda(db);
  for(const [nome,perfil,equipe] of [['ana','Profissional','Centro'],['bia','Profissional','Centro'],['caio','Profissional','Norte'],['gestora','Gestor','Centro']]){
    const r=db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao,unidade,equipe_agenda) VALUES(?,?,'hash',?,'Ativo',?,?)").run(nome,nome+'@agenda.test',perfil,equipe,equipe);
    const u=db.prepare('SELECT * FROM usuarios WHERE id=?').get(r.lastInsertRowid);usuarios[nome]={...u,token:assinarToken(u)};
  }
});
test('agenda exige sessão e permite ao profissional manter somente suas atividades',async()=>{
  assert.equal((await request(app).get('/api/eventos')).status,401);
  const novo=await auth(request(app).post('/api/eventos')).send({...evento,criado_por:usuarios.caio.id,cor:'#ffffff'});
  assert.equal(novo.status,201);const e=novo.body.dados;
  assert.equal(e.criado_por,usuarios.ana.id);assert.equal(e.origem,'Profissionais');assert.equal(e.cor,'#357348');
  assert.equal((await auth(request(app).put('/api/eventos/'+e.id),'bia').send({titulo:'Indevido'})).status,403);
  assert.equal((await auth(request(app).delete('/api/eventos/'+e.id),'bia')).status,403);
  assert.equal((await auth(request(app).put('/api/eventos/'+e.id)).send({titulo:'Reunião da equipe'})).body.dados.titulo,'Reunião da equipe');
  assert.equal((await auth(request(app).delete('/api/eventos/'+e.id))).status,200);
});
test('visibilidade por equipe usa vínculo atribuído pela gestão e não unidade autoeditável',async()=>{
  const criado=await auth(request(app).post('/api/eventos')).send({...evento,visibilidade:'equipe',equipe:'Norte'});
  assert.equal(criado.status,201);const e=criado.body.dados;
  assert.equal(e.equipe,'Centro');
  assert.equal((await auth(request(app).get('/api/eventos/'+e.id),'bia')).status,200);
  assert.equal((await auth(request(app).get('/api/eventos/'+e.id),'caio')).status,404);
  db.prepare("UPDATE usuarios SET unidade='Centro' WHERE id=?").run(usuarios.caio.id);
  assert.equal((await auth(request(app).get('/api/eventos/'+e.id),'caio')).status,404);
  assert.equal((await auth(request(app).get('/api/eventos'),'caio')).body.dados.some(x=>x.id===e.id),false);
  assert.equal((await auth(request(app).put('/api/agenda/equipe/'+usuarios.caio.id),'caio').send({equipe:'Centro'})).status,403);
  assert.equal((await auth(request(app).put('/api/agenda/equipe/'+usuarios.caio.id),'gestora').send({equipe:'Centro'})).status,200);
  assert.equal((await auth(request(app).get('/api/eventos/'+e.id),'caio')).status,200);
  assert.equal((await auth(request(app).get('/api/eventos/'+e.id),'gestora')).body.dados.pode_editar,true);
});
test('origem institucional, data real e horários são validados no servidor',async()=>{
  assert.equal((await auth(request(app).post('/api/eventos')).send({...evento,origem:'NEPeS'})).status,403);
  const criado=await auth(request(app).post('/api/eventos'),'gestora').send({...evento,origem:'NEPeS'});
  assert.equal(criado.status,201);assert.equal(criado.body.dados.cor,'#6b46a5');
  for(const campos of [{dia:31,mes:2},{dia:29,mes:2,ano:2027},{hora:'25:00'},{fim:'13:00'},{titulo:' '},{origem:'Fake'},{visibilidade:'publico'},{dia:[]},{titulo:{}}])assert.equal((await auth(request(app).post('/api/eventos'),'gestora').send({...evento,...campos})).status,400);
  assert.equal((await auth(request(app).put('/api/eventos/'+criado.body.dados.id),'gestora').send({dia:31,mes:2})).status,400);
  const filtrados=(await auth(request(app).get('/api/eventos?mes=11&ano=2026'))).body.dados;
  assert.ok(filtrados.every(e=>e.mes===11&&e.ano===2026));
  assert.equal((await auth(request(app).get('/api/eventos?mes[]=11'))).status,400);
  assert.equal((await auth(request(app).get('/api/eventos?ano=bad'))).status,400);
});
test('migração da agenda preserva eventos legados e pode ser repetida',()=>{
  const banco=new Database(':memory:');
  banco.exec("CREATE TABLE usuarios(id INTEGER PRIMARY KEY); CREATE TABLE eventos(id INTEGER PRIMARY KEY,ano INTEGER,mes INTEGER,dia INTEGER,hora TEXT,titulo TEXT,cor TEXT); INSERT INTO eventos VALUES(1,2026,9,29,'09:00','Atividade original','#ffffff')");
  migrarAgenda(banco);migrarAgenda(banco);
  const e=banco.prepare('SELECT * FROM eventos WHERE id=1').get();assert.equal(e.titulo,'Atividade original');assert.equal(e.cor,'#ffffff');assert.equal(e.origem,'Maternar');assert.equal(e.visibilidade,'rede');
  assert.equal(banco.prepare('SELECT COUNT(*) n FROM eventos').get().n,1);banco.close();
});
