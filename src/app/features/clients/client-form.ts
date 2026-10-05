import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';

import { ClientsService } from '../../core/api/clients.service';
import { CpfCnpjMaskDirective } from '../../shared/directives/cpf-cnpj-mask.directive';
import { cpfCnpjValidator } from '../../shared/validators/cpf-cnpj.validator';
import { maskCpfCnpj, onlyDigits } from '../../shared/utils/cpf-cnpj';

@Component({
  selector: 'app-client-form',
  imports: [
    ReactiveFormsModule,
    Card,
    InputText,
    Button,
    Select,
    ProgressSpinner,
    CpfCnpjMaskDirective
  ],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  private readonly id = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.id;
  readonly formTitle = this.isEdit ? 'Editar cliente' : 'Novo cliente';

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly docTypes = [
    { label: 'CPF', value: 'CPF' },
    { label: 'CNPJ', value: 'CNPJ' }
  ];

  private readonly documentTaken = (control: AbstractControl) => {
    const value: string = control.value;
    if (!value) return of(null);
    return this.service
      .isDocumentTaken(value, this.id ?? undefined)
      .pipe(map((taken) => (taken ? { documentTaken: true } : null)));
  };

  readonly form = this.fb.nonNullable.group({
    tradeName: ['', [Validators.required]],
    responsible: ['', [Validators.required]],
    documentType: ['CPF' as 'CPF' | 'CNPJ', [Validators.required]],
    document: [
      '',
      { validators: [Validators.required, cpfCnpjValidator('documentType')], asyncValidators: [this.documentTaken] }
    ],
    location: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.form.controls.documentType.valueChanges.subscribe(() => {
      this.form.controls.document.updateValueAndValidity();
    });

    if (this.id) {
      this.loading.set(true);
      this.service.get(this.id).subscribe({
        next: (client) => {
          this.form.patchValue({
            tradeName: client.tradeName,
            responsible: client.responsible,
            documentType: client.documentType,
            document: maskCpfCnpj(client.document),
            location: client.location
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Cliente não encontrado.' });
        }
      });
    }
  }

  get tradeName() {
    return this.form.controls.tradeName;
  }

  get responsible() {
    return this.form.controls.responsible;
  }

  get document() {
    return this.form.controls.document;
  }

  get location() {
    return this.form.controls.location;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = { ...raw, document: onlyDigits(raw.document) };

    const request$ = this.id ? this.service.update(this.id, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEdit ? 'Cliente atualizado' : 'Cliente criado',
          detail: raw.tradeName
        });
        void this.router.navigate(['/clientes']);
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar o cliente.'
        });
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/clientes']);
  }
}
