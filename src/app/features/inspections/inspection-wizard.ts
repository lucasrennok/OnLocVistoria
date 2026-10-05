import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService, type InspectionPayload } from '../../core/api/inspections.service';
import type { Client, Loan, PhotoEvidence } from '../../core/models/domain';
import { compressImage } from '../../shared/utils/image-compress.util';

type Assessment = 'avaria_por_mau_uso' | 'sem_avaria';

@Component({
  selector: 'app-inspection-wizard',
  imports: [
    FormsModule,
    Card,
    Button,
    Select,
    Checkbox,
    RadioButton,
    Textarea,
    DatePipe
  ],
  templateUrl: './inspection-wizard.html',
  styleUrl: './inspection-wizard.scss'
})
export class InspectionWizard {
  private readonly clientsService = inject(ClientsService);
  private readonly inspections = inject(InspectionsService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly step = signal(1);

  readonly clients = signal<Client[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly photos = signal<PhotoEvidence[]>([]);

  readonly loadingClients = signal(true);
  readonly loadingLoans = signal(false);
  readonly compressing = signal(false);
  readonly submitting = signal(false);

  selectedClientId: string | null = null;
  selectedLoanId: string | null = null;
  returnedItems: Record<string, boolean> = {};
  assessment: Assessment | null = null;
  damageItemId: string | null = null;
  damageDescription = '';
  note = '';

  constructor() {
    this.clientsService.list().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loadingClients.set(false);
      },
      error: () => this.loadingClients.set(false)
    });
  }

  get selectedLoan(): Loan | null {
    return this.loans().find((l) => l.id === this.selectedLoanId) ?? null;
  }

  onClientChange(clientId: string): void {
    this.selectedClientId = clientId;
    this.selectedLoanId = null;
    this.loans.set([]);
    this.loadingLoans.set(true);
    this.clientsService.loans(clientId).subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.loadingLoans.set(false);
      },
      error: () => this.loadingLoans.set(false)
    });
  }

  toggleReturned(itemId: string, value: boolean): void {
    this.returnedItems = { ...this.returnedItems, [itemId]: value };
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    this.compressing.set(true);
    for (const file of files) {
      const compressed = await compressImage(file);
      const preview = URL.createObjectURL(compressed);
      this.photos.update((p) => [...p, { url: preview }]);
    }
    this.compressing.set(false);
  }

  removePhoto(index: number): void {
    this.photos.update((p) => {
      const copy = [...p];
      copy.splice(index, 1);
      return copy;
    });
  }

  next(): void {
    if (this.step() < 4) this.step.update((s) => s + 1);
  }

  back(): void {
    if (this.step() > 1) this.step.update((s) => s - 1);
  }

  submit(): void {
    const loan = this.selectedLoan;
    if (!loan || !this.selectedClientId) return;

    if (!this.assessment) {
      this.messages.add({
        severity: 'warn',
        summary: 'Avaliação',
        detail: 'Indique se há avaria por mau uso.'
      });
      return;
    }

    if (this.assessment === 'avaria_por_mau_uso' && !this.damageDescription.trim()) {
      this.messages.add({
        severity: 'warn',
        summary: 'Avaliação',
        detail: 'Descreva a avaria localizada.'
      });
      return;
    }

    this.submitting.set(true);
    const items = loan.items.map((i) => ({
      ...i,
      returned: this.returnedItems[i.id] ?? i.returned
    }));

    const payload: InspectionPayload = {
      clientId: this.selectedClientId,
      loanId: loan.id,
      date: new Date().toISOString(),
      photos: this.photos().map((p) => ({ url: p.url, note: this.note })),
      assessment: this.assessment,
      items
    };

    if (this.assessment === 'avaria_por_mau_uso') {
      payload.damages = [
        {
          loanItemId: this.damageItemId ?? loan.items[0]?.id ?? '',
          description: this.damageDescription,
          photos: this.photos().map((p) => p.url)
        }
      ];
    }

    this.inspections.create(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.messages.add({ severity: 'success', summary: 'Vistoria registrada' });
        void this.router.navigate(['/devolucoes']);
      },
      error: () => {
        this.submitting.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível registrar a vistoria.'
        });
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/devolucoes']);
  }
}
