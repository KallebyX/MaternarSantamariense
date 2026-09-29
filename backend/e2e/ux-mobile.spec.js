import { test, expect } from '@playwright/test';

test('celular de 320px permite salvar formulário longo e alcançar ações da tabela',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('/');await page.locator('#login-email').fill('kalleby@maternarsm.com.br');await page.locator('#login-senha').fill('demo1234');
  await page.locator('#form-login button[type=submit]').click();await page.waitForURL(/\/painel/);
  await page.locator('#abrir-menu').click();
  await page.locator('#menu [data-secao=cursos]').click();await page.getByRole('button',{name:'Novo curso'}).click();
  expect(await page.locator('#campo-nivel').evaluate(e=>e.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await page.locator('#campo-titulo').fill('Curso de verificação móvel');await page.locator('#campo-area').fill('Rede');await page.locator('#campo-horas').fill('2');
  // As ações ficam visíveis enquanto os campos longos têm rolagem própria.
  await expect(page.locator('#modal-salvar')).toBeInViewport();
  await expect(page.locator('#modal-cancelar')).toBeInViewport();
  await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  const linha=page.locator('tbody tr').filter({hasText:'Curso de verificação móvel'});
  await expect(linha).toContainText('Rascunho');
  await linha.getByRole('button',{name:'Editar',exact:true}).click();await expect(page.locator('#campo-titulo')).toHaveValue('Curso de verificação móvel');
  await page.locator('#campo-horas').fill('3');await page.locator('#modal-salvar').click();await expect(page.locator('#modal')).not.toBeVisible();
  await page.reload();await expect(linha).toContainText('3');
  page.once('dialog',d=>d.accept());await linha.getByRole('button',{name:'Remover',exact:true}).click();await expect(linha).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
