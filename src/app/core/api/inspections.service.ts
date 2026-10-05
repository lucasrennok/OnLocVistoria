import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Inspection, LoanItem, PhotoEvidence } from '../models/domain';

export interface DamagePayload {
  loanItemId: string;
  description: string;
  photos: string[];
}

export interface InspectionPayload {
  clientId: string;
  loanId: string;
  date: string;
  photos: PhotoEvidence[];
  assessment: 'avaria_por_mau_uso' | 'sem_avaria';
  damages?: DamagePayload[];
  items?: LoanItem[];
}

@Injectable({ providedIn: 'root' })
export class InspectionsService {
  private readonly http = inject(HttpClient);

  list(): Observable<Inspection[]> {
    return this.http.get<Inspection[]>(`${API_BASE}/inspections`);
  }

  create(payload: InspectionPayload): Observable<Inspection> {
    return this.http.post<Inspection>(`${API_BASE}/inspections`, payload);
  }

  approve(id: string): Observable<Inspection> {
    return this.http.patch<Inspection>(`${API_BASE}/inspections/${id}/approve`, {});
  }

  reject(id: string): Observable<Inspection> {
    return this.http.patch<Inspection>(`${API_BASE}/inspections/${id}/reject`, {});
  }
}
