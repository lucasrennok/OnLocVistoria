import { expect, test } from '@playwright/test';

test('cadastro de equipamento com sub-item', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('analista@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.getByRole('link', { name: 'Equipamentos' }).click();
  await expect(page.getByRole('heading', { name: 'Equipamentos' })).toBeVisible();
  await expect(page.getByText('PAT-0001')).toBeVisible();

  await page.getByRole('button', { name: 'Novo equipamento' }).click();
  await expect(page).toHaveURL(/equipamentos\/novo/);

  await page.getByLabel(/Número de patrimônio/).fill('PAT-0100');
  await page.getByLabel(/Número de série/).fill('SN-9999');
  await page.getByLabel(/Descrição/).fill('Furadeira de impacto');
  await page.getByRole('button', { name: 'Adicionar item' }).click();
  await page.getByLabel(/Nome/).fill('Broca 8mm');

  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page).toHaveURL(/\/equipamentos$/);
  await expect(page.getByRole('link', { name: 'PAT-0100' })).toBeVisible();
});
