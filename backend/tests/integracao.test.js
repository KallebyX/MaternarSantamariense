import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { criarApp } from '../src/app.js';
import { seed } from './fixtures/seed.js';
import { importarEquipe } from '../scripts/importar-equipe.mjs';

const app=criarApp();
let admin, profissional;
const auth=(req,t=admin)=>req.set('Authorization','Bearer '+t);
before(async()=>{
  seed();
  admin=(await request(app).post('/api/auth/login').send({email:'kalleby@maternarsm.com.br',senha:'demo1234'})).body.dados.token;
  profissional=(await request(app).post('/api/auth/login').send({email:'ana.ferraz@maternarsm.com.br',senha:'demo1234'})).body.dados.token;
});

test('arquivos internos e banco nunca são publicados pelo servidor',async()=>{
  for(const caminho of ['/backend/src/config.js','/backend/data/maternar.db','/backend/seeds/PERFIS.json','/backend/.env','/.git/config','/README.md','/Maternar%20Santa-mariense.dc.html']) {
    assert.equal((await request(app).get(caminho)).status,404,caminho);
  }
  for(const caminho of ['/','/app','/app.html','/plataforma','/painel','/app.js','/app.css','/painel.js']) assert.equal((await request(app).get(caminho)).status,200,caminho);
});

