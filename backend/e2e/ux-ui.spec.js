import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function login(page,email='ana.ferraz@maternarsm.com.br') {
  await page.goto('/');await page.locator('#login-email').fill(email);await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();await page.waitForURL(/\/(app|painel)(#.*)?$/);
}
async function pronto(page) {
  await expect(page.locator('#conteudo')).not.toContainText('Carregando');
  await expect(page.locator('#conteudo')).not.toBeEmpty();
  await expect(page.locator('#conteudo > .erro, #conteudo > .aviso.erro')).toHaveCount(0);
}

test('chat entre duas sessões recebe sem recarregar, preserva rascunho e separa canais',async({page,browser})=>{
  const erros=[];page.on('pageerror',e=>erros.push(e.message));
  await login(page);await page.goto('/app#mensagens?canal=obst');
  const contexto=await browser.newContext(),colega=await contexto.newPage();
  try {
    await login(colega,'kalleby@maternarsm.com.br');await colega.goto('/app#mensagens?canal=obst');
    await page.getByLabel('Sua mensagem').fill('Meu rascunho preservado');
    const texto='Mensagem real entre sessões '+Date.now();
    await colega.getByLabel('Sua mensagem').fill(texto);await colega.getByRole('button',{name:'Enviar mensagem'}).click();
    await expect(page.locator('.mensagens')).toContainText(texto,{timeout:10000});
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('Meu rascunho preservado');
    await page.getByRole('button',{name:'Enviar mensagem'}).click();
    await expect(colega.locator('.mensagens')).toContainText('Meu rascunho preservado',{timeout:10000});
    await page.getByLabel('Sua mensagem').fill('Rascunho por canal');
    await page.locator('.canais a[href$="canal=plantao"]').click();
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('');
    await expect(page.locator('.mensagens')).not.toContainText(texto);
    await page.locator('.canais a[href$="canal=obst"]').click();
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('Rascunho por canal');
    await page.reload();await expect(page.locator('.mensagens')).toContainText(texto);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'test-results/ux-chat-mobile.png',fullPage:true});
    expect(erros).toEqual([]);
  } finally {await contexto.close();}
});

test('chat reconecta e repetir envio com resposta perdida não duplica o registro',async({page})=>{
  await login(page);await page.goto('/app#mensagens?canal=obst');
  const texto='Confirmação única '+Date.now();
  let perder=true;
  await page.route('**/api/canais/obst/mensagens',async rota=>{
    if(rota.request().method()==='POST'&&perder){perder=false;await rota.fetch();await rota.abort();}
    else await rota.continue();
  });
  await page.getByLabel('Sua mensagem').fill(texto);await page.getByRole('button',{name:'Enviar mensagem'}).click();
  await expect(page.locator('[data-form=mensagem] [role=alert]')).toContainText('Não foi possível conectar');
  await expect(page.getByLabel('Sua mensagem')).toHaveValue(texto);
  await page.getByRole('button',{name:'Enviar mensagem'}).click();
  await expect(page.getByLabel('Sua mensagem')).toHaveValue('');
  await page.reload();await expect(page.locator('.mensagem').filter({hasText:texto})).toHaveCount(1);
  await page.route('**/api/canais/obst/mensagens?depois=*',r=>r.abort());
  await expect(page.locator('[data-chat-status]')).toContainText('Verifique sua conexão',{timeout:10000});
  await page.getByLabel('Sua mensagem').fill('Preservado sem conexão');
  await page.unroute('**/api/canais/obst/mensagens?depois=*');
  await page.getByRole('button',{name:'Tentar reconectar'}).click();
  await expect(page.locator('[data-chat-status]')).toHaveText('Atualização automática');
  await expect(page.getByLabel('Sua mensagem')).toHaveValue('Preservado sem conexão');
});

