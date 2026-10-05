import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from './api-base';
import type { Damage } from '../models/domain';

@Injectable({ providedIn: 'root' })
export class DamagesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Damage[]> {
    return this.http.get<Damage[]>(`${API_BASE}/damages`);
  }
}
