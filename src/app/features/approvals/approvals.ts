import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Inspection, Loan } from '../../core/models/domain';

@Component({
  selector: 'app-approvals',
  imports: [TableModule, Button, Tag, DatePipe, Dialog],
  templateUrl: './approvals.html',
  styleUrl: './approvals.scss'
})
export class Approvals {
  private readonly inspectionsService = inject(InspectionsService);
  private readonly clientsService = inject(ClientsService);
  private readonly loansService = inject(LoansService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly inspections = signal<Inspection[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly loading = signal(true);
  readonly selected = signal<Inspection | null>(null);

  readonly pending = computed(() => this.inspections().filter((i) => i.approval === 'pendente'));

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
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

  loanFor(id: string): Loan | null {
    return this.loans().find((l) => l.id === id) ?? null;
  }

  viewDetails(inspection: Inspection): void {
    this.selected.set(inspection);
  }

  approveFromDialog(): void {
    const inspection = this.selected();
    if (!inspection) return;
    this.selected.set(null);
    this.approve(inspection);
  }

  rejectFromDialog(): void {
    const inspection = this.selected();
    if (!inspection) return;
    this.selected.set(null);
    this.reject(inspection);
  }

  approve(inspection: Inspection): void {
    this.confirm.confirm({
      header: 'Aprovar vistoria',
      message: `Aprovar a devolução de "${this.loanOrg(inspection.loanId)}"?`,
      icon: 'pi pi-check',
      acceptLabel: 'Aprovar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.inspectionsService.approve(inspection.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Aprovado', detail: 'Devolução arquivada sem avarias.' });
            this.load();
          },
          error: () =>
            this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível aprovar.' })
        });
      }
    });
  }

  reject(inspection: Inspection): void {
    this.confirm.confirm({
      header: 'Reprovar vistoria',
      message: `Reprovar a devolução de "${this.loanOrg(inspection.loanId)}"? Ela voltará para avaliação.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Reprovar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.inspectionsService.reject(inspection.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'info', summary: 'Reprovado', detail: 'Devolução devolvida para avaliação.' });
            this.load();
          },
          error: () =>
            this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível reprovar.' })
        });
      }
    });
  }
}
