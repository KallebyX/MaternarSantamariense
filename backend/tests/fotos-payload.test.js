import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { db } from '../src/db/connection.js';
import { criarApp } from '../src/app.js';
import { assinarToken } from '../src/auth/middleware.js';

const app=criarApp();
const pessoas=[];
const auth=(r,indice=0)=>r.set('Authorization','Bearer '+pessoas[indice].token);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jKxkAAAAASUVORK5CYII=','base64');
let fotoGrande,conversa;
before(async()=>{
  fotoGrande=Buffer.alloc(2*1024*1024);png.copy(fotoGrande);
  for(const nome of ['Autora','Colega']){
    const id=db.prepare("INSERT INTO usuarios(nome,email,senha_hash,situacao) VALUES (?,?,?,'Ativo')").run(nome,nome+'@foto.test','hash-teste').lastInsertRowid;
    const usuario=db.prepare('SELECT * FROM usuarios WHERE id=?').get(id);
    pessoas.push({...usuario,token:assinarToken(usuario)});
  }
  for(let i=0;i<pessoas.length;i++){
    const r=await auth(request(app).post('/api/usuarios/eu/foto'),i).attach('foto',fotoGrande,{filename:'foto.png',contentType:'image/png'});
    assert.equal(r.status,200);
  }
  conversa=(await auth(request(app).post('/api/conversas')).send({usuarioId:pessoas[1].id})).body.dados.id;
  db.prepare("INSERT INTO canais(id,nome) VALUES ('foto-payload','Canal de teste')").run();
  const canal=db.prepare("INSERT INTO mensagens(canal_id,usuario_id,autor,texto) VALUES ('foto-payload',?,'Autora',?)");
  const direta=db.prepare("INSERT INTO mensagens_diretas(conversa_id,usuario_id,autor,texto) VALUES (?,?,'Autora',?)");
  for(let i=0;i<205;i++){canal.run(pessoas[0].id,'Mensagem '+i);direta.run(conversa,pessoas[0].id,'Mensagem '+i);}
});

test('históricos e incrementais com foto de 2MB transferem só referência por autor',async()=>{
  for(const url of ['/api/canais/foto-payload/mensagens',`/api/conversas/${conversa}/mensagens`]){
    for(const [consulta,quantidade]of [['',50],['?depois=0',200]]){
      const r=await auth(request(app).get(url+consulta));
      assert.equal(r.status,200);assert.equal(r.body.dados.length,quantidade);
      assert.ok(Buffer.byteLength(r.text)<100000,'Página deve ficar abaixo de100KB, independentemente da foto');
      assert.doesNotMatch(r.text,/data:image|base64,/);
      const fotos=new Set(r.body.dados.map(m=>m.foto));
      assert.equal(fotos.size,1);assert.match([...fotos][0],/^\/api\/colegas\/\d+\/foto\?v=[a-f0-9]{20}$/);
      assert.ok(r.body.dados.every(m=>m.autor_id===pessoas[0].id));
    }
  }
});

test('diretório e lista de conversas nunca embutem fotos; endpoint exige sessão e entrega bytes',async()=>{
  const diretorio=await auth(request(app).get('/api/colegas'));
  const conversas=await auth(request(app).get('/api/conversas'));
  for(const r of [diretorio,conversas]){
    assert.equal(r.status,200);assert.ok(Buffer.byteLength(r.text)<10000);assert.doesNotMatch(r.text,/data:image|base64,/);
  }
  const url=diretorio.body.dados[0].foto;
  assert.match(url,/^\/api\/colegas\//);
  assert.equal((await request(app).get(url)).status,401);
  const imagem=await auth(request(app).get(url));
  assert.equal(imagem.status,200);assert.equal(imagem.headers['content-type'],'image/png');
  assert.match(imagem.headers['cache-control'],/private/);assert.equal(imagem.headers['x-content-type-options'],'nosniff');
  assert.deepEqual(imagem.body,fotoGrande);
});

test('upload altera versão da referência e remoção/inativação bloqueiam a imagem',async()=>{
  const urlAntiga=(await auth(request(app).get('/api/colegas'))).body.dados[0].foto;
  assert.equal((await auth(request(app).post('/api/usuarios/eu/foto'),1).attach('foto',png,{filename:'nova.png',contentType:'image/png'})).status,200);
  const urlNova=(await auth(request(app).get('/api/colegas'))).body.dados[0].foto;
  assert.notEqual(urlNova,urlAntiga);
  assert.deepEqual((await auth(request(app).get(urlNova))).body,png);
  db.prepare("UPDATE usuarios SET situacao='Desativado' WHERE id=?").run(pessoas[1].id);
  assert.equal((await auth(request(app).get(urlNova))).status,404);
  db.prepare("UPDATE usuarios SET situacao='Ativo' WHERE id=?").run(pessoas[1].id);
  assert.equal((await auth(request(app).delete('/api/usuarios/eu/foto'),1)).status,200);
  assert.equal((await auth(request(app).get('/api/colegas'))).body.dados[0].foto,'');
  assert.equal((await auth(request(app).get(urlNova))).status,404);
});
