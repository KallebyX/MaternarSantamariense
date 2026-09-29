import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { db } from '../src/db/connection.js';
import { assinarToken } from '../src/auth/middleware.js';

const app = criarApp();
let token;
before(() => {
  db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES ('Gestão','filtros@example.test','','Administrador','Ativo')").run();
  token = assinarToken(db.prepare('SELECT * FROM usuarios').get());
  const inserir = db.prepare('INSERT INTO projetos(id,titulo,responsavel,instituicao,local,status,ano_referencia,historico,situacao_origem,periodo_origem) VALUES (?,?,?,?,?,?,?,?,?,?)');
  inserir.run('hist1','Saúde e atenção da criança','Joana Ávila','UFN','Santa Maria','Histórico',2018,1,'Autorizado','2º semestre de 2018');
  inserir.run('hist2','Saúde da mulher','Joana Ávila','UFN','Santa Maria','Histórico',2018,1,' autorizado ','2018');
  inserir.run('hist3','Saúde da criança','Outra pessoa','UFSM','Santa Maria','Histórico',2019,1,'Em avaliação','Março a julho');
  inserir.run('atual1','Atenção à criança','Joana Ávila','UFN','Santa Maria','Ativo',2026,0,'','');
  inserir.run('atual2','Pesquisa encerrada','Outra pessoa','UFSM','Santa Maria','Encerrado',2025,0,'','');
  inserir.run('sem-ano','Cadastro sem ano de origem','Pesquisador','UFN','','Ativo',null,0,'','');
  for(let i=0;i<25;i++)inserir.run('pagina'+String(i).padStart(2,'0'),'Paginação '+i,'Pessoa','Instituição Páginas','','Histórico',2020,1,'','');
});

test('projetos combinam texto sem acentos, ano, instituição, situação, acervo e situação na fonte', async () => {
  const r = await request(app).get('/api/projetos').query({ q:'saude joana', ano:'2018', instituicao:'ufn', status:'Histórico', escopo:'historicos', situacao_origem:'AUTORIZADO' });
  assert.equal(r.status,200);
  assert.equal(r.body.meta.total,2);
  assert.deepEqual(r.body.dados.map(p=>p.id).sort(),['hist1','hist2']);
  assert.ok(r.body.dados.every(p=>p.historico));
  assert.equal(r.body.meta.totalGeral,31);
  assert.equal(r.body.meta.opcoes.situacoesOrigem.filter(s=>s.toLowerCase()==='autorizado').length,1);
  assert.ok(r.body.meta.opcoes.anos.includes(2026));
  assert.ok(r.body.meta.opcoes.semAno);
  const atual = await request(app).get('/api/projetos?escopo=atuais&ano=sem-ano');
  assert.deepEqual(atual.body.dados.map(p=>p.id),['sem-ano']);
  const vazio = await request(app).get('/api/projetos?ano=2018&instituicao=UFSM');
  assert.equal(vazio.body.meta.total,0);assert.deepEqual(vazio.body.dados,[]);
});

test('paginação informa total correto, não repete registros e preserva listagem completa sem parâmetros', async () => {
  const ids=[];
  for(let pagina=1;pagina<=3;pagina++) {
    const r=await request(app).get('/api/projetos').query({q:'paginacao',pagina,limite:10});
    assert.equal(r.status,200);assert.equal(r.body.meta.total,25);assert.equal(r.body.meta.paginas,3);assert.equal(r.body.meta.pagina,pagina);
    assert.equal(r.body.dados.length,pagina===3?5:10);ids.push(...r.body.dados.map(p=>p.id));
  }
  assert.equal(new Set(ids).size,25);
  const fora=await request(app).get('/api/projetos?q=paginacao&pagina=999&limite=10');
  assert.equal(fora.body.meta.pagina,3);assert.equal(fora.body.dados.length,5);
  const todos=await request(app).get('/api/projetos');
  assert.equal(todos.body.dados.length,31);
});

test('filtros inválidos são recusados e vazio paginado conserva metadados', async () => {
  for(const consulta of ['pagina=0','pagina=1.5','limite=101','limite=0','escopo=outro','ano=abc','q=a&q=b']) {
    assert.equal((await request(app).get('/api/projetos?'+consulta)).status,400,consulta);
  }
  const vazio=await request(app).get('/api/projetos?q=inexistente&pagina=2&limite=24');
  assert.equal(vazio.body.meta.total,0);assert.equal(vazio.body.meta.pagina,1);assert.equal(vazio.body.meta.paginas,1);
});

test('edição administrativa preserva campos de origem e classificação histórica', async () => {
  const r=await request(app).put('/api/projetos/hist1').set('Authorization','Bearer '+token).send({titulo:'Título revisado pela gestão',status:'Histórico'});
  assert.equal(r.status,200,JSON.stringify(r.body));
  const p=(await request(app).get('/api/projetos/hist1')).body.dados;
  assert.equal(p.titulo,'Título revisado pela gestão');assert.equal(p.historico,1);assert.equal(p.ano_referencia,2018);
  assert.equal(p.situacao_origem,'Autorizado');assert.equal(p.periodo_origem,'2º semestre de 2018');assert.equal(p.autorizacao,'');
  const ausente=await request(app).put('/api/projetos/hist2').set('Authorization','Bearer '+token).send({responsavel:''});
  assert.equal(ausente.status,200);assert.equal(ausente.body.dados.responsavel,'');
  const atual=await request(app).put('/api/projetos/atual1').set('Authorization','Bearer '+token).send({responsavel:''});
  assert.equal(atual.status,400);
});
