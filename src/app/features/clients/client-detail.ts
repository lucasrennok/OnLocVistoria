import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { ClientsService } from '../../core/api/clients.service';
import type { Client, Loan, LoanStatus } from '../../core/models/domain';
import { CpfCnpjPipe } from '../../shared/pipes/cpf-cnpj.pipe';

@Component({
  selector: 'app-client-detail',
  imports: [Card, TableModule, Tag, Button, CpfCnpjPipe, DatePipe],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.scss'
})
export class ClientDetail {
  private readonly service = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly client = signal<Client | null>(null);
  readonly loans = signal<Loan[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    forkJoin([this.service.get(id), this.service.loans(id)]).subscribe({
      next: ([client, loans]) => {
        this.client.set(client);
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  statusSeverity(status: LoanStatus): 'success' | 'danger' {
    return status === 'sem avarias' ? 'success' : 'danger';
  }

  statusLabel(status: LoanStatus): string {
    return status === 'sem avarias' ? 'Sem avarias' : 'Com avarias';
  }

  edit(): void {
    void this.router.navigate(['/clientes', this.client()?.id, 'editar']);
  }

  back(): void {
    void this.router.navigate(['/clientes']);
  }
}
