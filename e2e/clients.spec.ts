import { expect, test } from '@playwright/test';

test('cadastro de cliente', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('analista@onloc.com.br');
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/dashboard/);

  await page.getByRole('link', { name: 'Clientes' }).click();
  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
  await expect(page.getByText('Construtora Alfa Ltda')).toBeVisible();

  await page.getByRole('button', { name: 'Novo cliente' }).click();
  await expect(page).toHaveURL(/clientes\/novo/);

  await page.getByLabel(/Nome fantasia/).fill('Oficina Gama ME');
  await page.getByLabel(/Responsável/).fill('Rafael Nunes');
  await page.getByLabel(/CPF\/CNPJ/).fill('111.444.777-35');
  await page.getByLabel(/Localização/).fill('Campinas - SP');
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page).toHaveURL(/\/clientes$/);
  await expect(page.getByText('Oficina Gama ME')).toBeVisible();
});
