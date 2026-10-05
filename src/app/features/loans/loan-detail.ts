import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { ClientsService } from '../../core/api/clients.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Loan, LoanStatus } from '../../core/models/domain';
import { loanStatusLabel, loanStatusSeverity } from '../../shared/utils/loan-status';

@Component({
  selector: 'app-loan-detail',
  imports: [Card, TableModule, Tag, Button, DatePipe],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.scss'
})
export class LoanDetail {
  private readonly service = inject(LoansService);
  private readonly clientsService = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loan = signal<Loan | null>(null);
  readonly client = signal<Client | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.service
      .get(id)
      .pipe(
        switchMap((loan) => {
          this.loan.set(loan);
          return this.clientsService.get(loan.clientId).pipe(
            map((client) => client),
            catchError(() => of(null))
          );
        })
      )
      .subscribe({
        next: (client) => {
          this.client.set(client);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  label(status: LoanStatus): string {
    return loanStatusLabel(status);
  }

  severity(status: LoanStatus): 'success' | 'danger' {
    return loanStatusSeverity(status);
  }

  back(): void {
    void this.router.navigate(['/emprestimos']);
  }
}
