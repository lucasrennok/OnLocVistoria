import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Client, Loan } from '../models/domain';
import { onlyDigits } from '../../shared/utils/cpf-cnpj';

export type ClientPayload = Omit<Client, 'id' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);

  list(search = ''): Observable<Client[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Client[]>(`${API_BASE}/clients`, { params });
  }

  get(id: string): Observable<Client> {
    return this.http.get<Client>(`${API_BASE}/clients/${id}`);
  }

  create(payload: ClientPayload): Observable<Client> {
    return this.http.post<Client>(`${API_BASE}/clients`, payload);
  }

  update(id: string, payload: ClientPayload): Observable<Client> {
    return this.http.put<Client>(`${API_BASE}/clients/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/clients/${id}`);
  }

  loans(id: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${API_BASE}/clients/${id}/loans`);
  }

  /** Verifica se o documento já existe em outro cliente (para validação assíncrona). */
  isDocumentTaken(document: string, excludeId?: string): Observable<boolean> {
    const digits = onlyDigits(document);
    return this.list(digits).pipe(
      map((clients) =>
        clients.some((c) => onlyDigits(c.document) === digits && c.id !== excludeId)
      )
    );
  }
}
