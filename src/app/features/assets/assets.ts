import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { AssetsService } from '../../core/api/assets.service';
import type { Asset, AssetStatus } from '../../core/models/domain';
import { assetStatusLabel, assetStatusSeverity } from '../../shared/utils/asset-status';

@Component({
  selector: 'app-assets',
  imports: [ReactiveFormsModule, TableModule, Button, Select, Tag, RouterLink],
  templateUrl: './assets.html',
  styleUrl: './assets.scss'
})
export class Assets {
  private readonly service = inject(AssetsService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly assets = signal<Asset[]>([]);
  readonly loading = signal(false);

  readonly statusFilter = new FormControl<AssetStatus | ''>('', { nonNullable: true });
  readonly statusOptions: { label: string; value: AssetStatus | '' }[] = [
    { label: 'Todos', value: '' },
    { label: 'Disponível', value: 'disponivel' },
    { label: 'Emprestado', value: 'emprestado' },
    { label: 'Avariado', value: 'avariado' }
  ];

  constructor() {
    this.statusFilter.valueChanges
      .pipe(
        startWith(this.statusFilter.value),
        distinctUntilChanged(),
        switchMap((status) => this.load(status))
      )
      .subscribe();
  }

  private load(status: AssetStatus | '') {
    this.loading.set(true);
    return this.service.list(status || undefined).pipe(
      tap((data) => this.assets.set(data)),
      finalize(() => this.loading.set(false))
    );
  }

  label(status: AssetStatus): string {
    return assetStatusLabel(status);
  }

  severity(status: AssetStatus): 'success' | 'info' | 'danger' {
    return assetStatusSeverity(status);
  }

  newAsset(): void {
    void this.router.navigate(['/equipamentos/novo']);
  }

  open(asset: Asset): void {
    void this.router.navigate(['/equipamentos', asset.id]);
  }

  edit(asset: Asset): void {
    void this.router.navigate(['/equipamentos', asset.id, 'editar']);
  }

  confirmDelete(asset: Asset): void {
    this.confirm.confirm({
      header: 'Confirmar exclusão',
      message: `Excluir o equipamento "${asset.patrimonyNumber}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(asset.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Equipamento excluído',
              detail: asset.patrimonyNumber
            });
            this.load(this.statusFilter.value).subscribe();
          },
          error: () =>
            this.messages.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir o equipamento.'
            })
        });
      }
    });
  }
}
