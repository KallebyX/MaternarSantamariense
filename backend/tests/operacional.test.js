import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/connection.js';
import { seed } from '../src/db/seed.js';
import { normalizarCatalogo } from '../src/db/normalizar-catalogo.js';
import { criarApp } from '../src/app.js';

const app = criarApp();
let admin, pro;
const auth = (r,t=admin) => r.set('Authorization','Bearer '+t);
before(async () => {
  seed();
  for (const t of ['usuarios','cursos','aulas','certificados','eventos','mensagens','tarefas','conquistas']) {
    assert.equal(db.prepare('SELECT COUNT(*) n FROM '+t).get().n,0,t);
  }
  const hash=bcrypt.hashSync('Validacao123!',10);
  for(const [email,perfil] of [['admin@example.test','Administrador'],['pro@example.test','Profissional']]) {
    db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES (?,?,?,?,'Ativo')").run(perfil,email,hash,perfil);
  }
  admin=(await request(app).post('/api/auth/login').send({email:'admin@example.test',senha:'Validacao123!'})).body.dados.token;
  pro=(await request(app).post('/api/auth/login').send({email:'pro@example.test',senha:'Validacao123!'})).body.dados.token;
});

test('seed operacional não admite demonstrações e reinício preserva base vazia de cursos', () => {
  assert.throws(()=>seed({demo:true}),/não são permitidos/);
  seed();
  assert.equal(db.prepare('SELECT COUNT(*) n FROM cursos').get().n,0);
  for(const c of db.prepare('SELECT * FROM canais').all()) {
    assert.doesNotMatch(c.nome+' '+c.subtitulo,/Maria Aparecida|\d+ participantes|online/);
  }
  assert.equal(db.prepare("SELECT COUNT(*) n FROM qualifica_modulos WHERE duracao<>''").get().n,0);
  assert.equal(db.prepare('SELECT SUM(visualizacoes+downloads) n FROM produtos').get().n,0);
});

test('curso nasce rascunho e não aparece no catálogo, busca ou acesso direto profissional', async () => {
  assert.equal((await auth(request(app).post('/api/cursos')).send({titulo:'Sem carga horária',area:'Rede'})).status,400);
  const r=await auth(request(app).post('/api/cursos')).send({titulo:'Rascunho operacional',area:'Educação',horas:2});
  assert.equal(r.status,201);
  const id=r.body.dados.id;
  assert.equal(r.body.dados.publicado,false);
  assert.equal((await request(app).get('/api/cursos')).body.dados.length,0);
  assert.equal((await request(app).get('/api/busca?q=Rascunho')).body.dados.length,0);
  assert.equal((await auth(request(app).get('/api/cursos/'+id),pro)).status,404);
  assert.equal((await request(app).get('/api/cursos?gestao=1')).status,401);
  assert.equal((await auth(request(app).get('/api/cursos?gestao=1'),pro)).status,403);
  assert.equal((await auth(request(app).get('/api/cursos?gestao=1'))).body.dados.length,1);
  assert.equal((await auth(request(app).put('/api/cursos/'+id)).send({publicado:true})).status,400);
  const aula=(await auth(request(app).post('/api/aulas')).send({curso_id:id,titulo:'Aula faltante',url:'uploads/nao-existe.pdf'})).body.dados;
  assert.equal((await auth(request(app).put('/api/cursos/'+id)).send({publicado:true})).status,400);
  assert.equal((await auth(request(app).post('/api/cursos/'+id+'/aulas/0/concluir'),pro)).status,422);
  assert.equal((await auth(request(app).post('/api/certificados'),pro).send({cursoId:id})).status,422);
  await auth(request(app).delete('/api/aulas/'+aula.id));
  await auth(request(app).delete('/api/cursos/'+id));
});

