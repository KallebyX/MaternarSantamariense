import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function login(page, email = 'kalleby@maternarsm.com.br', senha = 'demo1234') {
  await page.goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-senha').fill(senha);
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/(app|painel)(#.*)?$/);
}

// Todos os recursos usam o formulário real, com POST, leitura após reload,
// edição, busca e exclusão. Só os registros deste teste são removidos.
const recursos = [
  ['cursos', 'titulo', { area: 'Auditoria', horas: '2' }],
  ['aulas', 'titulo', { curso_id: { select: 'c1' }, ordem: '99', url: 'https://example.org/aula.pdf' }],
  ['qualifica-modulos', 'titulo', {}],
  ['qualifica-recursos', 'titulo', { modulo_id: { select: '1' }, url: 'https://example.org/material.pdf' }],
  ['trilhas', 'nome', { modulos: '1, 2' }],
  ['politicas', 'nome', {}],
  ['materiais', 'titulo', { politica_id: { select: '1' }, url: 'https://example.org/material.pdf', tags: 'auditoria, teste' }],
  ['produtos', 'titulo', { tipo: 'Guia', ano: '2026' }],
  ['documentos', 'titulo', { descricao: 'Documento de teste', status: { select: 'Aprovado' }, tags: 'auditoria' }],
  ['protocolos', 'nome', { paginas: '3', versao: '1' }],
  ['links', 'titulo', { url: 'https://example.org/recurso' }],
  ['eventos', 'titulo', { dia: '15', mes: '10', ano: '2026', hora: '14:00' }],
  ['projetos', 'titulo', { responsavel: 'Equipe de teste' }],
  ['notificacoes', 'titulo', { texto: 'Comunicado de teste' }],
  ['conquistas', 'nome', { nivel: '2' }],
  ['canais', 'nome', { subtitulo: 'Canal de teste' }],
  ['tarefas', 'titulo', { prioridade: { select: 'Alta' }, coluna: '1' }],
];

for (const [rota, campo, dados] of recursos) {
  test(`painel: ciclo completo de ${rota} pela interface`, async ({ page }) => {
    const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    await login(page);
    await page.locator(`#menu [data-secao="${rota}"]`).click();
    await page.locator('#secao-acoes button').filter({ hasText: 'Novo' }).click();
    let titulo = 'Auditoria navegador ' + rota;
    await page.locator('#campo-' + campo).fill(titulo);
    for (const [nome, valor] of Object.entries(dados)) {
      if (typeof valor === 'object') await page.locator('#campo-' + nome).selectOption(valor.select);
      else await page.locator('#campo-' + nome).fill(valor);
    }
    await page.locator('#modal-salvar').click();
    await expect(page.locator('#modal')).not.toBeVisible();
    await page.reload();
    await page.locator('#conteudo input[type=search]').fill(titulo);
    let linha = page.locator('tbody tr').filter({ hasText: titulo });
    await expect(linha).toHaveCount(1);
    if (rota !== 'notificacoes') {
      await linha.getByRole('button', { name: 'Editar', exact: true }).click();
      titulo += ' revisado';
      await page.locator('#campo-' + campo).fill(titulo);
      await page.locator('#modal-salvar').click();
      await expect(page.locator('#modal')).not.toBeVisible();
      await page.reload();
      await page.locator('#conteudo input[type=search]').fill(titulo);
      linha = page.locator('tbody tr').filter({ hasText: titulo });
      await expect(linha).toHaveCount(1);
    }
    page.once('dialog', d => d.accept());
    await linha.getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(linha).toHaveCount(0);
    await page.reload();
    await page.locator('#conteudo input[type=search]').fill(titulo);
    await expect(page.locator('#conteudo')).toContainText('Nenhum registro corresponde');
    expect(erros).toEqual([]);
  });
}

test('painel não apresenta contagens zero quando a API falha e permite tentar novamente', async ({ page }) => {
  await login(page);
  await page.route('**/api/usuarios', r => r.abort());
  await page.reload();
  await expect(page.locator('#conteudo .erro')).toBeVisible();
  await expect(page.locator('#conteudo .indicador')).toHaveCount(0);
  await page.unroute('**/api/usuarios');
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.locator('#conteudo .indicador').first()).toBeVisible();
});

test('troca rápida de seção ignora resposta atrasada da seção anterior', async ({ page }) => {
  await login(page);
  let liberar;
  const aguardar = new Promise(resolve => { liberar = resolve; });
  let recebeu;
  const recebido = new Promise(resolve => { recebeu = resolve; });
  await page.route('**/api/cursos?gestao=1', async r => {
    const resposta = await r.fetch();
    recebeu();
    await aguardar;
    await r.fulfill({ response: resposta });
  });
  await page.locator('#menu [data-secao=cursos]').click();
  await recebido;
  await page.locator('#menu [data-secao=links]').click();
  await expect(page.locator('#conteudo th')).toContainText(['Título', 'Categoria', 'Endereço', 'Descrição', 'Ações']);
  const resposta = page.waitForResponse('**/api/cursos?gestao=1');
  liberar();
  await resposta;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(page.locator('#secao-titulo')).toHaveText('Links úteis');
  await expect(page.locator('#conteudo th')).toContainText(['Título', 'Categoria', 'Endereço', 'Descrição', 'Ações']);
});

