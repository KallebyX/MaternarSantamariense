import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { db } from '../src/db/connection.js';
import { seed } from './fixtures/seed.js';

const app = criarApp();
let admin, gestor, pro;
const auth = (r, token = admin) => r.set('Authorization', `Bearer ${token}`);
async function login(email, senha = 'demo1234') {
  const r = await request(app).post('/api/auth/login').send({ email, senha });
  assert.equal(r.status, 200);
  return r.body.dados.token;
}
async function criar(rota, dados) {
  const r = await auth(request(app).post('/api/' + rota)).send(dados);
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.dados;
}
before(async () => {
  seed();
  admin = await login('kalleby@maternarsm.com.br');
  gestor = await login('maria.rocha@maternarsm.com.br');
  pro = await login('ana.ferraz@maternarsm.com.br');
});

test('aprovar administrador exige administrador, inclusive na rota de aprovação', async () => {
  const { usuario } = await criar('usuarios/convite', { nome: 'Admin pendente', email: 'admin-pendente@example.test', perfil: 'Administrador' });
  db.prepare("UPDATE usuarios SET situacao = 'Pendente' WHERE id = ?").run(usuario.id);
  assert.equal((await auth(request(app).post(`/api/usuarios/${usuario.id}/aprovar`), gestor)).status, 403);
  assert.equal((await auth(request(app).post(`/api/usuarios/${usuario.id}/aprovar`))).status, 200);
});

test('desativação pela edição não permite ressuscitar sessões após reativação', async () => {
  const email = 'revogacao@example.test';
  const { usuario } = await criar('usuarios/convite', { nome: 'Revogação', email, senha: 'Teste1234', trocarSenha: false });
  const token = await login(email, 'Teste1234');
  assert.equal((await auth(request(app).put(`/api/usuarios/${usuario.id}`)).send({ situacao: 'Desativado' })).status, 200);
  await auth(request(app).post(`/api/usuarios/${usuario.id}/reativar`));
  assert.equal((await auth(request(app).get('/api/auth/eu'), token)).status, 401);
  assert.ok(await login(email, 'Teste1234'));
});

test('perfil valida nome e recalcula as iniciais exibidas nas mensagens', async () => {
  assert.equal((await auth(request(app).put('/api/usuarios/eu'), pro).send({ nome: '  ' })).status, 400);
  assert.equal((await auth(request(app).put('/api/usuarios/eu'), pro).send({ nome: {} })).status, 400);
  const r = await auth(request(app).put('/api/usuarios/eu'), pro).send({ nome: 'Pessoa Auditada' });
  assert.equal(r.status, 200); assert.equal(r.body.dados.iniciais, 'PA');
});

test('URL normalizada não aceita esquemas ativos, controles ou endereços malformados', async () => {
  for (const url of [' javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,test', 'https://', 'http://[']) {
    const r = await auth(request(app).post('/api/links')).send({ titulo: 'Endereço inválido', url });
    assert.equal(r.status, 400, JSON.stringify(url));
  }
  assert.equal((await auth(request(app).post('/api/links')).send({ titulo: 'Válido', url: ' https://example.org/recurso ' })).status, 201);
});

for (const rota of ['documentos', 'politicas/1/materiais']) {
  test(`${rota}: escrita alternativa valida URL e etiquetas antes de alimentar a busca`, async () => {
    assert.equal((await auth(request(app).post('/api/' + rota)).send({ titulo: 'Inválido', url: 'javascript:alert(1)' })).status, 400);
    assert.equal((await auth(request(app).post('/api/' + rota)).send({ titulo: 'Inválido', url: 'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf', tags: [{}] })).status, 400);
    assert.equal((await request(app).get('/api/busca?q=xyz')).status, 200);
  });
}

test('CRUD rejeita objetos em texto, booleanos em números e contagens negativas', async () => {
  for (const dados of [{ titulo: {}, horas: 2 }, { titulo: 'Inválido', horas: true }, { titulo: 'Inválido', inscritos: -1 }]) {
    assert.equal((await auth(request(app).post('/api/cursos')).send({ area: 'Teste', ...dados })).status, 400);
  }
  assert.equal((await auth(request(app).post('/api/tarefas')).send({ titulo: 'Inválida', coluna: 3 })).status, 400);
});