test('histórico anterior, mensagem longa e HTML mantêm layout e texto literal',async({page,request})=>{
  const resposta=await request.post('/api/auth/login',{data:{email:'kalleby@maternarsm.com.br',senha:'demo1234'}});
  const headers={Authorization:'Bearer '+(await resposta.json()).dados.token};
  const canal=(await (await request.post('/api/canais',{headers,data:{nome:'Histórico UX QA'}})).json()).dados.id;
  try {
    for(let i=0;i<55;i++)expect((await request.post(`/api/canais/${canal}/mensagens`,{headers,data:{texto:'Histórico verificado '+i}})).status()).toBe(201);
    await login(page);await page.goto('/app#mensagens?canal='+canal);
    await expect(page.locator('.mensagem')).toHaveCount(50);
    await page.getByLabel('Sua mensagem').fill('Rascunho ao ler histórico');
    await page.getByRole('button',{name:'Carregar mensagens anteriores'}).click();
    await expect(page.locator('.mensagem')).toHaveCount(55);
    await expect(page.getByLabel('Sua mensagem')).toHaveValue('Rascunho ao ler histórico');
    const texto='<img src=x onerror=alert(1)> '+ 'palavra'.repeat(270);
    await page.setViewportSize({width:320,height:740});await page.getByLabel('Sua mensagem').fill(texto);
    await page.getByRole('button',{name:'Enviar mensagem'}).click();
    await expect(page.locator('.mensagem').last().locator('p')).toHaveText(texto);
    await expect(page.locator('.mensagens img')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  } finally {await request.delete('/api/canais/'+canal,{headers});}
});

test('falha na biblioteca e referências do formulário permite recuperação explícita',async({page})=>{
  await login(page,'kalleby@maternarsm.com.br');
  await page.route('**/api/arquivos',r=>r.abort());
  await page.locator('#menu [data-secao=biblioteca]').click();
  await expect(page.locator('#conteudo .erro')).toContainText('Não foi possível conectar');
  await page.locator('#menu [data-secao=produtos]').click();await page.getByRole('button',{name:'Novo produto'}).click();
  await expect(page.locator('#modal')).toBeVisible();await expect(page.locator('#modal-aviso')).toContainText('Não foi possível conectar');
  await expect(page.locator('#modal-salvar')).toBeDisabled();
  await page.unroute('**/api/arquivos');await page.locator('#modal').getByRole('button',{name:'Tentar novamente'}).click();
  await expect(page.locator('#campo-titulo')).toBeVisible();await expect(page.locator('#modal-salvar')).toBeEnabled();
  await page.keyboard.press('Escape');
  await page.route('**/api/cursos?gestao=1',r=>r.abort());
  // O formulário de aulas carrega os cursos; falha não pode aparecer como lista vazia.
  await page.locator('#menu [data-secao=aulas]').click();
  await expect(page.locator('#conteudo .erro')).toContainText('Não foi possível conectar');
  await page.unroute('**/api/cursos?gestao=1');await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
  await pronto(page);
});

test('upload pendente bloqueia salvar até arquivo persistido',async({page})=>{
  await login(page,'kalleby@maternarsm.com.br');await page.locator('#menu [data-secao=produtos]').click();
  await page.getByRole('button',{name:'Novo produto'}).click();await page.locator('#campo-titulo').fill('Upload pendente');
  let liberar,receber;
  const trava=new Promise(r=>liberar=r),recebido=new Promise(r=>receber=r);
  await page.route('**/api/arquivos',async rota=>{
    if(rota.request().method()==='POST'){const resposta=await rota.fetch();receber();await trava;await rota.fulfill({response:resposta});}
    else await rota.continue();
  });
  const pdf=readFileSync(new URL('../../acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf',import.meta.url));
  await page.locator('#modal input[type=file]').first().setInputFiles({name:'ux-upload.pdf',mimeType:'application/pdf',buffer:pdf});
  await recebido;
  try {await expect(page.locator('#modal-salvar')).toBeDisabled();} finally {liberar();}
  await expect(page.locator('#campo-url')).toHaveValue(/uploads\/ux-upload/);
  await expect(page.locator('#modal-salvar')).toBeEnabled();await page.keyboard.press('Escape');
});

test('configurações do gestor salvam perfil e senha, validam confirmação e revogam sessão antiga',async({page,request})=>{
  const admin=(await (await request.post('/api/auth/login',{data:{email:'kalleby@maternarsm.com.br',senha:'demo1234'}})).json()).dados.token;
  const headers={Authorization:'Bearer '+admin},email='gestor-ux@example.test';
  const convite=await request.post('/api/usuarios/convite',{headers,data:{nome:'Gestor QA',email,perfil:'Gestor',senha:'demo1234',trocarSenha:false}});
  expect(convite.status()).toBe(201);
  const usuario=(await convite.json()).dados.usuario;
  try {
    await login(page,email);await page.locator('#menu [data-secao=perfil]').click();
    const tokenAntigo=await page.evaluate(()=>localStorage.getItem('maternar.token'));
    await page.getByRole('button',{name:'Editar meus dados'}).click();
    await page.locator('#campo-nome').fill('Gestor QA atualizado');await page.locator('#campo-telefone').fill('55912345678');
    await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
    await expect(page.locator('#quem-sou')).toHaveText('Gestor QA atualizado');
    await page.reload();await expect(page.locator('#conteudo')).toContainText('55912345678');
    await page.locator('#atual').fill('demo1234');await page.locator('#nova').fill('NovaSenha123!');await page.locator('#confirmar-nova').fill('Diferente123!');
    await page.getByRole('button',{name:'Trocar senha',exact:true}).click();await expect(page.locator('#conteudo .aviso.erro')).toHaveText('As senhas não conferem.');
    await page.locator('#confirmar-nova').fill('NovaSenha123!');await page.getByRole('button',{name:'Trocar senha',exact:true}).click();
    await expect(page.locator('#conteudo .aviso.ok')).toHaveText('Senha atualizada.');
    expect((await request.get('/api/auth/eu',{headers:{Authorization:'Bearer '+tokenAntigo}})).status()).toBe(401);
    expect((await request.post('/api/auth/login',{data:{email,senha:'demo1234'}})).status()).toBe(401);
    expect((await request.post('/api/auth/login',{data:{email,senha:'NovaSenha123!'}})).status()).toBe(200);
    await page.reload();await pronto(page);
  } finally {await request.delete('/api/usuarios/'+usuario.id,{headers});}
});

test('atalho de teclado preserva rota e recurso retirado não aparece',async({page})=>{
  await login(page);await page.goto('/app#qualifica');await pronto(page);
  await expect(page.locator('a[href*=luisapinheiro]')).toHaveCount(0);
  await page.locator('.pular').focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#qualifica$/);await expect(page.locator('#conteudo')).toBeFocused();
});

for(const largura of [320,390,768,1440])test(`layouts: todas as seções profissionais e de gestão em ${largura}px`,async({page})=>{
  test.setTimeout(180000);
  const erros=[];page.on('pageerror',e=>erros.push(e.message));
  await page.setViewportSize({width:largura,height:900});
  async function larguraCorreta(contexto){
    const tamanho=await page.evaluate(()=>({pagina:document.documentElement.scrollWidth,tela:innerWidth}));
    expect(tamanho.pagina,contexto).toBeLessThanOrEqual(tamanho.tela+1);
  }
  await page.goto('/');await larguraCorreta('Página pública');
  if([390,1440].includes(largura))await page.screenshot({path:`test-results/ux-publico-${largura}.png`,fullPage:true});
  await login(page);
  for(const rota of ['inicio','cursos','qualifica','politicas','protocolos','documentos','produtos','projetos','agenda','mensagens','avisos','certificados','links','perfil','sobre']){
    await page.goto('/app#'+rota);await pronto(page);await larguraCorreta('Profissional '+rota);
    if(['inicio','qualifica','perfil'].includes(rota)&&[390,1440].includes(largura))await page.screenshot({path:`test-results/ux-${rota}-${largura}.png`,fullPage:rota!=='qualifica'});
  }
  await login(page,'kalleby@maternarsm.com.br');
  const secoes=await page.locator('#menu button').evaluateAll(bs=>bs.map(b=>b.dataset.secao));
  for(const secao of secoes){
    await page.locator(`#menu [data-secao="${secao}"]`).click();await pronto(page);await larguraCorreta('Gestão '+secao);
    const novo=page.locator('#secao-acoes button').filter({hasText:/^Novo /});
    if(await novo.count()){
      await novo.click();await expect(page.locator('#modal-salvar')).toBeEnabled();
      expect(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Modal '+secao).toBe(true);
      if(secao==='cursos'&&[390,1440].includes(largura))await page.screenshot({path:`test-results/ux-curso-modal-${largura}.png`});
      await page.keyboard.press('Escape');
    }
    if(['visao','equipe','perfil'].includes(secao)&&[390,1440].includes(largura))await page.screenshot({path:`test-results/ux-painel-${secao}-${largura}.png`,fullPage:false});
  }
  expect(erros).toEqual([]);
});
