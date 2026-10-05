import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Mocks de API (MSW). Enquanto o backend C++ não estiver disponível,
 * mantenha `ENABLE_API_MOCKS = true`. Quando o backend real estiver no ar,
 * troque para `false` e o carregamento do worker será ignorado.
 */
const ENABLE_API_MOCKS = true;

async function startApiMocks(): Promise<void> {
  if (!ENABLE_API_MOCKS) return;
  const { worker } = await import('./app/core/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

startApiMocks()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