test('edição e remoção de aula desfazem XP de progresso invalidado sem duplicar pontos', async () => {
  const c = await criar('cursos', { titulo: 'Progresso auditado', area: 'Teste', horas: 2 });
  const a = await criar('aulas', { curso_id: c.id, titulo: 'Versão 1', url: 'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf' });
  await auth(request(app).put(`/api/cursos/${c.id}`)).send({ publicado: true });
  const xp = (await auth(request(app).get('/api/progresso'), pro)).body.dados.xp;
  const concluir = () => auth(request(app).post(`/api/cursos/${c.id}/aulas/0/concluir`), pro);
  assert.equal((await concluir()).body.dados.xp, xp + 40);
  assert.equal((await concluir()).body.dados.xp, xp + 40);
  await auth(request(app).put(`/api/aulas/${a.id}`)).send({ titulo: 'Versão 2' });
  assert.equal((await auth(request(app).get('/api/progresso'), pro)).body.dados.xp, xp);
  await auth(request(app).put(`/api/cursos/${c.id}`)).send({ publicado: true });
  await concluir();
  await auth(request(app).delete(`/api/aulas/${a.id}`));
  assert.equal((await auth(request(app).get('/api/progresso'), pro)).body.dados.xp, xp);
});

test('excluir curso certificado não apaga a prova histórica', async () => {
  const c = await criar('cursos', { titulo: 'Curso certificado', area: 'Teste', horas: 2 });
  await criar('aulas', { curso_id: c.id, titulo: 'Aula', url: 'acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf' });
  await auth(request(app).put(`/api/cursos/${c.id}`)).send({ publicado: true });
  await auth(request(app).post(`/api/cursos/${c.id}/aulas/0/concluir`), pro);
  const cert = (await auth(request(app).post('/api/certificados'), pro).send({ cursoId: c.id })).body.dados;
  const antes = (await auth(request(app).get('/api/progresso'), pro)).body.dados;
  assert.equal((await auth(request(app).delete(`/api/cursos/${c.id}`))).status, 409);
  assert.deepEqual((await auth(request(app).get('/api/progresso'), pro)).body.dados, antes);
  assert.equal((await request(app).get('/api/certificados/verificar/' + cert.codigo)).status, 200);
});

test('trilha não referencia módulo inexistente e exclusão limpa os vínculos', async () => {
  assert.equal((await auth(request(app).post('/api/trilhas')).send({ nome: 'Inválida', modulos: [999999] })).status, 400);
  const m = await criar('qualifica-modulos', { titulo: 'Módulo vinculado auditado' });
  const t = await criar('trilhas', { nome: 'Trilha vinculada', modulos: [m.id] });
  assert.equal((await auth(request(app).delete(`/api/qualifica-modulos/${m.id}`))).status, 200);
  assert.deepEqual((await request(app).get(`/api/trilhas/${t.id}`)).body.dados.modulos, []);
});

test('biblioteca preserva arquivos vinculados por links e caminhos com barra inicial', async () => {
  const r = await auth(request(app).post('/api/arquivos')).attach('arquivo', Buffer.from('%PDF-1.4\naudit'), 'auditoria.pdf');
  assert.equal(r.status, 201);
  const a = r.body.dados;
  const link = await criar('links', { titulo: 'Arquivo vinculado', url: '/' + a.url + '?download=1#pagina' });
  assert.equal((await auth(request(app).delete(`/api/arquivos/${a.id}`))).status, 409);
  assert.equal((await request(app).get('/' + a.url)).status, 200);
  await auth(request(app).delete(`/api/links/${link.id}`));
  assert.equal((await auth(request(app).delete(`/api/arquivos/${a.id}`))).status, 200);
  assert.equal((await request(app).get('/' + a.url)).status, 404);
});

test('logs recusam limites inválidos sem erro interno ou consulta ilimitada', async () => {
  for (const limite of ['-1', '1.5', 'abc']) assert.equal((await auth(request(app).get('/api/admin/logs?limite=' + limite))).status, 400);
});

test('tarefas internas da coordenação não são acessíveis ao profissional', async () => {
  const t = await criar('tarefas', { titulo: 'Restrita à coordenação' });
  for (const caminho of ['/api/tarefas', '/api/tarefas/' + t.id]) {
    assert.equal((await auth(request(app).get(caminho), pro)).status, 403);
    assert.equal((await auth(request(app).get(caminho), gestor)).status, 200);
  }
});

test('todas as escritas de gestão negam anônimo e profissional', async () => {
  const rotas = ['cursos', 'aulas', 'qualifica-modulos', 'qualifica-recursos', 'trilhas', 'politicas', 'materiais', 'produtos', 'documentos', 'protocolos', 'links', 'eventos', 'projetos', 'notificacoes', 'conquistas', 'canais', 'tarefas'];
  for (const rota of rotas) {
    assert.equal((await request(app).post('/api/' + rota).send({})).status, 401, rota);
    assert.equal((await auth(request(app).post('/api/' + rota), pro).send({})).status, 403, rota);
    assert.equal((await auth(request(app).delete('/api/' + rota + '/999999'), pro)).status, 403, rota);
  }
});
