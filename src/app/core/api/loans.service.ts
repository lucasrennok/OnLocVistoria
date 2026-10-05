import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Loan, LoanStatus } from '../models/domain';

export interface LoanFilters {
  status?: LoanStatus;
  clientId?: string;
}

@Injectable({ providedIn: 'root' })
export class LoansService {
  private readonly http = inject(HttpClient);

  list(filters: LoanFilters = {}): Observable<Loan[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    return this.http.get<Loan[]>(`${API_BASE}/loans`, { params });
  }

  get(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${API_BASE}/loans/${id}`);
  }
}
