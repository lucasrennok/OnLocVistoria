import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import type { User } from '../models/domain';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

function configure(authStub: Partial<AuthService>): void {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: authStub }]
  });
}

describe('authGuard', () => {
  it('permite acesso quando autenticado', () => {
    configure({ isAuthenticated: () => true });
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('redireciona para /login quando não autenticado', () => {
    configure({ isAuthenticated: () => false });
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result?.toString()).toBe('/login');
  });
});

describe('roleGuard', () => {
  const gestor = { id: 'u2', name: 'Bruno', email: 'b@x.com', role: 'Gestor' } as User;
  const analista = { id: 'u1', name: 'Ana', email: 'a@x.com', role: 'Analista' } as User;

  it('permite acesso ao Gestor para rota de Gestor', () => {
    configure({ user: () => gestor });
    const result = TestBed.runInInjectionContext(() => roleGuard('Gestor')(route, state));
    expect(result).toBe(true);
  });

  it('bloqueia Analista para rota de Gestor', () => {
    configure({ user: () => analista });
    const result = TestBed.runInInjectionContext(() => roleGuard('Gestor')(route, state));
    expect(result?.toString()).toBe('/403');
  });
});
