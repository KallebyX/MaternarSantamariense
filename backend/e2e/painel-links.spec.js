import { test, expect } from '@playwright/test';

async function entrarNosLinks(page) {
  await page.goto('/painel#links');
  await page.getByLabel('E-mail institucional').fill('kalleby@maternarsm.com.br');
  await page.getByLabel('Senha', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
}

test('Links úteis abre diretamente, busca dados reais, recarrega e acompanha o histórico', async ({ page }) => {
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  await entrarNosLinks(page);
  const item = page.getByRole('button', { name: 'Links úteis', exact: true });
  await expect(item).toHaveAttribute('aria-current', 'page');
  await expect(item).toBeInViewport();
  await page.getByRole('searchbox', { name: 'Buscar em links úteis' }).fill('ToolNurse');
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(1);
  await expect(page.locator('#conteudo tbody a')).toHaveAttribute('href', 'https://toolnurse.ufn.edu.br/');
  await page.reload();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
  await page.getByRole('button', { name: 'Documentos e POPs', exact: true }).click();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(40);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await item.click();
  await expect(page.locator('#secao-titulo')).toHaveText('Links úteis');
  await expect(page.locator('#secao-titulo')).toBeInViewport();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
  await page.goBack();
  await expect(page.locator('#secao-titulo')).toHaveText('Documentos e POPs');
  await page.goForward();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
  await item.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
  await page.goto('/painel#toString');
  await expect(page.locator('#secao-titulo')).toHaveText('Visão geral');
  expect(erros).toEqual([]);
});

test('falha na API de Links úteis exibe erro recuperável, sem tela vazia', async ({ page }) => {
  await entrarNosLinks(page);
  await page.route('**/api/links', r => r.abort());
  await page.reload();
  await expect(page.locator('#conteudo .erro')).toContainText('Não foi possível conectar');
  await page.unroute('**/api/links');
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
  await page.route('**/api/links', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"dados":null}' }));
  await page.reload();
  await expect(page.locator('#conteudo .erro')).toContainText('Não foi possível carregar os registros');
  await page.unroute('**/api/links');
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
});

for (const largura of [320, 390, 768, 1024, 1440]) test(`sidebar Lucide e Links úteis sem cortes a ${largura}px`, async ({ page, request }) => {
  await page.setViewportSize({ width: largura, height: 900 });
  await entrarNosLinks(page);
  const sprite = await request.get('/assets/lucide.svg');
  expect(sprite.ok()).toBe(true);
  expect(sprite.headers()['content-type']).toContain('image/svg+xml');
  const fonte = await sprite.text();
  const icones = await page.locator('#menu svg').evaluateAll(es => es.map(e => ({
    nome: e.querySelector('use').getAttribute('href').split('#')[1],
    oculto: e.getAttribute('aria-hidden'), largura: e.getBoundingClientRect().width,
    altura: e.getBoundingClientRect().height, desenho: e.getBBox().width,
  })));
  expect(icones).toHaveLength(22);
  for (const icone of icones) {
    expect(fonte).toContain(`id="${icone.nome}"`);
    expect(icone.oculto).toBe('true');
    expect(icone.largura).toBe(20); expect(icone.altura).toBe(20);
    expect(icone.desenho).toBeGreaterThan(0);
  }
  await expect(page.locator('#menu [aria-current=page]')).toBeInViewport();
  await expect(page.locator('#secao-titulo')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/links-sidebar-${largura}.png` });
  if (largura <= 900) {
    await page.getByRole('searchbox', { name: 'Buscar em links úteis' }).fill('Sem resultado nesta busca QA');
    await expect(page.locator('#conteudo')).toContainText('Nenhum registro corresponde');
    const espaco = await page.evaluate(() => document.querySelector('aside').getBoundingClientRect().bottom - document.querySelector('aside .rodape').getBoundingClientRect().bottom);
    expect(espaco, 'A sidebar não deve crescer para preencher o espaço de uma listagem curta').toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/links-sidebar-vazio-${largura}.png` });
  }
});
