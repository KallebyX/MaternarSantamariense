// Testes da gestão de equipe (senhas criadas pelo gestor), da biblioteca de
// arquivos e do CRUD completo dos conteúdos. Banco em memória por arquivo de teste.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { seed } from '../src/db/seed.js';

let app;
let tokenProfissional;
let tokenGestor;
let tokenAdmin;

async function login(email, senha = 'demo1234') {
  const r = await request(app).post('/api/auth/login').send({ email, senha });
  assert.equal(r.status, 200, `login ${email}: ${JSON.stringify(r.body)}`);
  return r.body.dados.token;
}

const comGestor = req => req.set('Authorization', `Bearer ${tokenGestor}`);
const comAdmin = req => req.set('Authorization', `Bearer ${tokenAdmin}`);

before(async () => {
  seed();
  app = criarApp();
  tokenProfissional = await login('ana.ferraz@maternarsm.com.br');
  tokenGestor = await login('maria.rocha@maternarsm.com.br');
  tokenAdmin = await login('kalleby@maternarsm.com.br');
});

// ------------------------------------------------------ senhas dos convidados
test('gestor convida com a senha que definiu e o convidado já entra', async () => {
  const r = await comGestor(request(app).post('/api/usuarios/convite')).send({
    nome: 'Joana Prado', email: 'joana.prado@maternarsm.com.br',
    unidade: 'UBS Nova', cargo: 'Enfermeira obstétrica', senha: 'equipe2026',
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.dados.senha, 'equipe2026');
  assert.equal(r.body.dados.senhaDefinidaPeloGestor, true);
  assert.equal(r.body.dados.trocaObrigatoria, true);
  assert.equal(r.body.dados.usuario.situacao, 'Ativo');
  assert.ok(!('senha_hash' in r.body.dados.usuario));

  const entrada = await request(app).post('/api/auth/login')
    .send({ email: 'joana.prado@maternarsm.com.br', senha: 'equipe2026' });
  assert.equal(entrada.status, 200);
  assert.equal(entrada.body.dados.usuario.senha_temporaria, 1);

  // ao trocar a senha, a marca de senha temporária cai
  const troca = await request(app).put('/api/usuarios/eu/senha')
    .set('Authorization', `Bearer ${entrada.body.dados.token}`)
    .send({ senhaAtual: 'equipe2026', senhaNova: 'minhasenha7' });
  assert.equal(troca.status, 200);
  const depois = await login('joana.prado@maternarsm.com.br', 'minhasenha7');
  const eu = await request(app).get('/api/auth/eu').set('Authorization', `Bearer ${depois}`);
  assert.equal(eu.body.dados.senha_temporaria, 0);
});

test('convite sem senha devolve uma sugestão utilizável', async () => {
  const r = await comGestor(request(app).post('/api/usuarios/convite'))
    .send({ nome: 'Carlos Lima', email: 'carlos.lima@maternarsm.com.br' });
  assert.equal(r.status, 201);
  assert.equal(r.body.dados.senhaDefinidaPeloGestor, false);
  assert.ok(r.body.dados.senha.length >= 8);
  await login('carlos.lima@maternarsm.com.br', r.body.dados.senha);
});

test('senha sem número ou curta é recusada', async () => {
  const curta = await comGestor(request(app).post('/api/usuarios/convite'))
    .send({ nome: 'X Y', email: 'curta@maternarsm.com.br', senha: 'abc1' });
  assert.equal(curta.status, 400);
  const semNumero = await comGestor(request(app).post('/api/usuarios/convite'))
    .send({ nome: 'X Y', email: 'semnumero@maternarsm.com.br', senha: 'somenteletras' });
  assert.equal(semNumero.status, 400);
  assert.match(semNumero.body.erro, /letras e n/i);
});

test('gestor redefine senha da equipe, mas não a de um administrador', async () => {
  const equipe = (await comGestor(request(app).get('/api/usuarios'))).body.dados;
  const profissional = equipe.find(u => u.email === 'ana.ferraz@maternarsm.com.br');
  const admin = equipe.find(u => u.perfil === 'Administrador');

  const nova = await comGestor(request(app).post(`/api/usuarios/${profissional.id}/senha`))
    .send({ senha: 'redefinida9', trocarSenha: false });
  assert.equal(nova.status, 200);
  assert.equal(nova.body.dados.trocaObrigatoria, false);
  await login('ana.ferraz@maternarsm.com.br', 'redefinida9');

  const negado = await comGestor(request(app).post(`/api/usuarios/${admin.id}/senha`)).send({ senha: 'tentativa1' });
  assert.equal(negado.status, 403);

  // o administrador consegue
  const permitido = await comAdmin(request(app).post(`/api/usuarios/${admin.id}/senha`)).send({ senha: 'adminnovo1' });
  assert.equal(permitido.status, 200);
  tokenAdmin = await login('kalleby@maternarsm.com.br', 'adminnovo1');
});

test('profissional não gerencia equipe nem define senhas', async () => {
  const lista = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenProfissional}`);
  assert.equal(lista.status, 403);
  const senha = await request(app).post('/api/usuarios/1/senha')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ senha: 'qualquer1' });
  assert.equal(senha.status, 403);
});

test('edição e exclusão de usuário respeitam o perfil de quem age', async () => {
  const criado = (await comAdmin(request(app).post('/api/usuarios/convite'))
    .send({ nome: 'Temporario Silva', email: 'temp@maternarsm.com.br', senha: 'temporaria1' })).body.dados.usuario;

  const edita = await comGestor(request(app).put(`/api/usuarios/${criado.id}`))
    .send({ nome: 'Temporário Souza', unidade: 'UBS Sul' });
  assert.equal(edita.status, 200);
  assert.equal(edita.body.dados.nome, 'Temporário Souza');
  assert.equal(edita.body.dados.iniciais, 'TS');
  assert.equal(edita.body.dados.unidade, 'UBS Sul');

  // trocar o perfil de acesso é exclusivo do administrador
  const perfilNegado = await comGestor(request(app).put(`/api/usuarios/${criado.id}`)).send({ perfil: 'Gestor' });
  assert.equal(perfilNegado.status, 403);
  const perfilOk = await comAdmin(request(app).put(`/api/usuarios/${criado.id}`)).send({ perfil: 'Gestor' });
  assert.equal(perfilOk.status, 200);
  assert.equal(perfilOk.body.dados.perfil, 'Gestor');

  const desativa = await comGestor(request(app).post(`/api/usuarios/${criado.id}/desativar`));
  assert.equal(desativa.status, 200);
  const bloqueado = await request(app).post('/api/auth/login')
    .send({ email: 'temp@maternarsm.com.br', senha: 'temporaria1' });
  assert.equal(bloqueado.status, 403);
  assert.equal((await comGestor(request(app).post(`/api/usuarios/${criado.id}/reativar`))).status, 200);

  const excluiNegado = await comGestor(request(app).delete(`/api/usuarios/${criado.id}`));
  assert.equal(excluiNegado.status, 403);
  const exclui = await comAdmin(request(app).delete(`/api/usuarios/${criado.id}`));
  assert.equal(exclui.status, 200);
  assert.equal((await comGestor(request(app).get(`/api/usuarios/${criado.id}`))).status, 404);
});

test('administrador não rebaixa nem desativa a própria conta', async () => {
  const eu = (await request(app).get('/api/auth/eu').set('Authorization', `Bearer ${tokenAdmin}`)).body.dados;
  assert.equal((await comAdmin(request(app).put(`/api/usuarios/${eu.id}`)).send({ perfil: 'Profissional' })).status, 400);
  assert.equal((await comAdmin(request(app).put(`/api/usuarios/${eu.id}`)).send({ situacao: 'Desativado' })).status, 400);
  assert.equal((await comAdmin(request(app).delete(`/api/usuarios/${eu.id}`))).status, 400);
});

// ------------------------------------------------------- biblioteca de upload
test('upload de treinamento: envia, lista, atualiza e remove', async () => {
  const envio = await comGestor(request(app).post('/api/arquivos'))
    .field('titulo', 'Treinamento de reanimação neonatal')
    .field('categoria', 'Treinamento')
    .field('descricao', 'Slides da capacitação de agosto')
    .attach('arquivo', Buffer.from('%PDF-1.4 conteudo de teste'), 'Reanimação Neonatal.pdf');
  assert.equal(envio.status, 201, JSON.stringify(envio.body));
  const arquivo = envio.body.dados;
  assert.equal(arquivo.categoria, 'Treinamento');
  assert.match(arquivo.url, /^uploads\/reanimacao-neonatal-[0-9a-f]{8}\.pdf$/);
  assert.ok(arquivo.bytes > 0);

  // o binário é servido de verdade em /uploads
  const baixa = await request(app).get('/' + arquivo.url).buffer();
  assert.equal(baixa.status, 200);
  assert.match(Buffer.from(baixa.body).toString('utf8'), /conteudo de teste/);

  const lista = await request(app).get('/api/arquivos?categoria=Treinamento');
  assert.ok(lista.body.dados.some(a => a.id === arquivo.id));
  assert.ok(lista.body.meta.categorias.includes('Produto PPGSMI'));

  const renomeia = await comGestor(request(app).put(`/api/arquivos/${arquivo.id}`))
    .send({ titulo: 'Reanimação neonatal 2026', categoria: 'Qualifica Profissional' });
  assert.equal(renomeia.body.dados.titulo, 'Reanimação neonatal 2026');
  assert.equal(renomeia.body.dados.categoria, 'Qualifica Profissional');

  assert.equal((await comGestor(request(app).post(`/api/arquivos/${arquivo.id}/download`))).body.dados.downloads, 1);

  const remove = await comGestor(request(app).delete(`/api/arquivos/${arquivo.id}`));
  assert.equal(remove.status, 200);
  assert.equal((await request(app).get('/' + arquivo.url)).status, 404);
});

test('upload recusa formato não aceito e exige perfil de gestão', async () => {
  const formato = await comGestor(request(app).post('/api/arquivos'))
    .attach('arquivo', Buffer.from('#!/bin/sh'), 'script.sh');
  assert.equal(formato.status, 400);
  assert.match(formato.body.erro, /Formato/);

  const semArquivo = await comGestor(request(app).post('/api/arquivos')).field('titulo', 'sem anexo');
  assert.equal(semArquivo.status, 400);

  const negado = await request(app).post('/api/arquivos')
    .set('Authorization', `Bearer ${tokenProfissional}`)
    .attach('arquivo', Buffer.from('x'), 'a.pdf');
  assert.equal(negado.status, 403);
});

test('arquivo vinculado a um material só sai com ?forcar=true', async () => {
  const envio = await comGestor(request(app).post('/api/arquivos'))
    .field('titulo', 'Cartilha da gestante').field('categoria', 'Material')
    .attach('arquivo', Buffer.from('%PDF-1.4'), 'cartilha.pdf');
  const arquivo = envio.body.dados;
  const politica = (await request(app).get('/api/politicas')).body.dados[0];
  const material = await comGestor(request(app).post('/api/materiais'))
    .send({ politica_id: politica.id, titulo: 'Cartilha da gestante', url: arquivo.url, tags: ['gestante'] });
  assert.equal(material.status, 201);

  const bloqueado = await comGestor(request(app).delete(`/api/arquivos/${arquivo.id}`));
  assert.equal(bloqueado.status, 409);
  assert.match(bloqueado.body.erro, /referenciado/);

  assert.equal((await comGestor(request(app).delete(`/api/arquivos/${arquivo.id}?forcar=true`))).status, 200);
  assert.equal((await comGestor(request(app).delete(`/api/materiais/${material.body.dados.id}`))).status, 200);
});

// --------------------------------------------------------- CRUD dos conteúdos
test('produto do PPGSMI: cria, edita, lista e remove', async () => {
  const cria = await comGestor(request(app).post('/api/produtos'))
    .send({ tipo: 'E-book', titulo: 'Guia de aleitamento materno', ano: 2026, descricao: 'Produto técnico', url: 'uploads/guia.pdf' });
  assert.equal(cria.status, 201, JSON.stringify(cria.body));
  const id = cria.body.dados.id;
  assert.equal(cria.body.dados.visualizacoes, 0);

  const edita = await comGestor(request(app).put(`/api/produtos/${id}`)).send({ titulo: 'Guia de aleitamento (rev. 2026)' });
  assert.equal(edita.body.dados.titulo, 'Guia de aleitamento (rev. 2026)');
  assert.equal(edita.body.dados.tipo, 'E-book'); // PUT parcial preserva o resto

  const obtem = await request(app).get(`/api/produtos/${id}`);
  assert.equal(obtem.status, 200);
  assert.ok((await request(app).get('/api/produtos')).body.dados.some(p => p.id === id));

  assert.equal((await comGestor(request(app).delete(`/api/produtos/${id}`))).status, 200);
  assert.equal((await request(app).get(`/api/produtos/${id}`)).status, 404);
  assert.equal((await comGestor(request(app).delete(`/api/produtos/${id}`))).status, 404);
});

test('curso e aulas: CRUD encadeado com o Qualifica', async () => {
  const curso = (await comGestor(request(app).post('/api/cursos'))
    .send({ titulo: 'Acolhimento em obstetrícia', area: 'Obstetrícia', horas: 6, nivel: 'Intermediário' })).body.dados;
  assert.match(curso.id, /^c/);

  const aula = await comGestor(request(app).post('/api/aulas'))
    .send({ curso_id: curso.id, ordem: 0, titulo: 'Primeira escuta', duracao: '18 min', url: 'uploads/aula1.mp4' });
  assert.equal(aula.status, 201);
  assert.equal((await request(app).get(`/api/aulas?curso_id=${curso.id}`)).body.dados.length, 1);

  // a chave (curso, ordem) é única
  const repetida = await comGestor(request(app).post('/api/aulas'))
    .send({ curso_id: curso.id, ordem: 0, titulo: 'Duplicada' });
  assert.equal(repetida.status, 409);

  // o curso montado com as aulas continua vindo da rota de aprendizagem
  const comAulas = await request(app).get(`/api/cursos/${curso.id}`);
  assert.equal(comAulas.body.dados.aulas.length, 1);
  assert.equal(comAulas.body.dados.aulas[0].url, 'uploads/aula1.mp4');

  const modulo = (await comGestor(request(app).post('/api/qualifica-modulos'))
    .send({ titulo: 'Trilha de acolhimento', tipo: 'Capacitações online', aulas: 3 })).body.dados;
  const recurso = await comGestor(request(app).post('/api/qualifica-recursos'))
    .send({ modulo_id: modulo.id, titulo: 'Vídeo de abertura', url: 'uploads/aula1.mp4', tipo: 'Vídeo' });
  assert.equal(recurso.status, 201);
  const qualifica = (await request(app).get('/api/qualifica')).body.dados;
  assert.ok(qualifica.modulos.find(m => m.id === modulo.id).recursos.length === 1);

  const tipoInvalido = await comGestor(request(app).put(`/api/qualifica-modulos/${modulo.id}`)).send({ tipo: 'Inventado' });
  assert.equal(tipoInvalido.status, 400);

  // remover o curso leva as aulas (ON DELETE CASCADE)
  assert.equal((await comGestor(request(app).delete(`/api/cursos/${curso.id}`))).status, 200);
  assert.equal((await request(app).get(`/api/aulas?curso_id=${curso.id}`)).body.dados.length, 0);
  assert.equal((await comGestor(request(app).delete(`/api/qualifica-modulos/${modulo.id}`))).status, 200);
});

test('política e material: vínculo obrigatório e busca por tag', async () => {
  const politica = (await comAdmin(request(app).post('/api/politicas'))
    .send({ nome: 'Saúde do Adolescente (teste)', cor: '#1E4A7A', ordem: 90 })).body.dados;

  const duplicada = await comAdmin(request(app).post('/api/politicas')).send({ nome: 'Saúde do Adolescente (teste)' });
  assert.equal(duplicada.status, 409);

  const orfao = await comGestor(request(app).post('/api/materiais'))
    .send({ politica_id: 99999, titulo: 'Material solto', url: 'uploads/x.pdf' });
  assert.equal(orfao.status, 409);

  const material = (await comGestor(request(app).post('/api/materiais'))
    .send({ politica_id: politica.id, titulo: 'Caderneta do adolescente', url: 'uploads/cad.pdf', tags: ['adolescente', 'caderneta'] })).body.dados;
  assert.deepEqual(material.tags, ['adolescente', 'caderneta']);
  assert.ok((await request(app).get('/api/materiais?q=caderneta')).body.dados.length >= 1);
  assert.equal((await request(app).get(`/api/materiais?politica_id=${politica.id}`)).body.dados.length, 1);

  // a listagem agregada de /politicas já mostra o material novo
  const agregada = (await request(app).get('/api/politicas')).body.dados.find(p => p.id === politica.id);
  assert.equal(agregada.materiais.length, 1);

  assert.equal((await comGestor(request(app).delete(`/api/politicas/${politica.id}`))).status, 200);
  assert.equal((await request(app).get(`/api/materiais/${material.id}`)).status, 404); // cascata
});

test('documento, protocolo, link e evento completam o ciclo de edição', async () => {
  const doc = (await comGestor(request(app).post('/api/documentos'))
    .send({ titulo: 'POP de triagem', setor: 'Obstetrícia', url: 'uploads/pop.pdf', tags: ['pop'] })).body.dados;
  const revisado = await comGestor(request(app).put(`/api/documentos/${doc.id}`)).send({ status: 'Aprovado', versao: 'v2' });
  assert.equal(revisado.body.dados.status, 'Aprovado');
  const statusInvalido = await comGestor(request(app).put(`/api/documentos/${doc.id}`)).send({ status: 'Arquivado' });
  assert.equal(statusInvalido.status, 400);
  assert.equal((await comGestor(request(app).delete(`/api/documentos/${doc.id}`))).status, 200);

  const protocolo = (await comGestor(request(app).post('/api/protocolos'))
    .send({ nome: 'Protocolo de hemorragia pós-parto', setor: 'Obstetrícia', paginas: 12, pendente: true, url: 'uploads/hpp.pdf' })).body.dados;
  assert.equal(protocolo.pendente, true);
  assert.ok((await request(app).get('/api/protocolos')).body.dados.some(p => p.id === protocolo.id));
  assert.equal((await comGestor(request(app).put(`/api/protocolos/${protocolo.id}`)).send({ pendente: false })).body.dados.pendente, false);
  assert.equal((await comGestor(request(app).delete(`/api/protocolos/${protocolo.id}`))).status, 200);

  const link = (await comGestor(request(app).post('/api/links'))
    .send({ titulo: 'Portal do NEPeS', url: 'https://santamaria.rs.gov.br', categoria: 'Rede' })).body.dados;
  assert.equal((await comGestor(request(app).put(`/api/links/${link.id}`)).send({ categoria: 'Municipal' })).body.dados.categoria, 'Municipal');
  assert.equal((await comGestor(request(app).delete(`/api/links/${link.id}`))).status, 200);

  const evento = (await comGestor(request(app).post('/api/eventos'))
    .send({ dia: 12, mes: 9, hora: '14:00', titulo: 'Roda de conversa', local: 'NEPeS' })).body.dados;
  const diaInvalido = await comGestor(request(app).put(`/api/eventos/${evento.id}`)).send({ dia: 45 });
  assert.equal(diaInvalido.status, 400);
  assert.equal((await comGestor(request(app).put(`/api/eventos/${evento.id}`)).send({ hora: '15:30' })).body.dados.hora, '15:30');
  assert.equal((await comGestor(request(app).delete(`/api/eventos/${evento.id}`))).status, 200);
});

test('aviso para a rede aparece nas notificações do profissional', async () => {
  const aviso = await comGestor(request(app).post('/api/notificacoes'))
    .send({ titulo: 'Nova versão do protocolo', texto: 'Confira o acervo atualizado.' });
  assert.equal(aviso.status, 201);
  assert.equal(aviso.body.dados.usuario_id, null); // sem destinatário = toda a rede
  const minhas = await request(app).get('/api/notificacoes').set('Authorization', `Bearer ${tokenProfissional}`);
  assert.ok(minhas.body.dados.some(n => n.titulo === 'Nova versão do protocolo'));

  // aviso dirigido a uma pessoa: só o painel (Gestor+) vê todos
  const alvo = (await comGestor(request(app).get('/api/usuarios'))).body.dados
    .find(u => u.email === 'ana.ferraz@maternarsm.com.br');
  const dirigido = await comGestor(request(app).post('/api/notificacoes'))
    .send({ titulo: 'Certificado disponível', texto: 'Retire na coordenação.', usuario_id: alvo.id });
  assert.equal(dirigido.body.dados.usuario_id, alvo.id);
  const todas = await comGestor(request(app).get('/api/notificacoes/todas'));
  assert.equal(todas.status, 200);
  assert.ok(todas.body.dados.some(n => n.titulo === 'Certificado disponível' && n.destinatario === alvo.nome));
  const negado = await request(app).get('/api/notificacoes/todas')
    .set('Authorization', `Bearer ${tokenProfissional}`);
  assert.equal(negado.status, 403);

  assert.equal((await comGestor(request(app).delete(`/api/notificacoes/${aviso.body.dados.id}`))).status, 200);
  assert.equal((await comGestor(request(app).delete(`/api/notificacoes/${dirigido.body.dados.id}`))).status, 200);
});

test('escrita nos conteúdos é bloqueada para profissional e para quem não tem token', async () => {
  const semToken = await request(app).post('/api/produtos').send({ tipo: 'E-book', titulo: 'Sem token' });
  assert.equal(semToken.status, 401);
  const profissional = await request(app).post('/api/produtos')
    .set('Authorization', `Bearer ${tokenProfissional}`).send({ tipo: 'E-book', titulo: 'Sem permissão' });
  assert.equal(profissional.status, 403);
  const semCampo = await comGestor(request(app).post('/api/produtos')).send({ titulo: 'Sem tipo' });
  assert.equal(semCampo.status, 400);
  assert.match(semCampo.body.erro, /Campo obrigatório: tipo/);
  const semNada = await comGestor(request(app).put('/api/produtos/1')).send({});
  assert.equal(semNada.status, 400);
});

test('landing na raiz e plataforma em /app', async () => {
  const landing = await request(app).get('/');
  assert.equal(landing.status, 200);
  assert.match(landing.text, /Maternar Santa-mariense/);
  const painel = await request(app).get('/painel');
  assert.equal(painel.status, 200);
  const appHtml = await request(app).get('/app');
  assert.equal(appHtml.status, 200);
});
