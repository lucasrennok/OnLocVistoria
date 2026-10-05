import { expect, test } from '@playwright/test';

/**
 * Smoke test — será substituído pelos cenários completos de login,
 * seleção de cliente, conferência de sub-itens e upload de fotos nas próximas fases.
 */
test('carrega a aplicação', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeAttached();
});