test('cadastro, upload, publicação, conclusão e certificado dependem de dados persistidos', async () => {
  const arquivo=await auth(request(app).post('/api/arquivos')).attach('arquivo','../acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf');
  assert.equal(arquivo.status,201);
  const curso=(await auth(request(app).post('/api/cursos')).send({titulo:'Curso publicado pela gestão',area:'Rede',horas:3})).body.dados;
  const aula=(await auth(request(app).post('/api/aulas')).send({curso_id:curso.id,titulo:'Material publicado',url:arquivo.body.dados.url})).body.dados;
  assert.equal((await auth(request(app).post('/api/certificados'),pro).send({cursoId:curso.id})).status,422);
  assert.equal((await auth(request(app).put('/api/cursos/'+curso.id),pro).send({publicado:true})).status,403);
  assert.equal((await auth(request(app).put('/api/cursos/'+curso.id)).send({publicado:true})).status,200);
  const catalogo=(await request(app).get('/api/cursos')).body.dados;
  assert.equal(catalogo.length,1);assert.equal(catalogo[0].situacao,'Publicado');
  assert.equal((await request(app).get('/api/aulas')).status,401);
  assert.equal((await auth(request(app).post('/api/cursos/'+curso.id+'/aulas/0/concluir'),pro)).status,200);
  assert.equal((await request(app).get('/api/cursos/'+curso.id)).body.dados.inscritos,1);
  const cert=await auth(request(app).post('/api/certificados'),pro).send({cursoId:curso.id});
  assert.equal(cert.status,201);
  const repetido=await auth(request(app).post('/api/certificados'),pro).send({cursoId:curso.id});
  assert.equal(repetido.body.dados.codigo,cert.body.dados.codigo);
  await auth(request(app).put('/api/aulas/'+aula.id)).send({titulo:'Material revisado'});
  assert.equal((await request(app).get('/api/cursos')).body.dados.length,0);
  assert.equal((await auth(request(app).post('/api/cursos/'+curso.id+'/aulas/0/concluir'),pro)).status,422);
  await auth(request(app).put('/api/cursos/'+curso.id)).send({titulo:'Título alterado',horas:8});
  const verificacao=(await request(app).get('/api/certificados/verificar/'+cert.body.dados.codigo)).body.dados;
  assert.equal(verificacao.curso,'Curso publicado pela gestão');assert.equal(verificacao.horas,3);
});

test('migração remove somente cursos de demonstração intocados e preserva usuário e curso real', () => {
  const legado=JSON.parse(readFileSync(new URL('../src/db/catalogo-anterior.json',import.meta.url),'utf8'));
  const usuarios=JSON.stringify(db.prepare('SELECT * FROM usuarios ORDER BY id').all());
  const ins=db.prepare('INSERT INTO cursos(id,titulo,descricao,horas,area,nivel) VALUES (?,?,?,?,?,?)');
  for(const c of legado.CURSOS) {
    ins.run(c.id,c.titulo,c.desc,c.horas,c.area,c.nivel);
    c.aulas.forEach((a,i)=>db.prepare('INSERT INTO aulas(curso_id,titulo,ordem,duracao) VALUES (?,?,?,?)').run(c.id,a.t,i,a.d));
  }
  db.prepare("UPDATE cursos SET titulo='Cadastro editado pela coordenação' WHERE id='c6'").run();
  db.prepare("DELETE FROM app_meta WHERE chave='catalogo-operacional-20260929'").run();
  db.transaction(normalizarCatalogo)();
  assert.equal(db.prepare("SELECT COUNT(*) n FROM cursos WHERE id IN ('c1','c2','c3','c4','c5')").get().n,0);
  assert.ok(db.prepare("SELECT 1 FROM cursos WHERE id='c6'").get());
  assert.equal(JSON.stringify(db.prepare('SELECT * FROM usuarios ORDER BY id').all()),usuarios);
  const antes=db.prepare('SELECT COUNT(*) n FROM cursos').get().n;
  seed();assert.equal(db.prepare('SELECT COUNT(*) n FROM cursos').get().n,antes);
});
