# On.loc — Frontend

Sistema de **vistoria de equipamentos** da On.loc (empréstimo de equipamentos com número de patrimônio).

## Stack

- **Angular 20** (standalone components + signals)
- **PrimeNG** (tema Aura) + PrimeIcons — UI em **pt-BR**
- **MSW** (Mock Service Worker) — API mockada enquanto o backend C++ não existe
- **Jest** (testes unitários) · **Playwright** (testes E2E)

## Estrutura

```
src/app/
├── core/          # auth, guards, interceptors, api, models, mocks, i18n
├── shared/        # componentes, directives, pipes, validators, utils
├── layout/        # shell, sidebar, topbar
├── features/      # auth, dashboard, clients, assets, loans, inspections, approvals, ...
├── app.routes.ts
└── app.config.ts
```

## Como rodar

```bash
npm install
npm start            # http://localhost:4200
```

## Testes

```bash
npm test             # unitários (Jest)
npm run test:coverage
npm run e2e          # end-to-end (Playwright) — requer `npx playwright install chromium`
```

## Build

```bash
npm run build        # gera dist/
```

## Integração com o backend (sem mocks)

`ENABLE_API_MOCKS = false` em `src/main.ts`. Em desenvolvimento, o `ng serve` usa `proxy.conf.json`
para encaminhar `/api/*` para `http://localhost:8080` (backend em Docker). Sem CORS a configurar.

1. Suba o backend (`docker compose up --build` na pasta da API; para upload de fotos, `docker compose --profile storage up`).
2. `npm install` e `npm start` → http://localhost:4200
3. Login (senha = `SEED_DEFAULT_PASSWORD` do `.env` do backend):
   - Analista: `analista@onloc.com.br`
   - Gestor: `gestor@onloc.com.br`

Os mocks (MSW) continuam em `src/app/core/mocks/` e podem ser religados trocando a flag para `true`.
Se o navegador ainda interceptar chamadas, desregistre o service worker (DevTools → Application → Service Workers).

## Documentação

- [`docs/PLANO-FRONTEND.md`](docs/PLANO-FRONTEND.md) — planejamento (telas, arquitetura, fases, riscos).
- [`docs/IMPLEMENTACAO.md`](docs/IMPLEMENTACAO.md) — o que foi implementado, fase a fase.
