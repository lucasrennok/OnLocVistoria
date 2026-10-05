import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';

import { AssetsService } from '../../core/api/assets.service';
import type { AssetStatus, SubItem } from '../../core/models/domain';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule, Card, InputText, Button, Select, ProgressSpinner],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss'
})
export class AssetForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AssetsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  private readonly id = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.id;
  readonly formTitle = this.isEdit ? 'Editar equipamento' : 'Novo equipamento';

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly statusOptions: { label: string; value: AssetStatus }[] = [
    { label: 'Disponível', value: 'disponivel' },
    { label: 'Emprestado', value: 'emprestado' },
    { label: 'Avariado', value: 'avariado' }
  ];

  private readonly patrimonyTaken = (control: AbstractControl) => {
    const value: string = control.value;
    if (!value) return of(null);
    return this.service
      .isPatrimonyTaken(value, this.id ?? undefined)
      .pipe(map((taken) => (taken ? { patrimonyTaken: true } : null)));
  };

  readonly form = this.fb.nonNullable.group({
    patrimonyNumber: [
      '',
      { validators: [Validators.required], asyncValidators: [this.patrimonyTaken] }
    ],
    serialNumber: [''],
    description: ['', [Validators.required]],
    status: ['disponivel' as AssetStatus, [Validators.required]],
    subItems: this.fb.array<SubItem>([])
  });

  ngOnInit(): void {
    if (this.id) {
      this.loading.set(true);
      this.service.get(this.id).subscribe({
        next: (asset) => {
          this.form.patchValue({
            patrimonyNumber: asset.patrimonyNumber,
            serialNumber: asset.serialNumber,
            description: asset.description,
            status: asset.status
          });
          this.subItems.clear();
          asset.subItems.forEach((s) => this.addSubItem(s));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Equipamento não encontrado.' });
        }
      });
    }
  }

  get patrimonyNumber() {
    return this.form.controls.patrimonyNumber;
  }

  get description() {
    return this.form.controls.description;
  }

  get subItems(): FormArray {
    return this.form.controls.subItems;
  }

  addSubItem(item?: SubItem): void {
    this.subItems.push(
      this.fb.nonNullable.group({
        id: [item?.id ?? ''],
        name: [item?.name ?? '', [Validators.required]],
        patrimonyNumber: [item?.patrimonyNumber ?? '']
      })
    );
  }

  removeSubItem(index: number): void {
    this.subItems.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue() as {
      patrimonyNumber: string;
      serialNumber: string;
      description: string;
      status: AssetStatus;
      subItems: SubItem[];
    };
    const payload = {
      ...raw,
      subItems: raw.subItems.map((s, index) => ({
        id: s.id || `s-${Date.now()}-${index}`,
        name: s.name,
        patrimonyNumber: s.patrimonyNumber
      }))
    };

    const request$ = this.id ? this.service.update(this.id, payload) : this.service.create(payload);
    request$.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEdit ? 'Equipamento atualizado' : 'Equipamento criado',
          detail: raw.patrimonyNumber
        });
        void this.router.navigate(['/equipamentos']);
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível salvar o equipamento.'
        });
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/equipamentos']);
  }
}
