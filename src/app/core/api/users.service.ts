import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Role, User } from '../models/domain';

export type UserPayload = Omit<User, 'id'>;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  list(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE}/users`);
  }

  create(payload: UserPayload): Observable<User> {
    return this.http.post<User>(`${API_BASE}/users`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/users/${id}`);
  }

  /** Verifica se o e-mail já existe (validação assíncrona). */
  isEmailTaken(email: string, excludeId?: string): Observable<boolean> {
    const normalized = email.trim().toLowerCase();
    return this.list().pipe(
      map((users) => users.some((u) => u.email.trim().toLowerCase() === normalized && u.id !== excludeId))
    );
  }
}

export const ROLES: { label: string; value: Role }[] = [
  { label: 'Analista', value: 'Analista' },
  { label: 'Gestor', value: 'Gestor' }
];
