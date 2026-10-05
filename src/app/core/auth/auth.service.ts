import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

import { API_BASE } from '../api/api-base';
import type { Role, User } from '../models/domain';

export interface AuthResponse {
  token: string;
  user: User;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: Role;
  exp?: number;
}

const TOKEN_KEY = 'onloc.token';
const USER_KEY = 'onloc.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(readToken());
  private readonly _user = signal<User | null>(readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isGestor = computed(() => this._user()?.role === 'Gestor');

  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const token = this._token();
    if (token) {
      this.scheduleExpiry(token);
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.setSession(res.token, res.user)),
        map((res) => res.user)
      );
  }

  logout(): void {
    // Melhor esforço: encerra a sessão no backend; não bloqueia o fluxo local.
    this.http.post(`${API_BASE}/auth/logout`, {}).subscribe();
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Limpa a sessão local sem redirecionar (usado no interceptor 401). */
  clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  hasRole(role: Role): boolean {
    return this._user()?.role === role;
  }

  private setSession(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.scheduleExpiry(token);
  }

  /** Programa a expiração da sessão (1 hora) para encerrar o token localmente. */
  private scheduleExpiry(token: string): void {
    const exp = decodeExp(token);
    if (!exp) return;
    const delayMs = exp * 1000 - Date.now();
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    if (delayMs <= 0) {
      this.clearSession();
      return;
    }
    this.expiryTimer = setTimeout(() => this.clearSession(), delayMs);
  }
}

function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

function readToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function readUser(): User | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}