test('gestão convida, edita, desativa, reativa e redefine acesso sem reviver a sessão antiga', async ({ page, browser }) => {
  await login(page);
  await page.locator('#menu [data-secao=equipe]').click();
  await page.getByRole('button', { name: 'Convidar profissional', exact: true }).click();
  await page.locator('#campo-nome').fill('Pessoa auditoria de acesso');
  await page.locator('#campo-email').fill('auditoria-acesso@example.test');
  await page.locator('#campo-senha').fill('Auditoria1234');
  await page.locator('#campo-trocarSenha').uncheck();
  await page.locator('#modal-salvar').click();
  await expect(page.locator('#modal')).not.toBeVisible();
  const ctx = await browser.newContext();
  const pessoa = await ctx.newPage();
  await login(pessoa, 'auditoria-acesso@example.test', 'Auditoria1234');
  const token = await pessoa.evaluate(() => localStorage.getItem('maternar.token'));
  const linha = page.locator('tr').filter({ hasText: 'auditoria-acesso@example.test' });
  await linha.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.locator('#campo-situacao').selectOption('Desativado');
  await page.locator('#modal-salvar').click();
  await expect(linha).toContainText('Desativado');
  page.once('dialog', d => d.accept());
  await linha.getByRole('button', { name: 'Reativar', exact: true }).click();
  await expect(linha).toContainText('Ativo');
  expect((await pessoa.request.get('/api/auth/eu', { headers: { Authorization: 'Bearer ' + token } })).status()).toBe(401);
  await pessoa.reload();
  await expect(pessoa).toHaveURL(/\/#acesso$/);
  await linha.getByRole('button', { name: 'Senha', exact: true }).click();
  await page.locator('#campo-senha').fill('Redefinida1234');
  await page.locator('#modal-salvar').click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await login(pessoa, 'auditoria-acesso@example.test', 'Redefinida1234');
  await expect(pessoa).toHaveURL(/#perfil$/);
  await expect(pessoa.locator('#menu a')).toHaveCount(1);
  await ctx.close();
  page.once('dialog', d => d.accept());
  await linha.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(linha).toHaveCount(0);
});

test('admin exporta JSON legível sem hashes de senha e usa formulário no celular', async ({ page }) => {
  await login(page);
  await page.locator('#menu [data-secao=registros]').click();
  const esperando = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar backup (JSON)' }).click();
  const download = await esperando;
  const dados = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(dados.tabelas.usuarios.length).toBeGreaterThan(0);
  expect(dados.tabelas.usuarios.every(u => !('senha_hash' in u))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#abrir-menu').click();
  await page.locator('#menu [data-secao=links]').click();
  await page.getByRole('button', { name: 'Novo link' }).click();
  await page.locator('#campo-titulo').fill('Celular');
  expect(await page.locator('#modal').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal')).not.toBeVisible();
});

test('ToolNurse aparece em produtos e links; atalhos internos levam às seções reais', async ({ page }) => {
  await login(page, 'ana.ferraz@maternarsm.com.br');
  await page.goto('/app#produtos');
  const produto = page.locator('article').filter({ hasText: 'ToolNurse — UFN' });
  await expect(produto.getByRole('link', { name: 'Abrir produto' })).toHaveAttribute('href', 'https://toolnurse.ufn.edu.br/');
  await expect(produto.getByRole('link', { name: /^Baixar/ })).toHaveCount(0);
  const pdf = page.locator('article').filter({ hasText: 'Gestação de Alto Risco — Manual Técnico' });
  await expect(pdf.getByRole('link', { name: /^Baixar/ })).toBeVisible();
  await page.goto('/app#links');
  await expect(page.locator('article').filter({ hasText: 'ToolNurse — UFN' }).getByRole('link')).toHaveAttribute('href', 'https://toolnurse.ufn.edu.br/');
  for (const [titulo, destino] of [['Portal interno Maternar', 'inicio'], ['Suporte técnico da plataforma', 'mensagens']]) {
    const link = page.locator('article').filter({ hasText: titulo }).getByRole('link');
    await expect(link).toHaveAttribute('href', 'http://127.0.0.1:3101/app#' + destino);
    const popup = page.waitForEvent('popup');
    await link.click();
    const nova = await popup;
    await expect(nova).toHaveURL(new RegExp('/app#' + destino + '$'));
    await expect(nova.locator('#conteudo')).not.toContainText('Carregando…');
    await expect(nova.locator('#conteudo .erro')).toHaveCount(0);
    await nova.close();
  }
});
