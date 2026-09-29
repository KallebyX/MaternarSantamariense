import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('edições de perfil e conteúdos sobrevivem a novo login e reinício real do processo', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'maternar-persistencia-'));
  const inicio = `
    import assert from 'node:assert/strict';
    import request from 'supertest';
    import bcrypt from 'bcryptjs';
    import { db } from './src/db/connection.js';
    import { seed } from './src/db/seed.js';
    import { criarApp } from './src/app.js';
    seed();
    const app = criarApp();
    const email = 'persistencia@example.test', senha = 'Persistencia123!';
    const dados = {nome:'Pessoa Persistente',cargo:'Pesquisadora',unidade:'UFN — GESTAR',telefone:'55912340000',formacao:'Engenharia Biomédica e Pesquisa'};
    async function login() {
      const r=await request(app).post('/api/auth/login').send({email,senha});
      assert.equal(r.status,200,JSON.stringify(r.body));
      return r.body.dados;
    }
    const conferir = usuario => { for(const [chave,valor] of Object.entries(dados)) assert.equal(usuario[chave],valor,chave); };
  `;
  const gravar = `
    db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES (?,?,?,'Administrador','Ativo')").run('Nome anterior',email,bcrypt.hashSync(senha,10));
    const {token} = await login();
    const headers = {Authorization:'Bearer '+token};
    const salva=await request(app).put('/api/usuarios/eu').set(headers).send(dados);
    assert.equal(salva.status,200);conferir(salva.body.dados);
    conferir((await request(app).get('/api/auth/eu').set(headers)).body.dados);
    conferir((await login()).usuario);
    const link=await request(app).post('/api/links').set(headers).send({titulo:'Link preservado no reinício',url:'https://example.org/material',descricao:'Descrição inicial'});
    assert.equal(link.status,201);
    const editado=await request(app).put('/api/links/'+link.body.dados.id).set(headers).send({descricao:'Descrição editada e persistente'});
    assert.equal(editado.status,200);
    db.close();
  `;
  const reabrir = `
    const {token,usuario} = await login();
    conferir(usuario);
    const headers = {Authorization:'Bearer '+token};
    conferir((await request(app).get('/api/auth/eu').set(headers)).body.dados);
    const links=(await request(app).get('/api/links')).body.dados;
    assert.equal(links.find(l=>l.titulo==='Link preservado no reinício').descricao,'Descrição editada e persistente');
    const limpo=await request(app).put('/api/usuarios/eu').set(headers).send({cargo:'',unidade:'',telefone:'',formacao:''});
    assert.equal(limpo.status,200);
    const depois=(await login()).usuario;
    for(const chave of ['cargo','unidade','telefone','formacao'])assert.equal(depois[chave],'');
    assert.equal(depois.nome,dados.nome);
    db.close();
  `;
  try {
    for (const [etapa, codigo] of [['gravação', gravar], ['reinício', reabrir]]) {
      const resultado = spawnSync(process.execPath, ['--input-type=module', '-e', inicio + codigo], {
        cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: 'test', DB_PATH: join(pasta, 'persistencia.db'), UPLOAD_DIR: join(pasta, 'uploads'), SMTP_ENABLED: 'false' },
      });
      assert.equal(resultado.status, 0, `${etapa}: ${resultado.stderr || resultado.stdout}`);
    }
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});
