import { test, expect } from '@playwright/test';

async function entrar(page, email) {
  await page.goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/(app|painel)(#.*)?$/);
}

test('localiza colega, conversa individual recebe sem recarregar e preserva histórico no celular', async ({ page, browser }) => {
  await entrar(page,'ana.ferraz@maternarsm.com.br');
  await page.goto('/app#mensagens');
  await page.getByLabel('Nome do colega').fill('Kalleby');
  await page.getByRole('button',{name:'Buscar colegas'}).click();
  await expect(page.locator('.chat-colega')).toHaveCount(1);
  await page.getByRole('button',{name:'Conversar com Kalleby Evangelho',exact:true}).click();
  await expect(page).toHaveURL(/#mensagens\?conversa=\d+/);
  const conversaURL=page.url();
  const contexto=await browser.newContext(), colega=await contexto.newPage();
  try {
    await entrar(colega,'kalleby@maternarsm.com.br');
    await colega.goto(conversaURL);
    await expect(colega.getByRole('heading',{name:'Conversa com Ana Beatriz Ferraz',exact:true})).toBeVisible();
    const texto='Conversa individual '+Date.now();
    await page.getByLabel('Sua mensagem').fill(texto);
    await page.getByRole('button',{name:'Enviar mensagem'}).click();
    await expect(colega.locator('.mensagens')).toContainText(texto,{timeout:10000});
    await colega.getByLabel('Sua mensagem').fill('Resposta individual');
    await colega.getByRole('button',{name:'Enviar mensagem'}).click();
    await expect(page.locator('.mensagens')).toContainText('Resposta individual',{timeout:10000});
    await page.getByLabel('Sua mensagem').fill('Rascunho individual');
    await page.locator('.canais a').first().click();
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('');
    await expect(page.locator('.mensagens')).not.toContainText(texto);
    await page.locator('.chat-conversas a').filter({hasText:'Kalleby Evangelho'}).click();
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('Rascunho individual');
    await page.reload();
    await expect(page.locator('.mensagens')).toContainText(texto);
    await page.screenshot({path:'test-results/ajustes-chat-desktop.png',fullPage:true});
    await page.setViewportSize({width:320,height:740});
    await page.screenshot({path:'test-results/ajustes-chat-mobile.png',fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  } finally { await contexto.close(); }
});

test('salva área e foto no perfil e permite remover a foto', async ({page,browser}) => {
  await entrar(page,'ana.ferraz@maternarsm.com.br');
  await page.goto('/app#perfil');
  await page.getByLabel('Área profissional',{exact:true}).selectOption('Enfermagem');
  await page.getByRole('button',{name:'Salvar perfil',exact:true}).click();
  await expect(page.locator('#mensagem')).toHaveText('Perfil atualizado.');
  await page.reload();
  await expect(page.getByLabel('Área profissional',{exact:true})).toHaveValue('Enfermagem');
  await page.getByLabel('Selecionar foto').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGOU86piYGBgYmBgYGBgAAAKZgDmu70C4wAAAABJRU5ErkJggg==','base64')});
  await page.getByRole('button',{name:'Salvar foto',exact:true}).click();
  await expect(page.getByAltText('Sua foto de perfil')).toBeVisible();
  await expect(page.getByAltText('Sua foto de perfil')).toHaveJSProperty('naturalWidth',2);
  await page.reload();
  await expect(page.getByAltText('Sua foto de perfil')).toBeVisible();
  await expect(page.getByAltText('Sua foto de perfil')).toHaveJSProperty('naturalWidth',2);
  const contexto=await browser.newContext(), colega=await contexto.newPage();
  try {
    await entrar(colega,'kalleby@maternarsm.com.br');
    await colega.goto('/app#mensagens?q=Ana&area=Enfermagem');
    await expect(colega.locator('.chat-colega')).toHaveCount(1);
    await expect(colega.locator('.chat-colega img.chat-foto')).toBeVisible();
    await expect(colega.locator('.chat-colega')).toContainText('Ana Beatriz Ferraz');
  } finally {await contexto.close();}
  await page.getByRole('button',{name:'Remover foto',exact:true}).click();
  await expect(page.getByAltText('Sua foto de perfil')).toHaveCount(0);
});
