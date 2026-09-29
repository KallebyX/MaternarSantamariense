import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';
import { db } from '../src/db/connection.js';
import { criarApp } from '../src/app.js';
import { assinarToken } from '../src/auth/middleware.js';
import { smtpLocal } from './helpers/smtp.js';
import { hashToken, verificarEmail } from '../src/lib/email.js';
const app = criarApp();
let smtp, admin, gestor, profissional;
const senha = 'Password123';
function criar(nome, perfil='Profissional', situacao='Ativo') {
 const email=nome+'@example.test';
 const id=db.prepare('INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao) VALUES (?,?,?,?,?)').run(nome,email,bcrypt.hashSync(senha,10),perfil,situacao).lastInsertRowid;
 return db.prepare('SELECT * FROM usuarios WHERE id=?').get(id);
}
const aut=(r,u=admin)=>r.set('Authorization','Bearer '+assinarToken(u));
const tokenMensagem=()=>smtp.state.messages.at(-1).text.match(/redefinir\.html#([a-f0-9]{64})/)[1];
const liberar=u=>db.prepare('UPDATE acessos_email SET criado_em=criado_em-61000 WHERE usuario_id=?').run(u.id);
before(async()=>{
 smtp=await smtpLocal();config.smtp=smtp.config;config.publicUrl='https://maternar.example.test';
 admin=criar('administrador','Administrador');gestor=criar('gestor','Gestor');profissional=criar('profissional');
});
after(async()=>{await smtp.close();db.close();});

test('SMTP real autentica com STARTTLS e não envia mensagem ao verificar',async()=>{
 assert.deepEqual(await verificarEmail(),{configurado:true,autenticado:true});assert.equal(smtp.state.tls,true);assert.equal(smtp.state.messages.length,0);
 assert.equal((await aut(request(app).post('/api/admin/email/verificar'),profissional)).status,403);
 const status=(await aut(request(app).get('/api/admin/email'))).body.dados;
 assert.equal(status.configurado,true);assert.equal(status.password,undefined);
});
test('envio pelo painel preserva senha, usa destinatário do banco e registra apenas hash do link',async()=>{
 const antes=db.prepare('SELECT senha_hash FROM usuarios WHERE id=?').get(profissional.id).senha_hash;
 const r=await aut(request(app).post(`/api/usuarios/${profissional.id}/enviar-acesso`)).send({email:'outro@example.test'});
 assert.equal(r.status,200);assert.equal(r.body.dados.enviado,true);assert.equal(smtp.state.messages.at(-1).to,profissional.email);
 assert.equal(db.prepare('SELECT senha_hash FROM usuarios WHERE id=?').get(profissional.id).senha_hash,antes);
 const token=tokenMensagem();assert.equal(db.prepare('SELECT token_hash FROM acessos_email WHERE usuario_id=?').get(profissional.id).token_hash,hashToken(token));
 assert.doesNotMatch(JSON.stringify(db.prepare('SELECT * FROM logs').all()),new RegExp(token));
 assert.doesNotMatch(smtp.state.messages.at(-1).text,new RegExp(senha));
 const dump=await aut(request(app).get('/api/admin/backup'));assert.equal(dump.body.tabelas.acessos_email,undefined);
 assert.equal((await aut(request(app).post(`/api/usuarios/${profissional.id}/enviar-acesso`))).status,422);
});
test('redefinição valida senha, confirma uma vez e invalida sessões anteriores',async()=>{
 const token=tokenMensagem();const old=assinarToken(profissional);
 assert.equal((await request(app).post('/api/auth/redefinir').send({token,senhaNova:'x'})).status,400);
 assert.equal((await request(app).post('/api/auth/redefinir').send({token,senhaNova:'NovaSenha123'})).status,200);
 assert.equal((await request(app).post('/api/auth/redefinir').send({token,senhaNova:'OutraSenha123'})).status,400);
 assert.equal((await request(app).get('/api/auth/eu').set('Authorization','Bearer '+old)).status,401);
 assert.equal((await request(app).post('/api/auth/login').send({email:profissional.email,senha})).status,401);
 assert.equal((await request(app).post('/api/auth/login').send({email:profissional.email,senha:'NovaSenha123'})).status,200);
});
test('gestor não envia acesso de administrador e profissional não envia convites',async()=>{
 assert.equal((await aut(request(app).post(`/api/usuarios/${admin.id}/enviar-acesso`),gestor)).status,403);
 assert.equal((await aut(request(app).post(`/api/usuarios/${gestor.id}/enviar-acesso`),profissional)).status,401);
 const p=criar('outro-profissional');assert.equal((await aut(request(app).post(`/api/usuarios/${gestor.id}/enviar-acesso`),p)).status,403);
 assert.equal((await request(app).post(`/api/usuarios/${gestor.id}/enviar-acesso`)).status,401);
});
test('recuperação não revela existência ou situação da conta',async()=>{
 const ativo=criar('recuperacao');const pendente=criar('pendente','Profissional','Pendente');const desativado=criar('desativado','Profissional','Desativado');
 const before=smtp.state.messages.length;const respostas=[];
 for(const email of [ativo.email,pendente.email,desativado.email,'ausente@example.test']){
  const r=await request(app).post('/api/auth/recuperar').send({email});assert.equal(r.status,200);respostas.push(r.body);
 }
 assert.ok(respostas.every(r=>JSON.stringify(r)===JSON.stringify(respostas[0])));
 assert.equal(smtp.state.messages.length,before+1);assert.equal(smtp.state.messages.at(-1).to,ativo.email);
});
test('convite opcional envia link e falha SMTP não afirma envio nem duplica cadastro',async()=>{
 const good=await aut(request(app).post('/api/usuarios/convite')).send({nome:'Convidada',email:'convite@example.test',enviarEmail:true});
 assert.equal(good.status,201);assert.equal(good.body.dados.emailEnvio.enviado,true);
 smtp.state.reject=true;
 const fail=await aut(request(app).post('/api/usuarios/convite')).send({nome:'Falha',email:'falha@example.test',enviarEmail:true});
 assert.equal(fail.status,201);assert.equal(fail.body.dados.emailEnvio.enviado,false);
 const row=db.prepare('SELECT * FROM acessos_email WHERE usuario_id=?').get(fail.body.dados.usuario.id);
 assert.equal(row.enviado,0);assert.ok(row.usado_em);assert.equal(db.prepare("SELECT count(*) n FROM usuarios WHERE email='falha@example.test'").get().n,1);
 assert.ok(db.prepare("SELECT 1 FROM logs WHERE acao='falha-email'").get());smtp.state.reject=false;
});
test('links expirados, conta desativada e alteração de senha invalidam redefinição',async()=>{
 for(const motivo of ['expirado','desativado','alterado']){
  const u=criar('bloqueio-'+motivo);await aut(request(app).post(`/api/usuarios/${u.id}/enviar-acesso`));const token=tokenMensagem();
  if(motivo==='expirado')db.prepare('UPDATE acessos_email SET expira_em=? WHERE usuario_id=?').run(Date.now()-1,u.id);
  if(motivo==='desativado')await aut(request(app).post(`/api/usuarios/${u.id}/desativar`));
  if(motivo==='alterado')await aut(request(app).post(`/api/usuarios/${u.id}/senha`)).send({senha:'NovaSenha456'});
  assert.equal((await request(app).post('/api/auth/redefinir').send({token,senhaNova:'TesteSenha456'})).status,400,motivo);
 }
});
test('sem SMTP ou URL HTTPS a recuperação informa indisponibilidade sem prometer e-mail',async()=>{
 const before=smtp.state.messages.length;config.publicUrl='http://externo.example.test';
 assert.equal((await request(app).post('/api/auth/recuperar').send({email:admin.email})).status,503);
 assert.equal((await aut(request(app).post(`/api/usuarios/${gestor.id}/enviar-acesso`))).status,422);
 assert.equal(smtp.state.messages.length,before);config.publicUrl='https://maternar.example.test';
});
