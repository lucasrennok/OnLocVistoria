import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import { API_BASE } from './api-base';

interface PresignResponse {
  uploadUrl: string;
  fileUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);

  /** Pede a URL pré-assinada à API, envia o arquivo direto ao storage e devolve a URL pública. */
  upload(file: File): Observable<string> {
    const filename = file.name || 'foto.jpg';
    return this.http.post<PresignResponse>(`${API_BASE}/uploads/presign`, { filename }).pipe(
      switchMap((p) =>
        this.http
          .put(p.uploadUrl, file, {
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            responseType: 'text'
          })
          .pipe(map(() => p.fileUrl))
      )
    );
  }
}
