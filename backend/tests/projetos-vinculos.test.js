import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import request from 'supertest';
import { db } from '../src/db/connection.js';
import { assinarToken } from '../src/auth/middleware.js';
import { criarApp } from '../src/app.js';
import { migrarProjetos, normalizarVinculosProjetos } from '../src/db/migrar-projetos.js';
import { separarVinculo } from '../src/db/projetos-catalogo.js';

const app = criarApp();
let token;
before(() => {
  const { lastInsertRowid } = db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES ('Gestão de projetos','vinculos@example.test','','Administrador','Ativo')").run();
  token = assinarToken(db.prepare('SELECT * FROM usuarios WHERE id=?').get(lastInsertRowid));
});

test('migração separa instituição inequívoca e preserva a fonte e os dados desconhecidos', () => {
  const banco = new Database(':memory:');
  try {
    banco.exec("CREATE TABLE projetos(id TEXT PRIMARY KEY,titulo TEXT,status TEXT CHECK(status IN ('Ativo','Encerrado')),instituicao TEXT)");
    const inserir = banco.prepare("INSERT INTO projetos VALUES (?, 'Projeto', 'Ativo', ?)");
    inserir.run('ufn', 'Medicina UFN');
    inserir.run('ufsm', 'Programa de Pós-graduação em Enfermagem UFSM');
    inserir.run('fisma', 'Enfermagem Faculdade Integrada de Santa Maria - FISMA');
    inserir.run('ambiguo', 'MEDICINA UFSM E UFRGS');
    inserir.run('desconhecido', '  Curso sem instituição identificada  ');
    migrarProjetos(banco);
    assert.equal(normalizarVinculosProjetos(banco), 5);
    const a=banco.prepare('SELECT * FROM projetos WHERE id=?').get('ufn');
    assert.equal(a.instituicao,'UFN');assert.equal(a.curso,'Medicina');assert.equal(a.instituicao_origem,'Medicina UFN');
    const f=banco.prepare('SELECT * FROM projetos WHERE id=?').get('fisma');
    assert.equal(f.instituicao,'FISMA');assert.equal(f.curso,'Enfermagem');
    for (const id of ['ambiguo','desconhecido']) {
      const p=banco.prepare('SELECT * FROM projetos WHERE id=?').get(id);
      assert.equal(p.instituicao,'');assert.equal(p.vinculo_revisar,1);assert.ok(p.instituicao_origem);
      if(id==='desconhecido')assert.equal(p.instituicao_origem,'  Curso sem instituição identificada  ');
    }
    banco.prepare("UPDATE projetos SET curso='Curso revisado', instituicao='UFSM' WHERE id='ufn'").run();
    assert.equal(normalizarVinculosProjetos(banco),0);
    assert.equal(banco.prepare("SELECT curso FROM projetos WHERE id='ufn'").get().curso,'Curso revisado');
    assert.equal(banco.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  } finally { banco.close(); }
});

test('nome extenso e sigla são uma instituição; múltiplas instituições não são adivinhadas', () => {
  assert.deepEqual(separarVinculo('Psicologia Universidade Franciscana (UFN)'), {instituicao:'UFN',curso:'Psicologia',original:'Psicologia Universidade Franciscana (UFN)',revisar:false});
  assert.equal(separarVinculo('MEDICINA UFSM E UFRGS').revisar,true);
});

test('cadastro/edição separam instituição e curso e recusam pares conflitantes', async () => {
  const auth=r=>r.set('Authorization','Bearer '+token);
  const corpo={titulo:'Pesquisa de vínculo',responsavel:'Responsável',instituicao:'Universidade Franciscana',curso:'Medicina'};
  const r=await auth(request(app).post('/api/projetos')).send(corpo);
  assert.equal(r.status,201,JSON.stringify(r.body));
  assert.equal(r.body.dados.instituicao,'UFN');assert.equal(r.body.dados.curso,'Medicina');
  const id=r.body.dados.id;
  const invalido=await auth(request(app).put('/api/projetos/'+id)).send({curso:'Enfermagem UFSM'});
  assert.equal(invalido.status,400);
  for(const extra of [{instituicao:'Medicina UFN'},{instituicao:'UFSM E UFRGS'},{instituicao:'',curso:'Medicina'},{instituicao:[]}]) {
    const recusa=await auth(request(app).post('/api/projetos')).send({...corpo,...extra});
    assert.equal(recusa.status,400,JSON.stringify(extra));
  }
  const editado=await auth(request(app).put('/api/projetos/'+id)).send({instituicao:'UFSM',curso:'Enfermagem'});
  assert.equal(editado.status,200);assert.equal(editado.body.dados.curso,'Enfermagem');
  assert.equal(editado.body.dados.instituicao,'UFSM');assert.equal(editado.body.dados.vinculo_normalizado,1);
});

test('filtro de curso e opções dependentes excluem cursos de outras instituições', async () => {
  const auth=r=>r.set('Authorization','Bearer '+token);
  for(const [instituicao,curso] of [['UFN','Saúde Materno Infantil'],['UFSM','Odontologia']]) {
    assert.equal((await auth(request(app).post('/api/projetos')).send({titulo:'Pesquisa filtro específico',responsavel:'Equipe',instituicao,curso})).status,201);
  }
  const r=await request(app).get('/api/projetos').query({instituicao:'ufn',curso:'saude materno infantil'});
  assert.equal(r.status,200);assert.equal(r.body.dados.length,1);assert.equal(r.body.dados[0].curso,'Saúde Materno Infantil');
  assert.ok(r.body.meta.opcoes.cursos.includes('Saúde Materno Infantil'));
  assert.ok(!r.body.meta.opcoes.cursos.includes('Odontologia'));
  assert.ok(r.body.meta.opcoes.cursosPorInstituicao.UFSM.includes('Odontologia'));
  assert.equal((await request(app).get('/api/projetos?curso=a&curso=b')).status,400);
});
