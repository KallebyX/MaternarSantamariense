import { test, expect } from '@playwright/test';

async function entrar(page, email) {
  await page.goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();
  await page.waitForURL(/\/(app|painel)(#.*)?$/);
}
const normalizar = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
async function exemploHistorico(request) {
  const resposta = await request.get('/api/projetos?escopo=historicos');
  const {dados,meta} = await resposta.json();
  expect(meta.total).toBe(547);
  const projeto=dados.find(p=>p.instituicao.trim()&&p.situacao_origem.trim()&&p.ano_referencia);
  expect(projeto).toBeTruthy();
  const instituicao=meta.opcoes.instituicoes.find(v=>normalizar(v)===normalizar(projeto.instituicao));
  const situacao=meta.opcoes.situacoesOrigem.find(v=>normalizar(v)===normalizar(projeto.situacao_origem));
  return {projeto,instituicao,situacao};
}

test('profissional consulta históricos com filtros combinados, paginação real e recarga no celular', async ({page,request}) => {
  const {projeto,instituicao,situacao}=await exemploHistorico(request);
  await entrar(page,'ana.ferraz@maternarsm.com.br');
  await page.goto('/app#projetos');
  await expect(page.locator('.resultado-projetos')).toHaveText('1–24 de 704 projetos encontrados · 704 no acervo');
  await expect(page.locator('.projeto')).toHaveCount(24);
  await page.getByRole('link',{name:'Próxima página'}).click();
  await expect(page.locator('.resultado-projetos')).toHaveText('25–48 de 704 projetos encontrados · 704 no acervo');
  const busca=projeto.titulo.split(/\s+/).slice(0,4).join(' ');
  await page.getByLabel('Busca',{exact:true}).fill(busca);
  await page.getByLabel('Ano da fonte',{exact:true}).selectOption(String(projeto.ano_referencia));
  await page.getByLabel('Acervo',{exact:true}).selectOption('historicos');
  await page.getByLabel('Situação do projeto',{exact:true}).selectOption('Histórico');
  await page.getByLabel('Instituição',{exact:true}).selectOption(instituicao);
  await page.getByLabel('Situação na fonte (AUT. CEP)',{exact:true}).selectOption(situacao);
  await page.getByRole('button',{name:'Aplicar filtros'}).click();
  const consulta=new URLSearchParams({q:busca,ano:String(projeto.ano_referencia),escopo:'historicos',status:'Histórico',instituicao,situacao_origem:situacao,pagina:'1',limite:'24'});
  const esperado=await (await request.get('/api/projetos?'+consulta)).json();
  await expect(page.locator('.resultado-projetos')).toContainText(`de ${esperado.meta.total} projetos encontrados`);
  await expect(page.locator('.projeto')).toHaveCount(esperado.dados.length);
  await expect(page.locator('.projeto').filter({has:page.getByRole('heading',{name:projeto.titulo,exact:true})})).toContainText(projeto.situacao_origem);
  await expect(page).not.toHaveURL(/pagina=2/);
  await page.reload();
  await expect(page.getByLabel('Ano da fonte',{exact:true})).toHaveValue(String(projeto.ano_referencia));
  await expect(page.getByLabel('Acervo',{exact:true})).toHaveValue('historicos');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/projetos-historicos-mobile.png',fullPage:true});
  await page.getByRole('link',{name:'Limpar filtros'}).click();
  await expect(page.locator('.resultado-projetos')).toContainText('de 704 projetos encontrados');
});

test('gestão combina filtros do histórico, informa contagem e permite limpar filtros sem perder registros', async ({page,request}) => {
  const {projeto}=await exemploHistorico(request);
  await entrar(page,'kalleby@maternarsm.com.br');
  await page.goto('/painel#projetos');
  await expect(page.locator('#conteudo')).toContainText('Exibindo 40 de 704 resultados · 704 no acervo');
  await page.getByLabel('Ano da fonte',{exact:true}).selectOption(String(projeto.ano_referencia));
  await page.getByLabel('Acervo',{exact:true}).selectOption('historicos');
  await page.getByLabel('Situação do projeto',{exact:true}).selectOption('Histórico');
  await page.getByLabel('Instituição',{exact:true}).selectOption(normalizar(projeto.instituicao));
  await page.getByLabel('Situação na fonte (AUT. CEP)',{exact:true}).selectOption(normalizar(projeto.situacao_origem));
  await page.getByRole('searchbox',{name:'Buscar em projetos de pesquisa'}).fill(projeto.titulo);
  const linhas=page.locator('#conteudo tbody tr');
  await expect(linhas.first()).toContainText(projeto.titulo);
  await expect(linhas.first()).toContainText('Histórico');
  await expect(linhas.first()).toContainText(projeto.situacao_origem);
  await page.getByRole('searchbox',{name:'Buscar em projetos de pesquisa'}).fill('nenhum-resultado-qa-projetos');
  await expect(page.locator('#conteudo')).toContainText('Exibindo 0 de 0 resultados · 704 no acervo');
  await expect(page.locator('#conteudo')).toContainText('Nenhum registro corresponde aos filtros.');
  await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
  await expect(page.locator('#conteudo')).toContainText('Exibindo 40 de 704 resultados · 704 no acervo');
  await page.getByRole('button',{name:/Mostrar mais/}).click();
  await expect(page.locator('#conteudo')).toContainText('Exibindo 80 de 704 resultados · 704 no acervo');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/projetos-gestao-mobile.png',fullPage:true});
});

test('editar histórico atualiza situação e datas visíveis sem apagar o período e a situação originais', async ({page,request}) => {
  const {projeto}=await exemploHistorico(request);
  const login=await request.post('/api/auth/login',{data:{email:'kalleby@maternarsm.com.br',senha:'demo1234'}});
  const headers={Authorization:'Bearer '+(await login.json()).dados.token};
  try {
    await entrar(page,'kalleby@maternarsm.com.br');
    await page.goto('/painel#projetos');
    await page.getByRole('searchbox',{name:'Buscar em projetos de pesquisa'}).fill(projeto.titulo);
    await page.locator('#conteudo tbody tr').first().getByRole('button',{name:'Editar',exact:true}).click();
    await page.locator('#campo-status').selectOption('Encerrado');
    await page.locator('#campo-inicio').fill('20/12/2020');
    await page.locator('#campo-fim').fill('30/12/2020');
    await page.locator('#modal-salvar').click();
    await expect(page.locator('#modal')).not.toBeVisible();
    const salvo=(await (await request.get('/api/projetos/'+projeto.id)).json()).dados;
    expect(salvo.status).toBe('Encerrado');expect(salvo.situacao_origem).toBe(projeto.situacao_origem);
    expect(salvo.periodo_origem).toBe(projeto.periodo_origem);expect(salvo.historico).toBe(1);
    await page.goto('/app#projetos?'+new URLSearchParams({q:projeto.titulo}));
    const cartao=page.locator('.projeto[data-projeto-id="'+projeto.id+'"]');
    await expect(cartao).toContainText('Acervo histórico');
    await expect(cartao).toContainText('Encerrado');
    await expect(cartao).toContainText('20/12/2020 — 30/12/2020');
    await expect(cartao).toContainText(projeto.periodo_origem);
    await expect(cartao).toContainText(projeto.situacao_origem);
    await page.reload();await expect(cartao).toContainText('20/12/2020 — 30/12/2020');
  } finally {
    await request.put('/api/projetos/'+projeto.id,{headers,data:{status:projeto.status,inicio:projeto.inicio,fim:projeto.fim}});
  }
});
