import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clients/clients').then((m) => m.Clients)
      },
      {
        path: 'clientes/novo',
        loadComponent: () => import('./features/clients/client-form').then((m) => m.ClientForm)
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () => import('./features/clients/client-form').then((m) => m.ClientForm)
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/clients/client-detail').then((m) => m.ClientDetail)
      },
      {
        path: 'equipamentos',
        loadComponent: () => import('./features/assets/assets').then((m) => m.Assets)
      },
      {
        path: 'equipamentos/novo',
        loadComponent: () => import('./features/assets/asset-form').then((m) => m.AssetForm)
      },
      {
        path: 'equipamentos/:id/editar',
        loadComponent: () => import('./features/assets/asset-form').then((m) => m.AssetForm)
      },
      {
        path: 'equipamentos/:id',
        loadComponent: () => import('./features/assets/asset-detail').then((m) => m.AssetDetail)
      },
      {
        path: 'emprestimos',
        loadComponent: () => import('./features/loans/loans').then((m) => m.Loans)
      },
      {
        path: 'emprestimos/:id',
        loadComponent: () => import('./features/loans/loan-detail').then((m) => m.LoanDetail)
      },
      {
        path: 'devolucoes',
        loadComponent: () => import('./features/inspections/inspections').then((m) => m.Inspections)
      },
      {
        path: 'devolucoes/nova',
        loadComponent: () =>
          import('./features/inspections/inspection-wizard').then((m) => m.InspectionWizard)
      },
      {
        path: 'avariados',
        loadComponent: () =>
          import('./features/damaged-loans/damaged-loans').then((m) => m.DamagedLoans)
      },
      {
        path: 'aprovacoes',
        canActivate: [roleGuard('Gestor')],
        loadComponent: () => import('./features/approvals/approvals').then((m) => m.Approvals)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard('Gestor')],
        loadComponent: () => import('./features/users/users').then((m) => m.Users)
      },
      {
        path: 'usuarios/novo',
        canActivate: [roleGuard('Gestor')],
        loadComponent: () => import('./features/users/user-form').then((m) => m.UserForm)
      }
    ]
  },
  {
    path: '403',
    loadComponent: () => import('./features/errors/forbidden').then((m) => m.Forbidden)
  },
  { path: '**', redirectTo: 'dashboard' }
];
