import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { AssetsService } from '../../core/api/assets.service';
import { ClientsService } from '../../core/api/clients.service';
import { LoansService, type LoanPayload } from '../../core/api/loans.service';
import type { Asset, Client, LoanItem, LoanStatus } from '../../core/models/domain';

/** Converte Date → valor de input `datetime-local` (horário local). */
function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/** Converte valor de input `datetime-local` → ISO 8601 (UTC). */
function dateTimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

@Component({
  selector: 'app-loan-form',
  imports: [ReactiveFormsModule, Card, InputText, Button, Select, Checkbox, Textarea, ProgressSpinner],
  templateUrl: './loan-form.html',
  styleUrl: './loan-form.scss'
})
export class LoanForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LoansService);
  private readonly clientsService = inject(ClientsService);
  private readonly assetsService = inject(AssetsService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly clients = signal<Client[]>([]);
  readonly assets = signal<Asset[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly statusOptions: { label: string; value: LoanStatus }[] = [
    { label: 'Sem avarias', value: 'sem avarias' },
    { label: 'Com avarias', value: 'com avarias' }
  ];

  readonly form = this.fb.nonNullable.group({
    clientId: ['', [Validators.required]],
    organization: ['', [Validators.required]],
    date: [toDateTimeLocal(new Date()), [Validators.required]],
    details: [''],
    status: ['sem avarias' as LoanStatus, [Validators.required]],
    items: this.fb.array<{ assetId: string; returned: boolean }>([])
  });

  constructor() {
    forkJoin([this.clientsService.list(), this.assetsService.list()]).subscribe({
      next: ([clients, assets]) => {
        this.clients.set(clients);
        this.assets.set(assets);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get clientId() {
    return this.form.controls.clientId;
  }

  get organization() {
    return this.form.controls.organization;
  }

  get items(): FormArray {
    return this.form.controls.items;
  }

  assetControl(index: number): AbstractControl {
    return this.items.at(index).get('assetId')!;
  }

  addItem(): void {
    this.items.push(
      this.fb.nonNullable.group({
        assetId: ['', [Validators.required]],
        returned: [false]
      })
    );
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue() as {
      clientId: string;
      organization: string;
      date: string;
      details: string;
      status: LoanStatus;
      items: { assetId: string; returned: boolean }[];
    };

    const patrimonyById = new Map(this.assets().map((a) => [a.id, a.patrimonyNumber]));
    const items: LoanItem[] = raw.items.map((item, index) => ({
      id: `li-${Date.now()}-${index}`,
      assetId: item.assetId,
      patrimonyNumber: patrimonyById.get(item.assetId) ?? '',
      returned: item.returned
    }));

    const payload: LoanPayload = {
      clientId: raw.clientId,
      organization: raw.organization,
      date: dateTimeLocalToIso(raw.date),
      details: raw.details.trim() ? raw.details : undefined,
      status: raw.status,
      items
    };

    this.service.create(payload).subscribe({
      next: (loan) => {
        this.messages.add({
          severity: 'success',
          summary: 'Empréstimo criado',
          detail: loan.organization
        });
        void this.router.navigate(['/emprestimos']);
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível criar o empréstimo.'
        });
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/emprestimos']);
  }
}
