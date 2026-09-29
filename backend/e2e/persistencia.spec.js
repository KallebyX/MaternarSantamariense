import { test, expect } from '@playwright/test';

async function entrar(page, email) {
  await page.goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-senha').fill('Persistencia123!');
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/painel(?:#.*)?$/);
}

test('formação e detalhes salvos aparecem imediatamente e persistem entre painel, plataforma e novo login', async ({ page, request }) => {
  const login = await request.post('/api/auth/login', { data: { email: 'kalleby@maternarsm.com.br', senha: 'demo1234' } });
  const headers = { Authorization: 'Bearer ' + (await login.json()).dados.token };
  const email = 'perfil-persistencia@example.test';
  const convite = await request.post('/api/usuarios/convite', { headers, data: { nome: 'Pessoa Persistência', email, perfil: 'Gestor', senha: 'Persistencia123!', trocarSenha: false, formacao: 'Formação anterior' } });
  expect(convite.status()).toBe(201);
  const usuario = (await convite.json()).dados.usuario;
  try {
    await entrar(page, email);
    await page.goto('/app#perfil');
    await page.getByLabel('Formação profissional').fill('Engenharia Biomédica');
    await page.getByLabel('Profissão na SMS').fill('Desenvolvimento');
    await page.getByLabel('Local de atuação').fill('UFN');
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page.locator('#mensagem')).toHaveText('Perfil atualizado.');
    await expect(page.locator('dl')).toContainText('Engenharia Biomédica');
    await expect(page.locator('dl')).not.toContainText('Formação anterior');
    await page.reload();
    await expect(page.getByLabel('Formação profissional')).toHaveValue('Engenharia Biomédica');
    await page.goto('/painel#perfil');
    await expect(page.locator('#conteudo')).toContainText('Engenharia Biomédica');
    await page.getByRole('button', { name: 'Editar meus dados' }).click();
    await page.locator('#campo-formacao').fill('Engenharia Biomédica e Pesquisa');
    await page.locator('#campo-cargo').fill('Pesquisador');
    await page.locator('#campo-unidade').fill('UFN — GESTAR');
    await page.locator('#modal-salvar').click();
    await expect(page.locator('#modal')).not.toBeVisible();
    await expect(page.locator('#conteudo')).toContainText('Engenharia Biomédica e Pesquisa');
    await expect(page.locator('#perfil-sou')).toContainText('UFN — GESTAR');
    await page.locator('#sair').click();
    await entrar(page, email);
    await page.goto('/app#perfil');
    await expect(page.getByLabel('Formação profissional')).toHaveValue('Engenharia Biomédica e Pesquisa');
    await expect(page.getByLabel('Profissão na SMS')).toHaveValue('Pesquisador');
    await expect(page.getByLabel('Local de atuação')).toHaveValue('UFN — GESTAR');
  } finally { await request.delete('/api/usuarios/' + usuario.id, { headers }); }
});

test('limpar campos opcionais no painel persiste a remoção do nível e da quantidade', async ({ page, request }) => {
  const login = await request.post('/api/auth/login', { data: { email: 'kalleby@maternarsm.com.br', senha: 'demo1234' } });
  const headers = { Authorization: 'Bearer ' + (await login.json()).dados.token };
  const resposta = await request.post('/api/qualifica-modulos', { headers, data: { titulo: 'Módulo para verificar limpeza', nivel: 'Avançado', aulas: 9 } });
  expect(resposta.status()).toBe(201);
  const modulo = (await resposta.json()).dados;
  try {
    await page.goto('/');
    await page.locator('#login-email').fill('kalleby@maternarsm.com.br');
    await page.locator('#login-senha').fill('demo1234');
    await page.locator('#form-login button[type=submit]').click();
    await page.locator('#menu [data-secao=qualifica-modulos]').click();
    await page.getByRole('row').filter({ hasText: modulo.titulo }).getByRole('button', { name: 'Editar', exact: true }).click();
    await page.locator('#campo-nivel').selectOption('');
    await page.locator('#campo-aulas').fill('');
    await page.locator('#modal-salvar').click();
    await expect(page.locator('#modal')).not.toBeVisible();
    await page.reload();
    await page.getByRole('row').filter({ hasText: modulo.titulo }).getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page.locator('#campo-nivel')).toHaveValue('');
    await expect(page.locator('#campo-aulas')).toHaveValue('0');
    const salvo = (await (await request.get('/api/qualifica-modulos/' + modulo.id, { headers })).json()).dados;
    expect(salvo.nivel).toBe('');
    expect(salvo.aulas).toBe(0);
  } finally { await request.delete('/api/qualifica-modulos/' + modulo.id, { headers }); }
});
