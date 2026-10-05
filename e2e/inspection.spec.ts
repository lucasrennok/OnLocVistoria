import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('qualquer-senha');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

async function pickSelect(page: Page, nth: number, optionName: string): Promise<void> {
  const select = page.locator('p-select').nth(nth);
  // Abre o dropdown e tenta selecionar; reabre caso os dados (mock) ainda não tenham carregado.
  for (let attempt = 0; attempt < 6; attempt++) {
    await select.click();
    const option = page.locator('.p-select-option', { hasText: optionName });
    try {
      await option.waitFor({ state: 'visible', timeout: 1500 });
      await option.click();
      return;
    } catch {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }
  throw new Error(`Opção não encontrada: ${optionName}`);
}

test('analista registra devolução sem avarias', async ({ page }) => {
  await login(page, 'analista@onloc.com.br');
  await page.getByRole('link', { name: 'Devoluções' }).click();
  await page.getByRole('button', { name: 'Nova devolução' }).click();

  await pickSelect(page, 0, 'Construtora Alfa Ltda');
  await pickSelect(page, 1, 'Obra Residencial Jardim Europa');

  await page.getByRole('button', { name: 'Próximo' }).click();
  await page.locator('p-checkbox').first().click();

  await page.getByRole('button', { name: 'Próximo' }).click();
  await page.getByRole('button', { name: 'Próximo' }).click();

  await page.locator('#assessment-nao').check();
  await page.getByRole('button', { name: 'Concluir vistoria' }).click();

  await expect(page).toHaveURL(/\/devolucoes$/);
  await expect(page.getByText('Construtora Alfa Ltda').first()).toBeVisible();
});

test('analista registra avaria por mau uso', async ({ page }) => {
  await login(page, 'analista@onloc.com.br');
  await page.getByRole('link', { name: 'Devoluções' }).click();
  await page.getByRole('button', { name: 'Nova devolução' }).click();

  await pickSelect(page, 0, 'Transportes Beta ME');
  await pickSelect(page, 1, 'Frota Beta — Manutenção');

  await page.getByRole('button', { name: 'Próximo' }).click();
  await page.getByRole('button', { name: 'Próximo' }).click();
  await page.getByRole('button', { name: 'Próximo' }).click();

  await page.locator('#assessment-sim').check();
  await page.getByLabel(/Descrição da avaria/).fill('Tela trincada');
  await page.getByRole('button', { name: 'Concluir vistoria' }).click();

  await expect(page).toHaveURL(/\/devolucoes$/);
  await page.getByRole('link', { name: 'Avariados' }).click();
  await expect(page.getByText('Tela trincada')).toBeVisible();
});

test('gestor aprova devolução pendente', async ({ page }) => {
  await login(page, 'gestor@onloc.com.br');
  await page.getByRole('link', { name: 'Aprovações' }).click();
  await expect(page.getByRole('heading', { name: 'Aprovações' })).toBeVisible();
  await expect(page.getByText('Obra Residencial Jardim Europa')).toBeVisible();

  // Abre os detalhes da vistoria antes de aprovar.
  await page.getByTitle('Ver detalhes').first().click();
  await expect(page.getByText('Detalhes da vistoria')).toBeVisible();

  await page.locator('.p-dialog-footer').getByRole('button', { name: 'Aprovar' }).click();
  await page.locator('.p-confirmdialog-accept-button').click();

  await expect(page.getByText('Nenhuma aprovação pendente.')).toBeVisible();
});
