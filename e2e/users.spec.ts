import { expect, test } from '@playwright/test';

test('gestor cria novo usuário', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('gestor@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.getByRole('link', { name: 'Usuários' }).click();
  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible();

  await page.getByRole('button', { name: 'Novo usuário' }).click();
  await expect(page).toHaveURL(/usuarios\/novo/);

  await page.getByLabel(/Nome/).fill('Carla Mendes');
  await page.getByLabel(/E-mail/).fill('carla@onloc.com.br');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page).toHaveURL(/\/usuarios$/);
  await expect(page.getByText('Carla Mendes')).toBeVisible();
});
