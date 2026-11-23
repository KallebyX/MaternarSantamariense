import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';

// Esquema congelado da versão publicada, sem dependência de Git na execução.
test('upgrade do esquema anterior conserva dados e edições de gestão após reinício real', t => {
  const pasta=mkdtempSync(join(tmpdir(),'maternar-upgrade-nepes-'));
  t.after(()=>rmSync(pasta,{recursive:true,force:true}));
  const caminho=join(pasta,'anterior.db'), esperado=join(pasta,'esperado.json'), banco=new Database(caminho);
  banco.exec(readFileSync(new URL('./fixtures/schema-20260929.sql',import.meta.url),'utf8'));
  assert.equal(banco.prepare("SELECT 1 FROM pragma_table_info('usuarios') WHERE name='area'").get(),undefined);
  assert.equal(banco.prepare("SELECT 1 FROM pragma_table_info('projetos') WHERE name='curso'").get(),undefined);
  const origem=JSON.parse(readFileSync(new URL('../src/db/catalogo-origem-20261123.json',import.meta.url),'utf8'));
  const drive=JSON.parse(readFileSync(new URL('../seeds/DRIVE_20260929.json',import.meta.url),'utf8'));
  const historico=JSON.parse(readFileSync(new URL('../seeds/PROJETOS_HISTORICOS_20260929.json',import.meta.url),'utf8'));
  for(const chave of ['conteudo-inicial','catalogo-links-20260929','catalogo-operacional-20260929','catalogo-ux-20260929',drive.chave,historico.chave])banco.prepare('INSERT INTO app_meta(chave,valor) VALUES (?,?)').run(chave,'1');
  for(const nome of ['Ana','Bia'])banco.prepare("INSERT INTO usuarios(nome,email,senha_hash,perfil,situacao,cargo,unidade,formacao,cpf,telefone) VALUES (?,?,?,'Profissional','Ativo','Enfermeira','Equipe Teste','Enfermagem','12345678900','5551999999999')").run(nome,nome+'@upgrade.test','hash-antigo-a-preservar');
  banco.exec(`
    INSERT INTO canais(id,nome,subtitulo) VALUES ('upgrade','Canal editado pela gestão','Descrição própria');
    INSERT INTO mensagens(canal_id,usuario_id,autor,texto,hora,client_id) VALUES ('upgrade',1,'Ana','Histórico anterior','10:00','upgrade-anterior-1234');
    INSERT INTO mensagens(canal_id,autor,texto,hora) VALUES ('upgrade','Pessoa antiga','Mensagem sem vínculo','09:00');
    INSERT INTO projetos(id,titulo,responsavel,instituicao,local,status,autorizacao) VALUES ('upgrade-gestao','Projeto editado pela gestão','Ana','Enfermagem UFN','Unidade Teste','Ativo','Autorização própria');
    INSERT INTO projetos(id,titulo,responsavel,instituicao,status,historico,situacao_origem,periodo_origem) VALUES ('upgrade-ambiguo','Projeto histórico','Bia','Instituto de Ensino Livre','Histórico',1,'Autorizado na fonte','2025');
    INSERT INTO eventos(dia,mes,ano,hora,titulo,local,cor,criado_por) VALUES (23,11,2026,'14:00','Evento anterior','Unidade Teste','#123456',1);
    INSERT INTO notificacoes(titulo,texto) VALUES ('Aviso anterior','Mensagem de gestão');
    INSERT INTO produtos(tipo,ano,titulo,descricao,url,downloads) VALUES ('Manual',2026,'Produto próprio','Descrição editada','https://example.test/gestao.pdf',42);
    INSERT INTO qualifica_modulos(id,titulo,descricao,tipo) VALUES (1,'Capacitação editada pela gestão','Texto próprio','Capacitações livres');
    INSERT INTO qualifica_recursos(modulo_id,titulo,tipo,url,fonte) VALUES (1,'Recurso próprio','PDF','https://example.test/capacitacao.pdf','Equipe');
    INSERT INTO links(titulo,categoria,descricao,url) VALUES ('Link próprio','Equipe','Descrição própria','https://example.test/link');
    INSERT INTO cursos(id,titulo,area,horas,nivel,descricao,publicado) VALUES ('upgrade-curso','Curso real editado','Enfermagem',8,'Básico','Conteúdo da gestão',1);
    INSERT INTO aulas(curso_id,ordem,titulo,url) VALUES ('upgrade-curso',0,'Aula real','https://example.test/aula.pdf');
    INSERT INTO progresso(usuario_id,curso_id,aula_ordem) VALUES (1,'upgrade-curso',0);
    INSERT INTO certificados(codigo,usuario_id,curso_id,modelo,nome_portador,titulo_curso,horas_curso) VALUES ('UPGRADE-REAL',1,'upgrade-curso','Enfermagem','Ana','Curso real editado',8);
    INSERT INTO politicas(nome,descricao) VALUES ('Política própria','Texto da gestão');
    INSERT INTO materiais(politica_id,titulo,tipo,url) VALUES (1,'Ficha','Formulário','acervo/mulher/protocolos/ficha-de-compartilhamento-de-informacao.docx');
    INSERT INTO materiais(politica_id,titulo,tipo,url) VALUES (1,'Material próprio','PDF','https://example.test/material.pdf');
  `);
  const antigo=origem.produtos[4];
  banco.prepare('INSERT INTO produtos(tipo,ano,titulo,descricao,url) VALUES (?,?,?,?,?)').run(antigo.tipo,antigo.ano,antigo.titulo,antigo.desc,antigo.url);
  for(const [titulo,tipo,url,fonte] of origem.qualifica[0].rec)banco.prepare('INSERT INTO qualifica_recursos(modulo_id,titulo,tipo,url,fonte) VALUES (1,?,?,?,?)').run(titulo,tipo,url,fonte);
  const tabelas=['usuarios','mensagens','projetos','eventos','notificacoes','cursos','aulas','progresso','certificados'],snapshot={};
  for(const tabela of tabelas)snapshot[tabela]=banco.prepare('SELECT * FROM '+tabela+' ORDER BY rowid').all();
  writeFileSync(esperado,JSON.stringify(snapshot));banco.close();
  const codigo=`
    import assert from 'node:assert/strict';
    import {readFileSync,writeFileSync} from 'node:fs';
    import {db} from './src/db/connection.js';
    import {seed} from './src/db/seed.js';
    const antes=JSON.parse(readFileSync(${JSON.stringify(esperado)},'utf8'));
    seed();
    const contagens=()=>Object.fromEntries(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({name})=>[name,db.prepare('SELECT COUNT(*) n FROM '+name).get().n]));
    const aposPrimeiro=contagens();seed();assert.deepEqual(contagens(),aposPrimeiro);
    for(const tabela of ${JSON.stringify(tabelas)}){
      const linhas=db.prepare('SELECT * FROM '+tabela+' ORDER BY rowid').all();
      assert.equal(linhas.length,antes[tabela].length,tabela+' contagem');
      for(let i=0;i<linhas.length;i++)for(const [campo,valor]of Object.entries(antes[tabela][i]))assert.equal(linhas[i][tabela==='projetos'&&campo==='instituicao'?'instituicao_origem':campo],valor,tabela+'.'+campo);
    }
    assert.equal(db.prepare("SELECT curso FROM projetos WHERE id='upgrade-gestao'").get().curso,'Enfermagem');
    assert.equal(db.prepare("SELECT vinculo_revisar FROM projetos WHERE id='upgrade-ambiguo'").get().vinculo_revisar,1);
    assert.equal(db.prepare("SELECT downloads FROM produtos WHERE titulo='Produto próprio'").get().downloads,42);
    assert.equal(db.prepare("SELECT titulo FROM qualifica_modulos WHERE id=1").get().titulo,'Capacitação editada pela gestão');
    for(const [tabela,titulo] of [['qualifica_recursos','Recurso próprio'],['links','Link próprio']])assert.ok(db.prepare('SELECT 1 FROM '+tabela+' WHERE titulo=?').get(titulo));
    assert.equal(db.prepare("SELECT url FROM materiais WHERE titulo='Ficha'").get().url,'acervo/mulher/protocolos/ficha-de-compartilhamento-de-informacao.pdf');
    assert.equal(db.prepare("SELECT url FROM materiais WHERE titulo='Material próprio'").get().url,'https://example.test/material.pdf');
    assert.ok(db.prepare("SELECT 1 FROM produtos WHERE url='https://www.sbp.com.br/especiais/reanimacao-/'").get());
    assert.equal(db.pragma('integrity_check',{simple:true}),'ok');assert.deepEqual(db.pragma('foreign_key_check'),[]);
    if(process.env.UPGRADE_ETAPA==='upgrade'){
      db.prepare("UPDATE usuarios SET area='Enfermagem',equipe_agenda='Equipe Teste',publicar_avisos=1,orgao='NEPeS',foto='data:image/png;base64,teste',foto_versao='upgrade-foto-v1' WHERE id=1").run();
      db.prepare('INSERT INTO conversas(usuario_menor,usuario_maior) VALUES (1,2)').run();
      db.prepare("INSERT INTO mensagens_diretas(conversa_id,usuario_id,autor,texto,client_id) VALUES (1,1,'Ana','Depois da atualização','upgrade-direto-123456')").run();
      db.prepare("UPDATE eventos SET origem='NEPeS',visibilidade='equipe',equipe='Equipe Teste' WHERE titulo='Evento anterior'").run();
      const depois={};for(const tabela of ${JSON.stringify(tabelas)})depois[tabela]=db.prepare('SELECT * FROM '+tabela+' ORDER BY rowid').all();
      depois.projetos=antes.projetos;depois.contagens=contagens();writeFileSync(${JSON.stringify(esperado)},JSON.stringify(depois));
    }else{
      assert.deepEqual(contagens(),antes.contagens);
      assert.equal(db.prepare('SELECT area FROM usuarios WHERE id=1').get().area,'Enfermagem');
      assert.equal(db.prepare('SELECT texto FROM mensagens_diretas WHERE id=1').get().texto,'Depois da atualização');
      assert.equal(db.prepare('SELECT COUNT(*) n FROM conversas').get().n,1);
      assert.equal(db.prepare("SELECT origem FROM eventos WHERE titulo='Evento anterior'").get().origem,'NEPeS');
    }
    db.close();
  `;
  for(const etapa of ['upgrade','reinicio']){
    const r=spawnSync(process.execPath,['--input-type=module','-e',codigo],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:30000,env:{...process.env,NODE_ENV:'test',DB_PATH:caminho,UPLOAD_DIR:join(pasta,'uploads'),SMTP_ENABLED:'false',UPGRADE_ETAPA:etapa}});
    assert.equal(r.status,0,etapa+': '+r.stderr);
  }
});