test('todos os arquivos locais referenciados no acervo existem e são servidos',async()=>{
  const urls=new Set();
  for(const tabela of ['materiais','documentos','protocolos','produtos','qualifica_recursos','links']) {
    for(const {url} of db.prepare('SELECT url FROM '+tabela).all()) if(url&&!/^https?:/i.test(url))urls.add(url);
  }
  for(const url of urls) assert.equal((await request(app).head('/'+url.replace(/^\//,''))).status,200,url);
  assert.ok(urls.size>0);
});

test('importação preserva campos, usa hash e não duplica nem redefine senhas',async()=>{
  const linha={nome:'Pessoa de teste',email:'pessoa@example.test',cpf:'123.456.789-09',formacao:'Formação de teste',cargo:'Profissional',unidade:'Unidade de teste',senha:'Inicial123!'};
  const antes=db.prepare('SELECT COUNT(*) n FROM usuarios').get().n;
  assert.equal(importarEquipe([linha],{simular:true})[0].resultado,'pronto para importar');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM usuarios').get().n,antes);
  importarEquipe([linha]);
  const u=db.prepare('SELECT * FROM usuarios WHERE email = ?').get(linha.email);
  assert.equal(u.cpf,'12345678909');assert.equal(u.formacao,linha.formacao);assert.equal(u.perfil,'Profissional');
  assert.ok(bcrypt.compareSync(linha.senha,u.senha_hash));assert.notEqual(u.senha_hash,linha.senha);
  importarEquipe([{...linha,senha:'Outra12345!'}]);
  assert.equal(db.prepare('SELECT senha_hash FROM usuarios WHERE id = ?').get(u.id).senha_hash,u.senha_hash);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM usuarios').get().n,antes+1);
  assert.throws(()=>importarEquipe([{...linha,cpf:'00000000000'}]),/diverge/);
});

test('importação inválida é atômica',()=>{
  const antes=db.prepare('SELECT COUNT(*) n FROM usuarios').get().n;
  assert.throws(()=>importarEquipe([{nome:'A',email:'a@example.test',senha:'Valid1234'},{nome:'B',email:'invalido',senha:'Valid1234'}]));
  assert.equal(db.prepare('SELECT COUNT(*) n FROM usuarios').get().n,antes);
});

test('reiniciar seed não repõe conteúdo removido pela gestão',()=>{
  db.prepare("DELETE FROM cursos WHERE id = 'c2'").run();seed();
  assert.equal(db.prepare("SELECT 1 FROM cursos WHERE id = 'c2'").get(),undefined);
});

test('aula sem conteúdo e curso vazio não geram conclusão ou certificado',async()=>{
  const c=(await auth(request(app).post('/api/cursos')).send({titulo:'Curso vazio',area:'Teste',horas:2})).body.dados;
  assert.equal((await auth(request(app).post('/api/certificados'),profissional).send({cursoId:c.id})).status,422);
  assert.equal((await auth(request(app).post('/api/cursos/c1/aulas/0/concluir'),profissional)).status,422);
});

test('senha provisória exige troca e troca revoga a sessão anterior',async()=>{
  const c=await auth(request(app).post('/api/usuarios/convite')).send({nome:'Troca',email:'troca@example.test',senha:'Provisoria123'});
  assert.equal(c.status,201);
  const t=(await request(app).post('/api/auth/login').send({email:'troca@example.test',senha:'Provisoria123'})).body.dados.token;
  assert.equal((await auth(request(app).get('/api/progresso'),t)).status,403);
  const troca=await auth(request(app).put('/api/usuarios/eu/senha'),t).send({senhaAtual:'Provisoria123',senhaNova:'Definitiva123'});
  assert.equal(troca.status,200);
  assert.equal((await auth(request(app).get('/api/auth/eu'),t)).status,401);
  const novo=troca.body.dados.token;
  assert.equal((await auth(request(app).get('/api/progresso'),novo)).status,200);
  assert.equal((await auth(request(app).post('/api/auth/logout'),novo)).status,200);
  assert.equal((await auth(request(app).get('/api/auth/eu'),novo)).status,401);
});

test('aviso dirigido não pode ser lido por outra pessoa',async()=>{
  const gestor=db.prepare("SELECT id FROM usuarios WHERE perfil = 'Gestor'").get();
  const n=(await auth(request(app).post('/api/notificacoes')).send({titulo:'Privado',usuario_id:gestor.id})).body.dados;
  assert.equal((await auth(request(app).post('/api/notificacoes/'+n.id+'/lida'),profissional)).status,404);
});

test('agenda restringe escrita e valida data e horário inclusive nas edições',async()=>{
  const evento={titulo:'Atividade',dia:31,mes:2,ano:2026,hora:'15:00'};
  assert.equal((await auth(request(app).post('/api/eventos'),profissional).send(evento)).status,403);
  assert.equal((await auth(request(app).post('/api/eventos')).send(evento)).status,400);
  assert.equal((await auth(request(app).post('/api/eventos')).send({...evento,dia:20,hora:'99:99'})).status,400);
  const valido=await auth(request(app).post('/api/eventos')).send({...evento,dia:20});assert.equal(valido.status,201);
  assert.equal((await auth(request(app).put('/api/eventos/'+valido.body.dados.id)).send({dia:31})).status,400);
});

test('upload SVG ativo é recusado',async()=>{
  const r=await auth(request(app).post('/api/arquivos')).attach('arquivo',Buffer.from('<svg onload="alert(1)"></svg>'),'ativo.svg');
  assert.equal(r.status,400);
});

test('biblioteca impede remover arquivo usado como material principal do Qualifica',async()=>{
  const arquivo=(await auth(request(app).post('/api/arquivos')).attach('arquivo',Buffer.from('%PDF-1.4'),'vinculo.pdf')).body.dados;
  const modulo=(await auth(request(app).post('/api/qualifica-modulos')).send({titulo:'Módulo vinculado',url:arquivo.url})).body.dados;
  assert.equal((await auth(request(app).delete('/api/arquivos/'+arquivo.id))).status,409);
  await auth(request(app).delete('/api/qualifica-modulos/'+modulo.id));
  assert.equal((await auth(request(app).delete('/api/arquivos/'+arquivo.id))).status,200);
});

test('perfil salva formação sem permitir alterar papel ou CPF pela conta própria',async()=>{
  const r=await auth(request(app).put('/api/usuarios/eu'),profissional).send({formacao:'Enfermagem',perfil:'Administrador',cpf:'00000000000'});
  assert.equal(r.status,200);assert.equal(r.body.dados.formacao,'Enfermagem');assert.equal(r.body.dados.perfil,'Profissional');assert.equal(r.body.dados.cpf,'');
});

test('senha atual incorreta não encerra a sessão válida',async()=>{
  const r=await auth(request(app).put('/api/usuarios/eu/senha'),profissional).send({senhaAtual:'Errada12345',senhaNova:'Nova12345'});
  assert.equal(r.status,400);
  assert.equal((await auth(request(app).get('/api/auth/eu'),profissional)).status,200);
});

test('trilhas normalizam códigos vindos do formulário e rejeitam valores inválidos',async()=>{
  const r=await auth(request(app).post('/api/trilhas')).send({nome:'Trilha de teste',modulos:['1','2']});
  assert.equal(r.status,201);assert.deepEqual(r.body.dados.modulos,[1,2]);
  assert.equal((await auth(request(app).post('/api/trilhas')).send({nome:'Inválida',modulos:['abc']})).status,400);
  const qualifica=(await request(app).get('/api/qualifica')).body.dados;
  assert.deepEqual(qualifica.trilhas.find(t=>t.id===r.body.dados.id).modulos,[1,2]);
});

test('certificado mantém retrato da emissão e aula editada exige nova conclusão',async()=>{
  const c=(await auth(request(app).post('/api/cursos')).send({titulo:'Curso original',area:'Teste',horas:4})).body.dados;
  const a=(await auth(request(app).post('/api/aulas')).send({curso_id:c.id,titulo:'Aula original',url:'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf',ordem:0})).body.dados;
  await auth(request(app).put('/api/cursos/'+c.id)).send({publicado:true});
  assert.equal((await auth(request(app).post('/api/cursos/'+c.id+'/aulas/0/concluir'),profissional)).status,200);
  const cert=(await auth(request(app).post('/api/certificados'),profissional).send({cursoId:c.id})).body.dados;
  await auth(request(app).put('/api/cursos/'+c.id)).send({titulo:'Curso revisado',horas:12});
  const verificado=(await request(app).get('/api/certificados/verificar/'+cert.codigo)).body.dados;
  assert.equal(verificado.curso,'Curso original');assert.equal(verificado.horas,4);
  await auth(request(app).put('/api/aulas/'+a.id)).send({titulo:'Aula revisada'});
  const p=(await auth(request(app).get('/api/progresso'),profissional)).body.dados;
  assert.equal(p.progresso.some(p=>p.curso_id===c.id),false);
});

test('valores inválidos são recusados sem quebra do servidor',async()=>{
  assert.equal((await request(app).post('/api/auth/login').send({email:[],senha:{}})).status,400);
  assert.equal((await auth(request(app).post('/api/cursos')).send({titulo:'Curso',area:'Teste',horas:0})).status,400);
  assert.equal((await auth(request(app).post('/api/cursos')).send({titulo:'Curso',area:'Teste',horas:1.5})).status,400);
  assert.equal((await auth(request(app).post('/api/links')).send({titulo:'Inseguro',url:'javascript:alert(1)'})).status,400);
  assert.equal((await auth(request(app).post('/api/materiais')).send({politica_id:1,titulo:'Inválido',url:'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf',tags:[{}]})).status,400);
});

for(const [rota,dados,alteracao] of [
  ['canais',{nome:'Canal de teste'},{nome:'Canal revisado'}],
  ['tarefas',{titulo:'Tarefa de teste'},{prioridade:'Alta'}],
  ['conquistas',{nome:'Conquista de teste'},{nivel:2}],
]) test('CRUD completo de '+rota,async()=>{
  const criar=await auth(request(app).post('/api/'+rota)).send(dados);assert.equal(criar.status,201);
  const url='/api/'+rota+'/'+criar.body.dados.id;
  assert.equal((await auth(request(app).get(url))).status,200);
  assert.equal((await auth(request(app).put(url)).send(alteracao)).status,200);
  assert.equal((await auth(request(app).delete(url),profissional)).status,403);
  assert.equal((await auth(request(app).delete(url))).status,200);
  assert.equal((await auth(request(app).get(url))).status,404);
});
