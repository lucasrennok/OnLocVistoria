import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Asset, AssetStatus, Loan } from '../models/domain';

export type AssetPayload = Omit<Asset, 'id'>;

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly http = inject(HttpClient);

  list(status?: AssetStatus): Observable<Asset[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Asset[]>(`${API_BASE}/assets`, { params });
  }

  get(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${API_BASE}/assets/${id}`);
  }

  create(payload: AssetPayload): Observable<Asset> {
    return this.http.post<Asset>(`${API_BASE}/assets`, payload);
  }

  update(id: string, payload: AssetPayload): Observable<Asset> {
    return this.http.put<Asset>(`${API_BASE}/assets/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/assets/${id}`);
  }

  /** Empréstimos em que este equipamento aparece (para o histórico). */
  loans(assetId: string): Observable<Loan[]> {
    return this.http
      .get<Loan[]>(`${API_BASE}/loans`)
      .pipe(map((loans) => loans.filter((l) => l.items.some((i) => i.assetId === assetId))));
  }

  /** Verifica se o número de patrimônio já existe em outro equipamento. */
  isPatrimonyTaken(number: string, excludeId?: string): Observable<boolean> {
    const normalized = number.trim().toLowerCase();
    return this.list().pipe(
      map((assets) =>
        assets.some((a) => a.patrimonyNumber.trim().toLowerCase() === normalized && a.id !== excludeId)
      )
    );
  }
}
