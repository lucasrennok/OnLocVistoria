import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import type { ApprovalStatus, Client, Inspection, Loan } from '../../core/models/domain';

@Component({
  selector: 'app-inspections',
  imports: [TableModule, Button, Tag, DatePipe],
  templateUrl: './inspections.html',
  styleUrl: './inspections.scss'
})
export class Inspections {
  private readonly inspectionsService = inject(InspectionsService);
  private readonly clientsService = inject(ClientsService);
  private readonly loansService = inject(LoansService);
  private readonly router = inject(Router);

  readonly inspections = signal<Inspection[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin([
      this.inspectionsService.list(),
      this.clientsService.list(),
      this.loansService.list()
    ]).subscribe({
      next: ([inspections, clients, loans]) => {
        this.inspections.set(inspections);
        this.clients.set(clients);
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clientName(id: string): string {
    return this.clients().find((c) => c.id === id)?.tradeName ?? '—';
  }

  loanOrg(id: string): string {
    return this.loans().find((l) => l.id === id)?.organization ?? '—';
  }

  assessmentLabel(assessment: Inspection['assessment']): string {
    return assessment === 'avaria_por_mau_uso' ? 'Com avaria' : 'Sem avaria';
  }

  assessmentSeverity(assessment: Inspection['assessment']): 'danger' | 'success' {
    return assessment === 'avaria_por_mau_uso' ? 'danger' : 'success';
  }

  approvalLabel(approval: ApprovalStatus): string {
    switch (approval) {
      case 'pendente':
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'reprovado':
        return 'Reprovado';
    }
  }

  approvalSeverity(approval: ApprovalStatus): 'warn' | 'success' | 'danger' {
    switch (approval) {
      case 'pendente':
        return 'warn';
      case 'aprovado':
        return 'success';
      case 'reprovado':
        return 'danger';
    }
  }

  newInspection(): void {
    void this.router.navigate(['/devolucoes/nova']);
  }
}
