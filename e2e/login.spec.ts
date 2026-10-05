import { expect, test } from '@playwright/test';

test('analista faz login e vê o painel', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('analista@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Olá,', { exact: false })).toBeVisible();
});

test('credenciais inválidas mostram erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('naoexiste@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Credenciais inválidas', { exact: false })).toBeVisible();
});
