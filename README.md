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

## Mocks de API

Os mocks (MSW) estão ativos via `ENABLE_API_MOCKS = true` em `src/main.ts`.
Os endpoints ficam sob o prefixo `/api` e são definidos em `src/app/core/mocks/handlers.ts`.

**Credenciais de exemplo:**
- Analista: `analista@onloc.com.br` (qualquer senha)
- Gestor: `gestor@onloc.com.br` (qualquer senha)

Quando o backend real estiver disponível, troque a flag para `false`.

## Documentação

- [`docs/PLANO-FRONTEND.md`](docs/PLANO-FRONTEND.md) — planejamento (telas, arquitetura, fases, riscos).
- [`docs/IMPLEMENTACAO.md`](docs/IMPLEMENTACAO.md) — o que foi implementado, fase a fase.
