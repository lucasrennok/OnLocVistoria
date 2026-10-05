import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Worker MSW para o navegador — ativo apenas enquanto o backend real não existir. */
export const worker = setupWorker(...handlers);
