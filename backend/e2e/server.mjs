import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';
const pasta=mkdtempSync(join(tmpdir(),'maternar-e2e-'));
Object.assign(process.env,{NODE_ENV:'test',DB_PATH:join(pasta,'test.db'),UPLOAD_DIR:join(pasta,'uploads')});
const {db}=await import('../src/db/connection.js');
const {seed}=await import('../tests/fixtures/seed.js');
const {criarApp}=await import('../src/app.js');
const {config}=await import('../src/config.js');
const {smtpLocal}=await import('../tests/helpers/smtp.js');
const smtp=await smtpLocal();config.smtp=smtp.config;config.publicUrl='http://127.0.0.1:3101';
seed();
const url='acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf';
db.prepare('UPDATE aulas SET url = ? WHERE curso_id = ?').run(url,'c5');
db.prepare("UPDATE cursos SET publicado=1 WHERE id='c5'").run();
const app=express();
// Somente no processo E2E, que não é incluído na imagem de produção.
app.get('/__teste/emails', (req,res)=>res.json(smtp.state.messages.map(({to,text})=>({to,text}))));
app.use(criarApp());
const server=app.listen(3101,'127.0.0.1',()=>console.log('E2E pronto'));
function parar(){server.close(async()=>{await smtp.close();db.close();rmSync(pasta,{recursive:true,force:true});process.exit();});}
process.on('SIGTERM',parar);process.on('SIGINT',parar);
