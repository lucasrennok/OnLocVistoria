import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, finalize, startWith, switchMap, tap } from 'rxjs';

import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { ClientsService } from '../../core/api/clients.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Loan, LoanStatus } from '../../core/models/domain';
import { loanStatusLabel, loanStatusSeverity } from '../../shared/utils/loan-status';

@Component({
  selector: 'app-loans',
  imports: [ReactiveFormsModule, TableModule, Button, Select, Tag, DatePipe],
  templateUrl: './loans.html',
  styleUrl: './loans.scss'
})
export class Loans {
  private readonly service = inject(LoansService);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly loans = signal<Loan[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);

  readonly statusFilter = new FormControl<LoanStatus | ''>('', { nonNullable: true });
  readonly clientFilter = new FormControl<string>('', { nonNullable: true });

  readonly statusOptions: { label: string; value: LoanStatus | '' }[] = [
    { label: 'Todos', value: '' },
    { label: 'Sem avarias', value: 'sem avarias' },
    { label: 'Com avarias', value: 'com avarias' }
  ];

  readonly clientOptions = computed(() => [
    { label: 'Todos os clientes', value: '' },
    ...this.clients().map((c) => ({ label: c.tradeName, value: c.id }))
  ]);

  constructor() {
    this.clientsService.list().subscribe((clients) => this.clients.set(clients));

    combineLatest([
      this.statusFilter.valueChanges.pipe(startWith(this.statusFilter.value)),
      this.clientFilter.valueChanges.pipe(startWith(this.clientFilter.value))
    ])
      .pipe(
        debounceTime(200),
        switchMap(([status, clientId]) => this.load(status, clientId))
      )
      .subscribe();
  }

  private load(status: LoanStatus | '', clientId: string) {
    this.loading.set(true);
    return this.service.list({ status: status || undefined, clientId: clientId || undefined }).pipe(
      tap((data) => this.loans.set(data)),
      finalize(() => this.loading.set(false))
    );
  }

  clientName(clientId: string): string {
    return this.clients().find((c) => c.id === clientId)?.tradeName ?? '—';
  }

  label(status: LoanStatus): string {
    return loanStatusLabel(status);
  }

  severity(status: LoanStatus): 'success' | 'danger' {
    return loanStatusSeverity(status);
  }

  open(loan: Loan): void {
    void this.router.navigate(['/emprestimos', loan.id]);
  }
}
