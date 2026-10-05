import { expect, test } from '@playwright/test';

test('lista de empréstimos exibe registros', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('analista@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.getByRole('link', { name: 'Empréstimos' }).click();
  await expect(page.getByRole('heading', { name: 'Empréstimos' })).toBeVisible();
  await expect(page.getByText('Obra Residencial Jardim Europa')).toBeVisible();
  await expect(page.getByText('Construtora Alfa Ltda')).toBeVisible();
});
