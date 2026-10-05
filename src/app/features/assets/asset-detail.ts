import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { AssetsService } from '../../core/api/assets.service';
import type { Asset, Loan, LoanStatus } from '../../core/models/domain';
import { assetStatusLabel, assetStatusSeverity } from '../../shared/utils/asset-status';

@Component({
  selector: 'app-asset-detail',
  imports: [Card, TableModule, Tag, Button, DatePipe],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss'
})
export class AssetDetail {
  private readonly service = inject(AssetsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly asset = signal<Asset | null>(null);
  readonly loans = signal<Loan[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    forkJoin([this.service.get(id), this.service.loans(id)]).subscribe({
      next: ([asset, loans]) => {
        this.asset.set(asset);
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusLabel(status: Asset['status']): string {
    return assetStatusLabel(status);
  }

  statusSeverity(status: Asset['status']): 'success' | 'info' | 'danger' {
    return assetStatusSeverity(status);
  }

  loanSeverity(status: LoanStatus): 'success' | 'danger' {
    return status === 'sem avarias' ? 'success' : 'danger';
  }

  loanLabel(status: LoanStatus): string {
    return status === 'sem avarias' ? 'Sem avarias' : 'Com avarias';
  }

  edit(): void {
    void this.router.navigate(['/equipamentos', this.asset()?.id, 'editar']);
  }

  back(): void {
    void this.router.navigate(['/equipamentos']);
  }
}
