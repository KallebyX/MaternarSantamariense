import { test, expect } from '@playwright/test';

async function entrar(page) {
  await page.goto('/');
  await page.locator('#login-email').fill('ana.ferraz@maternarsm.com.br');
  await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/app/);
}

test('posicionamento: páginas curtas começam no topo, sem centralização vertical', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  await entrar(page);
  for (const rota of ['cursos?q=sem-resultado-mobile','agenda?q=sem-resultado-mobile','avisos','certificados','sobre','inicio','qualifica','politicas','protocolos','documentos','produtos','projetos','mensagens','links','perfil']) {
    await page.goto('/app#'+rota);
    await expect(page.locator('#conteudo')).not.toContainText('Carregando…');
    const topo=await page.locator('main').evaluate(el=>el.getBoundingClientRect().top);
    expect(topo,rota).toBeGreaterThanOrEqual(0);
    expect(topo,rota).toBeLessThanOrEqual(24);
  }
});

for (const tela of [{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:844,height:390}]) {
  test(`navegação, foco e todos os logos em ${tela.width}x${tela.height}`, async ({page}) => {
    await page.setViewportSize(tela);
    const erros=[];page.on('pageerror',e=>erros.push(e.message));
    await entrar(page);
    await expect(page.locator('#abrir-menu')).toBeVisible();
    await expect(page.locator('#menu')).not.toBeVisible();
    await page.locator('#abrir-menu').click();
    await expect(page.locator('#menu-mobile-dialog')).toBeVisible();
    await expect(page.locator('#abrir-menu')).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#fechar-menu')).toBeFocused();
    // O último controle retorna ao início, sem permitir foco no conteúdo de fundo.
    await page.locator('#sair').focus();await page.keyboard.press('Tab');
    expect(await page.evaluate(()=>!!document.activeElement.closest('#menu-mobile-dialog'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#abrir-menu')).toBeFocused();
    await expect(page.locator('#abrir-menu')).toHaveAttribute('aria-expanded','false');
    await page.locator('#abrir-menu').click();
    await page.locator('#menu a[href="#links"]').click();
    await expect(page.locator('#menu-mobile-dialog')).not.toBeVisible();
    await expect(page.locator('#titulo')).toHaveText('Links úteis');
    const layout=await page.evaluate(()=>({main:document.querySelector('main').getBoundingClientRect().top,toolbar:document.querySelector('.mobile-toolbar').getBoundingClientRect().bottom,width:document.documentElement.scrollWidth}));
    expect(layout.main).toBeGreaterThanOrEqual(layout.toolbar);
    expect(layout.main-layout.toolbar).toBeLessThanOrEqual(20);
    expect(layout.width).toBeLessThanOrEqual(tela.width);
    const logos=page.locator('footer img');await expect(logos).toHaveCount(6);
    for(const logo of await logos.all()) {
      await logo.scrollIntoViewIfNeeded();
      await expect.poll(()=>logo.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);
      const r=await logo.boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(tela.width);
    }
    await page.screenshot({path:`test-results/mobile-footer-${tela.width}.png`});
    await page.locator('#abrir-menu').click();
    await page.mouse.click(tela.width-8,Math.min(150,tela.height-8));
    await expect(page.locator('#menu-mobile-dialog')).not.toBeVisible();
    await page.locator('#abrir-menu').click();
    await page.setViewportSize({width:1440,height:1000});
    await expect(page.locator('#plataforma > aside')).toBeVisible();
    expect(await page.evaluate(()=>document.body.classList.contains('mobile-navigation-open'))).toBe(false);
    await page.setViewportSize(tela);
    await page.locator('#abrir-menu').click();
    await page.locator('#menu a[href="#certificados"]').click();
    await expect(page.locator('#titulo')).toHaveText('Meus certificados');
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    await expect(page.locator('#titulo')).toBeInViewport();
    await page.screenshot({path:`test-results/mobile-certificados-${tela.width}.png`});
    expect(erros).toEqual([]);
  });
}

test('página pública: menu móvel, âncoras e seis logos institucionais',async({page})=>{
  await page.setViewportSize({width:320,height:568});await page.goto('/');
  await page.locator('#menu-alternar').click();
  await expect(page.locator('#menu-principal')).toBeVisible();
  await page.locator('#menu-principal a[href="#acesso"]').click();
  await expect(page.locator('#menu-principal')).not.toBeVisible();
  await expect(page.locator('#login-email')).toBeInViewport();
  expect(await page.locator('#login-email').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  await expect(page.locator('footer .logos img')).toHaveCount(6);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
});

test('painel móvel: sair fecha o menu e permite entrar novamente',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/painel');
  await page.getByLabel('E-mail institucional').fill('kalleby@maternarsm.com.br');
  await page.getByLabel('Senha',{exact:true}).fill('demo1234');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.locator('#abrir-menu').click();await page.locator('#sair').click();
  await expect(page.locator('#menu-mobile-dialog')).not.toBeVisible();
  await expect(page.locator('#tela-login')).toBeVisible();
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.locator('#abrir-menu').click();
  await page.locator('#menu [data-secao=links]').click();
  await expect(page.locator('#conteudo tbody tr')).toHaveCount(11);
});

test('painel móvel: sessão expirada encerra também o menu aberto',async({page,request})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/painel#perfil');
  await page.getByLabel('E-mail institucional').fill('kalleby@maternarsm.com.br');
  await page.getByLabel('Senha',{exact:true}).fill('demo1234');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.locator('#secao-titulo')).toHaveText('Meu perfil');
  const token=await page.evaluate(()=>localStorage.getItem('maternar.token'));
  await request.post('/api/auth/logout',{headers:{Authorization:`Bearer ${token}`}});
  let liberar;const espera=new Promise(resolve=>liberar=resolve);
  await page.route('**/api/usuarios',async route=>{await espera;await route.continue();});
  await page.locator('#abrir-menu').click();
  await page.locator('#menu [data-secao=equipe]').click();
  await page.locator('#abrir-menu').click();
  liberar();
  await expect(page.locator('#tela-login')).toBeVisible();
  await expect(page.locator('#menu-mobile-dialog')).not.toBeVisible();
  expect(await page.evaluate(()=>document.body.classList.contains('mobile-navigation-open'))).toBe(false);
});
