import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const pdf=readFileSync(new URL('../../acervo/mulher/protocolos/criterios-encaminhamento-para-parto-maternidades-2025.pdf',import.meta.url));
const senha='demo1234';
async function login(page,email='ana.ferraz@maternarsm.com.br',password=senha){
  await page.goto('/');await page.locator('#login-email').fill(email);await page.locator('#login-senha').fill(password);
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/(app|painel)(#.*)?$/);
}
async function adminToken(request){return (await (await request.post('/api/auth/login',{data:{email:'kalleby@maternarsm.com.br',senha}})).json()).dados.token;}
test('entrada pública, erro de login e recuperação',async({page})=>{
  await page.goto('/');
  await expect(page.locator('[data-numero=profissionais]')).not.toHaveText('—');
  await page.locator('#login-email').fill('ana.ferraz@maternarsm.com.br');await page.locator('#login-senha').fill('incorreta123');
  await page.locator('#form-login button[type=submit]').click();await expect(page.locator('#aviso-login')).toContainText('incorretos');
  await page.getByRole('button',{name:'Esqueci minha senha'}).click();await expect(page.locator('#aviso-login')).toContainText('link válido por 1 hora');
  await page.goto('/app');await expect(page).toHaveURL(/\/#acesso$/);
});
test('profissional percorre todas as seções, busca, persistência e layout móvel',async({page})=>{
  const erros=[];page.on('pageerror',e=>erros.push(e.message));
  await login(page);
  await expect(page.locator('#nome-usuario')).toHaveText('Ana Beatriz Ferraz');
  await expect(page.locator('#menu')).not.toContainText('Painel de gestão');
  const rotas=['inicio','cursos','qualifica','politicas','protocolos','documentos','produtos','projetos','agenda','mensagens','avisos','certificados','links','perfil','sobre'];
  for(const rota of rotas){
    await page.locator(`#menu a[href="#${rota}"]`).click();
    await expect(page.locator('#conteudo')).not.toContainText('Carregando…');
    await expect(page.locator('#conteudo .erro')).toHaveCount(0);
    await expect(page.locator('#conteudo')).not.toBeEmpty();
  }
  await page.locator('#termo-global').fill('htlv');await page.locator('#busca-global button').click();
  await expect(page.locator('#conteudo')).toContainText('HTLV');
  await page.goto('/app#perfil');await page.getByLabel('Telefone',{exact:true}).fill('55999990000');
  await page.getByRole('button',{name:'Salvar perfil'}).click();await expect(page.locator('#mensagem')).toHaveText('Perfil atualizado.');
  await page.reload();await expect(page.getByLabel('Telefone',{exact:true})).toHaveValue('55999990000');
  await page.setViewportSize({width:390,height:844});
  for(const rota of ['inicio','cursos','politicas','mensagens','perfil']){
    await page.goto('/app#'+rota);await expect(page.locator('#conteudo')).not.toContainText('Carregando…');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  }
  await page.screenshot({path:'test-results/profissional-mobile.png',fullPage:true});
  expect(erros).toEqual([]);
});
test('concluir curso, recarregar, emitir e verificar certificado público',async({page,browserName})=>{
  await login(page);await page.goto('/app#curso?curso=c5');
  await expect(page.getByRole('button',{name:'Concluir aula'})).toHaveCount(3);
  for(let i=0;i<3;i++){await page.getByRole('button',{name:'Concluir aula'}).first().click();await expect(page.getByRole('button',{name:'Concluir aula'})).toHaveCount(2-i);}
  await page.reload();await expect(page.getByRole('button',{name:'Emitir certificado'})).toBeVisible();
  await page.getByRole('button',{name:'Emitir certificado'}).click();await page.getByRole('button',{name:'Ver certificado'}).click();
  await expect(page.locator('#certificado')).toBeVisible();await expect(page.locator('#folha-certificado')).toContainText('Ana Beatriz Ferraz');
  if(browserName==='chromium') {
    await page.emulateMedia({media:'print'});
    const printStyle=await page.locator('#certificado').evaluate(dialog=>({
      backdrop:getComputedStyle(dialog,'::backdrop').backgroundColor,
      maxHeight:getComputedStyle(dialog).maxHeight,
      margin:getComputedStyle(dialog).margin,
    }));
    expect(printStyle).toEqual({backdrop:'rgba(0, 0, 0, 0)',maxHeight:'none',margin:'0px'});
    const pdf=await page.pdf({path:'test-results/certificado-operacional.pdf',format:'A4',printBackground:true});
    expect(pdf.subarray(0,4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(1000);
    await page.emulateMedia({media:'screen'});
  }
  const codigo=(await page.locator('#folha-certificado').innerText()).match(/MSM-\d{4}-[A-F0-9]+/)[0];
  await page.screenshot({path:'test-results/certificado.png'});
  await page.goto('/');await page.locator('#cert-codigo').fill(codigo);await page.locator('#form-certificado button').click();
  await expect(page.locator('#aviso-certificado')).toContainText('Certificado válido');
});
test('mensagem e leitura de aviso persistem',async({page,request})=>{
  const t=await adminToken(request);
  await request.post('/api/notificacoes',{headers:{Authorization:'Bearer '+t},data:{titulo:'Comunicado E2E',texto:'Encontro da equipe'}});
  await login(page);await page.goto('/app#mensagens');
  await page.getByLabel('Sua mensagem').fill('Mensagem E2E persistente');await page.getByRole('button',{name:'Enviar mensagem'}).click();
  await expect(page.locator('.mensagens')).toContainText('Mensagem E2E persistente');await page.reload();
  await expect(page.locator('.mensagens')).toContainText('Mensagem E2E persistente');
  await page.goto('/app#avisos');const aviso=page.locator('article').filter({hasText:'Comunicado E2E'});
  await aviso.getByRole('button',{name:'Marcar como lido'}).click();await expect(aviso.locator('.etiqueta')).toHaveText('Lido');
  await page.reload();await expect(aviso.locator('.etiqueta')).toHaveText('Lido');
});
test('gestão percorre todas as seções e publica produto com upload pela interface',async({page,browser})=>{
  const erros=[];page.on('pageerror',e=>erros.push(e.message));
  await login(page,'kalleby@maternarsm.com.br');await expect(page.locator('#quem-sou')).toBeVisible();
  const secoes=await page.locator('#menu button').evaluateAll(bs=>bs.map(b=>b.dataset.secao));
  for(const secao of secoes){await page.locator(`#menu button[data-secao="${secao}"]`).click();await expect(page.locator('#conteudo')).not.toContainText(/Carregando/);await expect(page.locator('#conteudo > .erro')).toHaveCount(0);}
  await page.locator('#menu button[data-secao=produtos]').click();await page.getByRole('button',{name:'Novo produto'}).click();
  await page.getByLabel('Título *',{exact:true}).fill('Produto E2E da rede');await page.getByLabel('Tipo (E-book, Cartilha, Guia…)').fill('Guia');await page.getByLabel('Ano',{exact:true}).fill('2026');
  await page.locator('#modal input[type=file]').first().setInputFiles({name:'guia-e2e.pdf',mimeType:'application/pdf',buffer:pdf});
  await expect(page.locator('#modal input[name=url]')).toHaveValue(/uploads\/guia-e2e/);
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await expect(page.locator('#conteudo')).toContainText('Produto E2E da rede');
  const ctx=await browser.newContext();const profissional=await ctx.newPage();await login(profissional);await profissional.goto('/app#produtos');
  const produto=profissional.locator('article').filter({hasText:'Produto E2E da rede'});await expect(produto).toBeVisible();
  const href=await produto.getByRole('link',{name:'Abrir produto'}).getAttribute('href');expect((await profissional.request.get(href)).status()).toBe(200);
  await ctx.close();await page.screenshot({path:'test-results/gestao-produtos.png',fullPage:true});expect(erros).toEqual([]);
});
test('solicitação pública, aprovação no painel e entrada da nova pessoa',async({page,browser})=>{
  await page.goto('/');await page.locator('#reg-nome').fill('Cadastro E2E');await page.locator('#reg-email').fill('cadastro-e2e@example.test');await page.locator('#reg-unidade').fill('UBS Teste');await page.locator('#reg-cargo').fill('Enfermeira');await page.locator('#reg-senha').fill('Cadastro123!');
  await page.locator('#form-registro button').click();await expect(page.locator('#aviso-registro')).toContainText('Solicitação registrada');
  const ctx=await browser.newContext();const gestor=await ctx.newPage();await login(gestor,'maria.rocha@maternarsm.com.br');await gestor.locator('#menu button[data-secao=equipe]').click();
  const linha=gestor.locator('tr').filter({hasText:'cadastro-e2e@example.test'});await linha.getByRole('button',{name:'Aprovar'}).click();
  await expect(linha).toContainText('Ativo');await login(page,'cadastro-e2e@example.test','Cadastro123!');await expect(page.locator('#nome-usuario')).toHaveText('Cadastro E2E');await ctx.close();
});
test('convite provisório exige troca no navegador e logout encerra sessão',async({page,request})=>{
  const t=await adminToken(request);
  const resposta=await request.post('/api/usuarios/convite',{headers:{Authorization:'Bearer '+t},data:{nome:'Senha provisória E2E',email:'provisoria-e2e@example.test',senha:'Primeira123'}});expect(resposta.status()).toBe(201);
  await login(page,'provisoria-e2e@example.test','Primeira123');await expect(page).toHaveURL(/#perfil$/);
  await expect(page.locator('#menu a')).toHaveCount(1);
  await page.getByLabel('Senha atual',{exact:true}).fill('Primeira123');await page.getByLabel('Nova senha',{exact:true}).fill('Segunda123');await page.getByLabel('Confirme a nova senha').fill('Segunda123');
  await page.getByRole('button',{name:'Atualizar senha'}).click();await expect(page.locator('#mensagem')).toHaveText('Senha atualizada.');
  await page.locator('#menu a[href="#inicio"]').click();await expect(page.locator('#conteudo')).toContainText('Olá, Senha.');
  await page.getByRole('button',{name:'Sair da plataforma'}).click();await expect(page).toHaveURL(/\/#acesso$/);await page.goto('/app');await expect(page).toHaveURL(/\/#acesso$/);
});
test('falha de API aparece com tentativa novamente, sem dados fictícios',async({page})=>{
  await login(page);await page.route('**/api/documentos',route=>route.abort());await page.goto('/app#documentos');
  await expect(page.getByRole('alert')).toContainText('Não foi possível conectar');await page.unroute('**/api/documentos');
  await page.getByRole('button',{name:'Tentar novamente'}).click();await expect(page.locator('#conteudo .cartao').first()).toBeVisible();
});

test('gestor cria curso com aula, trilha e agenda que chegam ao profissional',async({page,browser})=>{
  // Jornada com dois usuários, upload e quatro cadastros; cada expectativa mantém seu próprio limite.
  test.setTimeout(120000);
  await login(page,'maria.rocha@maternarsm.com.br');
  await page.locator('#menu button[data-secao=cursos]').click();await page.getByRole('button',{name:'Novo curso'}).click();
  await page.getByLabel('Título *',{exact:true}).fill('Formação criada pela gestão E2E');await page.getByLabel('Área *',{exact:true}).fill('Rede');
  await page.getByLabel('Carga horária (h)').fill('2');await page.getByLabel('Nível',{exact:true}).selectOption('Básico');
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('#menu button[data-secao=aulas]').click();await page.getByRole('button',{name:'Novo aula'}).click();
  await page.getByLabel('Curso *',{exact:true}).selectOption({label:'Formação criada pela gestão E2E'});
  await page.getByLabel('Título da aula *',{exact:true}).fill('Material de acolhimento E2E');
  await page.locator('#modal input[type=file]').setInputFiles({name:'aula-e2e.pdf',mimeType:'application/pdf',buffer:pdf});
  await expect(page.locator('#campo-url')).toHaveValue(/uploads\/aula-e2e/);await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('#menu button[data-secao=cursos]').click();
  const linhaCurso=page.locator('tbody tr').filter({hasText:'Formação criada pela gestão E2E'});
  await expect(linhaCurso).toContainText('Rascunho');
  await linhaCurso.getByRole('button',{name:'Editar',exact:true}).click();
  await page.locator('#campo-publicado').check();
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await expect(linhaCurso).toContainText('Publicado');
  await page.locator('#menu button[data-secao=trilhas]').click();await page.getByRole('button',{name:'Novo trilha'}).click();
  await page.getByLabel('Nome da trilha *').fill('Trilha E2E');await page.getByLabel('Códigos dos módulos, separados por vírgula').fill('1, 2');
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('#menu button[data-secao=eventos]').click();await page.getByRole('button',{name:'Novo evento'}).click();
  await page.getByLabel('Evento *',{exact:true}).fill('Encontro E2E');await page.getByLabel('Dia (1–31) *').fill('15');
  await page.getByLabel('Mês (1–12)').fill('10');await page.getByLabel('Hora (ex.: 14:00) *').fill('14:00');
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  const ctx=await browser.newContext();const pro=await ctx.newPage();await login(pro);await pro.goto('/app#cursos');
  await pro.locator('article').filter({hasText:'Formação criada pela gestão E2E'}).getByRole('link',{name:'Acessar curso'}).click();
  await expect(pro.getByRole('link',{name:'Acessar aula'})).toBeVisible();await pro.getByRole('button',{name:'Concluir aula'}).click();
  await pro.getByRole('button',{name:'Emitir certificado'}).click();
  // O nome do curso também existe na tela anterior. Aguarde a emissão e a
  // navegação antes de iniciar outra rota, evitando disputar o hash com ela.
  await expect(pro.locator('#titulo')).toHaveText('Meus certificados');
  await expect(pro.locator('#conteudo article').filter({hasText:'Formação criada pela gestão E2E'})).toBeVisible();
  await pro.goto('/app#qualifica');await pro.locator('article').filter({hasText:'Trilha E2E'}).getByRole('link',{name:'Ver módulos'}).click();
  await expect(pro.locator('#conteudo article')).toHaveCount(2);
  await pro.goto('/app#agenda');const evento=pro.locator('article').filter({hasText:'Encontro E2E'});await expect(evento).toBeVisible();
  const download=pro.waitForEvent('download');await evento.getByRole('button',{name:'Adicionar ao calendário'}).click();expect((await download).suggestedFilename()).toBe('evento-maternar.ics');
  await ctx.close();
});

test('formulário Qualifica usa padrões para campos opcionais',async({page})=>{
  await login(page,'maria.rocha@maternarsm.com.br');
  await page.locator('#menu button[data-secao="qualifica-modulos"]').click();
  await page.getByRole('button',{name:'Novo módulo'}).click();
  await page.getByLabel('Título *',{exact:true}).fill('Módulo com opções padrão E2E');
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await expect(page.locator('tr').filter({hasText:'Módulo com opções padrão E2E'})).toContainText('Capacitações livres');
});
