#!/usr/bin/env python3
"""Teste remoto da imagem com dados sintéticos. Remove apenas os próprios recursos temporários."""
import argparse
import json
from pathlib import Path
import secrets
import time
import urllib.parse
import uuid
from portainer import Client


def verify(client, image, bind_ip, port):
    marker = uuid.uuid4().hex[:12]
    volume = 'maternar-teste-' + marker
    container = None
    stack = None
    client.engine('/volumes/create', 'POST', {'Name': volume, 'Labels': {'app': 'maternar', 'maternar.temporary': 'verify'}})
    try:
        stack = client.create_stack(volume, Path(__file__).with_name('stack.yml').read_text(), {
            'MATERNAR_IMAGE': image, 'MATERNAR_VOLUME': volume, 'MATERNAR_BIND_IP': bind_ip,
            'MATERNAR_PORT': port, 'JWT_SECRET': secrets.token_hex(32),
        })['Id']
        container = client.stack_container(volume)
        ready = "for(let i=0;i<30;i++){try{const r=await fetch('http://127.0.0.1:3000/api/saude');if(r.ok)process.exit(0);}catch{}await new Promise(r=>setTimeout(r,1000));}process.exit(1);"
        client.exec(container, ['node', '--input-type=module', '-e', ready])
        checks = r"""
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
const base='http://127.0.0.1:3000';
const db=new Database('/app/backend/data/maternar.db');
assert.equal(process.getuid(),10001);
assert.equal(db.prepare('SELECT COUNT(*) n FROM usuarios').get().n,0);
assert.equal(fs.existsSync('/app/backend/.env'),false);
assert.equal(fs.existsSync('/app/backend/tests'),false);
assert.equal(fs.existsSync('/app/backend/seeds/PERFIS.json'),false);
for(const table of ['cursos','aulas','mensagens','eventos','conquistas'])assert.equal(db.prepare('SELECT COUNT(*) n FROM '+table).get().n,0,table);
for(const path of ['/','/app','/painel','/app.js','/chat.js','/app.css','/painel.js','/api/saude','/api/cursos']) assert.equal((await fetch(base+path)).status,200,path);
for(const path of ['/backend/data/maternar.db','/backend/.env','/backend/seeds/PERFIS.json','/dist/portainer-ufn-20260929/stack.env']) assert.equal((await fetch(base+path)).status,404,path);
const urls=new Set();
for(const table of ['materiais','documentos','protocolos','produtos','qualifica_recursos','links']) {
 for(const {url} of db.prepare('SELECT url FROM '+table).all()) if(url&&!/^https?:/i.test(url)) urls.add(url.startsWith('/')?url:'/'+url);
}
for(const url of urls) assert.equal((await fetch(base+url,{method:'HEAD'})).status,200,url);
const insert=db.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao,senha_temporaria) VALUES (?,?,?,?,'Ativo',0)");
const password=crypto.randomUUID()+'Ab9';
insert.run('Teste Admin','admin@example.test',bcrypt.hashSync(password,10),'Administrador');
insert.run('Teste Profissional','pro@example.test',bcrypt.hashSync(password,10),'Profissional');
insert.run('Teste Gestor','gestor@example.test',bcrypt.hashSync(password,10),'Gestor');
async function login(email){const r=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,senha:password})});assert.equal(r.status,200);return (await r.json()).dados.token;}
const admin=await login('admin@example.test'),pro=await login('pro@example.test'),gestor=await login('gestor@example.test');
const auth=t=>({'Authorization':'Bearer '+t,'Content-Type':'application/json'});
let r=await fetch(base+'/api/usuarios/eu',{method:'PUT',headers:auth(pro),body:JSON.stringify({telefone:'55999998888'})});assert.equal(r.status,200);
r=await fetch(base+'/api/usuarios',{headers:auth(pro)});assert.equal(r.status,403);
const form=new FormData();form.append('arquivo',new Blob(['%PDF-1.4\nTeste Portainer'],{type:'application/pdf'}),'portainer.pdf');form.append('titulo','Teste Portainer');
r=await fetch(base+'/api/arquivos',{method:'POST',headers:{Authorization:'Bearer '+admin},body:form});assert.equal(r.status,201);
const file=(await r.json()).dados;
fs.writeFileSync('/app/backend/data/smoke.json',JSON.stringify({url:file.url}));
r=await fetch(base+'/api/cursos',{method:'POST',headers:auth(admin),body:JSON.stringify({titulo:'Curso Portainer',area:'Teste',horas:2})});assert.equal(r.status,201);
const course=(await r.json()).dados;
async function call(method,path,data,token=admin){
 const response=await fetch(base+'/api/'+path,{method,headers:token?auth(token):{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
 return {status:response.status,body:await response.json()};
}
const managed=['cursos','aulas','qualifica-modulos','qualifica-recursos','trilhas','politicas','materiais','produtos','documentos','protocolos','links','eventos','projetos','notificacoes','conquistas','canais','tarefas'];
for(const route of managed){
 assert.equal((await call('POST',route,{},pro)).status,403,route);
 assert.equal((await call('POST',route,{},null)).status,401,route);
}
assert.equal((await call('GET','tarefas',undefined,pro)).status,403);
assert.equal((await call('GET','tarefas',undefined,gestor)).status,200);
assert.equal((await call('POST','usuarios/convite',{nome:'Bloqueado',email:'blocked@example.test',perfil:'Administrador'},gestor)).status,403);
for(const url of [' javascript:alert(1)','java\nscript:alert(1)','https://'])assert.equal((await call('POST','links',{titulo:'Inválido',url})).status,400);
assert.equal((await call('POST','documentos',{titulo:'Inválido',tags:[{}]})).status,400);
assert.equal((await call('POST','trilhas',{nome:'Inválida',modulos:[999999]})).status,400);
let lesson=await call('POST','aulas',{curso_id:course.id,titulo:'Aula Portainer',url:file.url});assert.equal(lesson.status,201);lesson=lesson.body.dados;
assert.equal((await call('PUT','cursos/'+course.id,{publicado:true})).status,200);
let completed=await call('POST',`cursos/${course.id}/aulas/0/concluir`,undefined,pro);assert.equal(completed.body.dados.xp,40);
assert.equal((await call('POST',`cursos/${course.id}/aulas/0/concluir`,undefined,pro)).body.dados.xp,40);
const certificate=await call('POST','certificados',{cursoId:course.id},pro);assert.equal(certificate.status,201);
assert.equal((await call('DELETE','cursos/'+course.id)).status,409);
assert.equal((await call('PUT','aulas/'+lesson.id,{titulo:'Aula atualizada'})).status,200);
assert.equal((await call('GET','progresso',undefined,pro)).body.dados.xp,0);
assert.equal((await call('GET','certificados/verificar/'+certificate.body.dados.codigo,undefined,null)).status,200);
const linked=await call('POST','links',{titulo:'Link de upload',url:'/'+file.url+'?download=1'});assert.equal(linked.status,201);
assert.equal((await call('DELETE','arquivos/'+file.id)).status,409);
const invited=await call('POST','usuarios/convite',{nome:'Revogação',email:'revogar@example.test',senha:password,trocarSenha:false});assert.equal(invited.status,201);
const oldToken=await login('revogar@example.test'),userId=invited.body.dados.usuario.id;
assert.equal((await call('PUT','usuarios/'+userId,{situacao:'Desativado'})).status,200);
assert.equal((await call('POST','usuarios/'+userId+'/reativar')).status,200);
assert.equal((await call('GET','auth/eu',undefined,oldToken)).status,401);
assert.equal((await call('DELETE','usuarios/'+userId)).status,200);
const notices=await call('POST','notificacoes',{titulo:'Privado',usuario_id:db.prepare("SELECT id FROM usuarios WHERE email='admin@example.test'").get().id});
assert.equal((await call('POST','notificacoes/'+notices.body.dados.id+'/lida',undefined,pro)).status,404);
const channel=await call('POST','canais',{nome:'Canal de teste'});assert.equal(channel.status,201);
const chatPath='canais/'+channel.body.dados.id+'/mensagens';
const chatBody={texto:'Persistência Portainer',clientId:'verificacao-remota-12345'};
const mensagem=await call('POST',chatPath,chatBody,pro);assert.equal(mensagem.status,201);
const repetida=await call('POST',chatPath,chatBody,pro);assert.equal(repetida.status,200);assert.equal(repetida.body.dados.id,mensagem.body.dados.id);
assert.equal((await call('POST',chatPath,{texto:'x'.repeat(2001)},pro)).status,400);
assert.equal((await call('GET',chatPath+'?depois=0',undefined,gestor)).body.dados.length,1);
assert.equal(db.prepare("SELECT COUNT(*) n FROM qualifica_recursos WHERE url LIKE '%pediatraluisapinheiro.com.br%'").get().n,0);
assert.equal((await call('GET','canais/'+channel.body.dados.id+'/mensagens',undefined,gestor)).body.dados[0].texto,'Persistência Portainer');
const exported=await call('GET','admin/backup');assert.equal(exported.status,200);assert.ok(exported.body.tabelas.usuarios.every(u=>!('senha_hash' in u)));
assert.equal(db.pragma('integrity_check',{simple:true}),'ok');assert.equal(db.pragma('foreign_key_check').length,0);
console.log(JSON.stringify({uid:process.getuid(),routes:true,internalFilesBlocked:true,localAssets:urls.size,login:true,rbacResources:managed.length,profile:true,upload:true,course:true,certificate:true,xpInvalidation:true,linkedUploadProtected:true,sessionRevocation:true,privateNotices:true,messages:true,chatIdempotency:true,chatIncremental:true,brokenResourceRemoved:true,backupWithoutHashes:true,inputValidation:true}));
db.close();
"""
        print(client.exec(container, ['node', '--input-type=module', '-e', checks]), flush=True)
        client.engine(f'/containers/{container}/restart?t=10', 'POST')
        client.exec(container, ['node', '--input-type=module', '-e', ready])
        persistence = r"""
import assert from 'node:assert/strict';import fs from 'node:fs';import Database from 'better-sqlite3';
const db=new Database('/app/backend/data/maternar.db');
assert.equal(db.prepare("SELECT telefone FROM usuarios WHERE email='pro@example.test'").get().telefone,'55999998888');
assert.equal(db.prepare("SELECT COUNT(*) n FROM cursos WHERE titulo='Curso Portainer'").get().n,1);
assert.equal(db.prepare('SELECT COUNT(*) n FROM certificados').get().n,1);
assert.equal(db.prepare("SELECT COUNT(*) n FROM mensagens WHERE texto='Persistência Portainer'").get().n,1);
const {url}=JSON.parse(fs.readFileSync('/app/backend/data/smoke.json','utf8'));
assert.equal((await fetch(new URL(url,'http://127.0.0.1:3000/'))).status,200);
console.log(JSON.stringify({restart:true,persistentProfile:true,persistentCourse:true,persistentUpload:true,persistentCertificate:true,persistentMessage:true}));db.close();
"""
        print(client.exec(container, ['node', '--input-type=module', '-e', persistence]), flush=True)
        # Espera limitada pela primeira execução do healthcheck Docker.
        for _ in range(40):
            state = client.engine(f'/containers/{container}/json')['State']
            if state.get('Health', {}).get('Status') == 'healthy':
                break
            time.sleep(1)
        else:
            raise RuntimeError('Healthcheck Docker não ficou healthy.')
        print(json.dumps({'dockerHealth': 'healthy', 'image': image, 'portBindTested': f'{bind_ip}:{port}', 'syntheticDataOnly': True}), flush=True)
    finally:
        if stack is not None:
            client.remove_stack(stack)
        client.engine('/volumes/' + urllib.parse.quote(volume, safe=''), 'DELETE')
        print('Contêiner e volume temporários removidos.', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True)
    parser.add_argument('--url', default='https://app.ufn.edu.br')
    parser.add_argument('--endpoint', type=int, default=5)
    parser.add_argument('--username')
    parser.add_argument('--credentials-eml', type=Path)
    parser.add_argument('--bind-ip', default='10.21.19.45')
    parser.add_argument('--port', type=int, default=8035)
    args = parser.parse_args()
    verify(Client(args.url, args.endpoint, args.username, args.credentials_eml), args.image, args.bind_ip, args.port)
