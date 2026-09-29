import { test, expect } from '@playwright/test';
async function loginAdmin(page){
 await page.goto('/painel');await page.locator('#form-login input[name=email]').fill('kalleby@maternarsm.com.br');
 await page.locator('#form-login input[name=senha]').fill('demo1234');await page.locator('#form-login button[type=submit]').click();
 await expect(page.locator('#app')).toBeVisible();
}
test('convite por e-mail, link recebido, redefinição única e login real',async({page,request})=>{
 await loginAdmin(page);await page.goto('/painel#equipe');
 await page.getByRole('button',{name:'Convidar profissional',exact:true}).click();
 await page.locator('#campo-nome').fill('Pessoa Email E2E');await page.locator('#campo-email').fill('email-e2e@example.test');
 await page.locator('#campo-enviarEmail').check();await page.locator('#modal-salvar').click();
 await expect(page.locator('#modal')).not.toBeVisible();await expect(page.locator('#conteudo')).toContainText('aceito pelo servidor');
 const messages=await (await request.get('/__teste/emails')).json();const message=messages.findLast(m=>m.to==='email-e2e@example.test');
 expect(message).toBeTruthy();const link=message.text.match(/http:\/\/127\.0\.0\.1:3101\/redefinir\.html#[a-f0-9]{64}/)[0];
 await page.goto(link);expect(new URL(page.url()).hash).toBe('');
 await page.setViewportSize({width:320,height:740});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/email-reset-mobile.png',fullPage:true});
 await page.getByLabel('Nova senha',{exact:true}).fill('SenhaNovaE2E123');await page.getByLabel('Confirme a nova senha').fill('OutraSenha123');
 await page.getByRole('button',{name:'Salvar nova senha'}).click();await expect(page.getByRole('status')).toContainText('não conferem');
 await page.getByLabel('Confirme a nova senha').fill('SenhaNovaE2E123');await page.getByRole('button',{name:'Salvar nova senha'}).click();
 await expect(page.getByRole('status')).toContainText('Senha atualizada');
 await page.goto(link);await page.getByLabel('Nova senha',{exact:true}).fill('MaisUmaSenha123');await page.getByLabel('Confirme a nova senha').fill('MaisUmaSenha123');
 await page.getByRole('button',{name:'Salvar nova senha'}).click();await expect(page.getByRole('status')).toContainText('inválido ou expirado');
 await page.goto('/');await page.locator('#login-email').fill('email-e2e@example.test');await page.locator('#login-senha').fill('SenhaNovaE2E123');
 await page.locator('#form-login button[type=submit]').click();await expect(page).toHaveURL(/\/app/);await expect(page.locator('#nome-usuario')).toHaveText('Pessoa Email E2E');
});
test('envio para conta existente pelo painel e diagnóstico SMTP',async({page,request})=>{
 await loginAdmin(page);await page.goto('/painel#equipe');
 const linha=page.locator('tbody tr').filter({hasText:'maria.rocha@maternarsm.com.br'});
 page.once('dialog',d=>d.accept());await linha.getByRole('button',{name:'Enviar acesso',exact:true}).click();
 await expect(page.locator('#recado')).toContainText('aceito pelo servidor');
 expect((await (await request.get('/__teste/emails')).json()).some(m=>m.to==='maria.rocha@maternarsm.com.br')).toBe(true);
 await page.goto('/painel#registros');await page.getByRole('button',{name:'Verificar conexão de e-mail'}).click();
 await expect(page.locator('#recado')).toContainText('autenticação SMTP confirmadas');
});
test('link ausente informa como recuperar sem exibir formulário inutilizável',async({page})=>{
 await page.goto('/redefinir.html');await expect(page.getByRole('status')).toContainText('Link inválido');await expect(page.locator('form')).toBeHidden();
 await page.getByRole('link',{name:'Voltar para o acesso'}).click();await expect(page).toHaveURL(/\/#acesso$/);
});
