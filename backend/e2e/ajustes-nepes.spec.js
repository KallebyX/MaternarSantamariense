import { test, expect } from '@playwright/test';
async function entrar(page,email='ana.ferraz@maternarsm.com.br') {
  await page.goto('/');await page.locator('#login-email').fill(email);await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();await page.waitForURL(/\/(app|painel)(#.*)?$/);
}
async function sessao(request,email='kalleby@maternarsm.com.br') {
  const resposta=await request.post('/api/auth/login',{data:{email,senha:'demo1234'}});expect(resposta.ok()).toBeTruthy();return (await resposta.json()).dados;
}
test('profissional cria e edita atividade no calendário e mantém dados ao recarregar',async({page,request})=>{
  const auth=await sessao(request,'ana.ferraz@maternarsm.com.br'),headers={Authorization:'Bearer '+auth.token};
  const titulo='Atividade equipe E2E '+Date.now();
  await entrar(page);await page.goto('/app#agenda?mes=11&ano=2026');
  for(const origem of ['NEPeS','Maternar','Profissionais'])await expect(page.locator('.agenda-legenda')).toContainText(origem);
  await page.locator('.agenda-nova summary').click();const form=page.locator('.agenda-nova form');
  await form.getByLabel('Atividade',{exact:true}).fill(titulo);await form.getByLabel('Data',{exact:true}).fill('2026-11-24');
  await form.getByLabel('Início',{exact:true}).fill('14:00');await form.getByLabel('Término (opcional)',{exact:true}).fill('15:00');
  await form.getByLabel('Local',{exact:true}).fill('Unidade de saúde');await form.getByRole('button',{name:'Adicionar atividade',exact:true}).click();
  const cartao=page.locator('.agenda-atividade').filter({has:page.getByRole('heading',{name:titulo,exact:true})});
  try {
    await expect(cartao).toBeVisible();await expect(cartao.locator('.agenda-origem')).toHaveText('Profissionais');
    await expect(page.locator('.agenda-marcacao').filter({hasText:titulo})).toHaveCount(1);await page.reload();
    await expect(cartao).toContainText('24/11/2026 · 14:00–15:00');await cartao.locator('summary').click();
    await cartao.getByLabel('Local',{exact:true}).fill('Sala da equipe');await cartao.getByRole('button',{name:'Salvar alterações',exact:true}).click();
    await expect(cartao).toContainText('Sala da equipe');await page.getByRole('link',{name:'Próximo mês',exact:true}).click();
    await expect(page.locator('.agenda-navegacao h2')).toContainText('dezembro de 2026');await page.getByRole('link',{name:'Mês anterior',exact:true}).click();
    await expect(page.locator('.agenda-navegacao h2')).toContainText('novembro de 2026');await page.screenshot({path:'test-results/ajustes-agenda-desktop.png',fullPage:true});await page.setViewportSize({width:320,height:740});await page.screenshot({path:'test-results/ajustes-agenda-mobile.png',fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  } finally {const eventos=(await (await request.get('/api/eventos',{headers})).json()).dados;for(const e of eventos.filter(e=>e.titulo===titulo))await request.delete('/api/eventos/'+e.id,{headers});}
});
test('delegado publica e edita avisos do Nepes sem ganhar gestão de contas',async({page,request})=>{
  const admin=await sessao(request),headers={Authorization:'Bearer '+admin.token};const ana=await sessao(request,'ana.ferraz@maternarsm.com.br');
  const titulo='Comunicado NEPeS E2E '+Date.now();
  expect((await request.put('/api/usuarios/'+ana.usuario.id+'/comunicacao',{headers,data:{publicar_avisos:true,orgao:'NEPeS'}})).ok()).toBeTruthy();
  try {
    await entrar(page);await page.goto('/app#avisos');await expect(page.locator('#menu a[href="/painel"]')).toHaveCount(0);
    await page.getByRole('button',{name:'Gerenciar comunicados',exact:true}).click();const form=page.locator('[data-aviso-form]');
    await form.getByLabel('Título',{exact:true}).fill(titulo);await form.getByLabel('Mensagem',{exact:true}).fill('Atividade para os profissionais da rede.');
    await form.getByRole('button',{name:'Publicar comunicado',exact:true}).click();
    const cartao=page.locator('[data-avisos] article').filter({has:page.getByRole('heading',{name:titulo,exact:true})});
    await expect(cartao).toContainText('NEPeS');await cartao.getByRole('button',{name:'Editar',exact:true}).click();
    await page.locator('[data-aviso-form]').getByLabel('Mensagem',{exact:true}).fill('Atividade atualizada pela equipe NEPeS.');
    await page.getByRole('button',{name:'Salvar alterações',exact:true}).click();await expect(cartao).toContainText('Atividade atualizada pela equipe NEPeS.');
    await page.getByRole('button',{name:'Voltar aos avisos',exact:true}).click();await expect(page.locator('[data-avisos] article').filter({hasText:titulo})).toContainText('NEPeS');
    expect((await request.get('/api/usuarios',{headers:{Authorization:'Bearer '+ana.token}})).status()).toBe(403);
  } finally {
    const avisos=(await (await request.get('/api/notificacoes/todas',{headers})).json()).dados;
    for(const n of avisos.filter(n=>n.titulo===titulo))await request.delete('/api/notificacoes/'+n.id,{headers});
    await request.put('/api/usuarios/'+ana.usuario.id+'/comunicacao',{headers,data:{publicar_avisos:false,orgao:''}});
  }
});
test('projetos oferecem instituição e curso separados e filtro dependente',async({page,request})=>{
  const admin=await sessao(request),headers={Authorization:'Bearer '+admin.token},titulo='Projeto com curso E2E '+Date.now();
  const criacao=await request.post('/api/projetos',{headers,data:{titulo,responsavel:'Responsável E2E',instituicao:'UFN',curso:'Curso específico E2E'}});expect(criacao.status()).toBe(201);
  const projeto=(await criacao.json()).dados;
  try {
    await entrar(page);await page.goto('/app#projetos');await expect(page.locator('.filtros-projetos select[name=situacao_origem]')).toHaveCount(0);
    await page.getByRole('combobox',{name:'Instituição',exact:true}).selectOption('UFN');
    await expect(page.getByRole('combobox',{name:'Curso/programa',exact:true}).locator('option[value="Curso específico E2E"]')).toHaveCount(1);
    await page.getByRole('combobox',{name:'Curso/programa',exact:true}).selectOption('Curso específico E2E');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();
    await expect(page.locator('.projeto')).toHaveCount(1);await expect(page.locator('.projeto')).toContainText(titulo);await expect(page.locator('.projeto')).toContainText('Curso específico E2E');
    await page.reload();await expect(page.locator('.projeto')).toContainText(titulo);
  } finally {await request.delete('/api/projetos/'+encodeURIComponent(projeto.id),{headers});}
});
