import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para os testes E2E.
 * Sobe o dev server automaticamente (`npm start`) quando necessário.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    locale: 'pt-BR'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run start -- --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000
  }
});
