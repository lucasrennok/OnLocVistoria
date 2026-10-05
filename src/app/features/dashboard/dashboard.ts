import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { AssetsService } from '../../core/api/assets.service';
import { ClientsService } from '../../core/api/clients.service';
import { DamagesService } from '../../core/api/damages.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import { AuthService } from '../../core/auth/auth.service';
import type {
  ApprovalStatus,
  Asset,
  Client,
  Damage,
  Inspection,
  Loan
} from '../../core/models/domain';

interface MetricCard {
  label: string;
  value: number;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [Card, TableModule, Tag, DatePipe],
  template: `
    <div class="dashboard">
      <div class="welcome">
        <h1>Painel</h1>
        <p>Olá, <strong>{{ auth.user()?.name }}</strong>. Visão geral da On.loc.</p>
      </div>

      <div class="cards">
        @for (card of cards(); track card.label) {
          <p-card class="metric-card" (click)="go(card.route)">
            <div class="metric">
              <i class="{{ card.icon }}"></i>
              <strong class="metric-value">{{ card.value }}</strong>
              <span class="metric-label">{{ card.label }}</span>
            </div>
          </p-card>
        }
      </div>

      <p-card class="recent-card">
        <h3 class="card-title">Devoluções recentes</h3>
        <p-table [value]="recent()" [loading]="loading()" styleClass="shadow-1">
          <ng-template pTemplate="header">
            <tr>
              <th>Cliente</th>
              <th>Empréstimo</th>
              <th>Data</th>
              <th>Aprovação</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inspection>
            <tr>
              <td>{{ clientName(inspection.clientId) }}</td>
              <td>{{ loanOrg(inspection.loanId) }}</td>
              <td>{{ inspection.date | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <p-tag
                  [value]="approvalLabel(inspection.approval)"
                  [severity]="approvalSeverity(inspection.approval)"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty">Nenhuma devolução registrada.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: `
    .dashboard { max-width: 960px; }
    .welcome h1 { margin: 0 0 0.25rem; }
    .welcome p { color: var(--p-surface-600); margin: 0 0 1.5rem; }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card { cursor: pointer; }
    .metric-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }

    .metric { display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem; }
    .metric i { font-size: 1.5rem; color: #16a34a; }
    .metric-value { font-size: 1.75rem; line-height: 1; }
    .metric-label { color: var(--p-surface-600); font-size: 0.85rem; }

    .recent-card { margin-bottom: 1.5rem; }
    .card-title { margin: 0 0 1rem; font-size: 1.1rem; }
    .empty { padding: 1.5rem; text-align: center; color: var(--p-surface-500); }
  `
})
export class Dashboard {
  private readonly clientsService = inject(ClientsService);
  private readonly assetsService = inject(AssetsService);
  private readonly loansService = inject(LoansService);
  private readonly inspectionsService = inject(InspectionsService);
  private readonly damagesService = inject(DamagesService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly clients = signal<Client[]>([]);
  readonly assets = signal<Asset[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly inspections = signal<Inspection[]>([]);
  readonly damages = signal<Damage[]>([]);
  readonly loading = signal(true);

  readonly cards = computed<MetricCard[]>(() => [
    { label: 'Clientes', value: this.clients().length, icon: 'pi pi-building', route: '/clientes' },
    { label: 'Equipamentos', value: this.assets().length, icon: 'pi pi-wrench', route: '/equipamentos' },
    { label: 'Empréstimos', value: this.loans().length, icon: 'pi pi-box', route: '/emprestimos' },
    {
      label: 'Devoluções pendentes',
      value: this.inspections().filter((i) => i.approval === 'pendente').length,
      icon: 'pi pi-inbox',
      route: '/devolucoes'
    },
    {
      label: 'Aprovadas',
      value: this.inspections().filter((i) => i.approval === 'aprovado').length,
      icon: 'pi pi-check-circle',
      route: '/devolucoes'
    },
    { label: 'Avariados', value: this.damages().length, icon: 'pi pi-exclamation-triangle', route: '/avariados' }
  ]);

  readonly recent = computed(() =>
    [...this.inspections()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  );

  ngOnInit(): void {
    forkJoin([
      this.clientsService.list(),
      this.assetsService.list(),
      this.loansService.list(),
      this.inspectionsService.list(),
      this.damagesService.list()
    ]).subscribe({
      next: ([clients, assets, loans, inspections, damages]) => {
        this.clients.set(clients);
        this.assets.set(assets);
        this.loans.set(loans);
        this.inspections.set(inspections);
        this.damages.set(damages);
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

  go(route: string): void {
    void this.router.navigate([route]);
  }
}
