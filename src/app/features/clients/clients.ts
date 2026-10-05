import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { ClientsService } from '../../core/api/clients.service';
import type { Client } from '../../core/models/domain';
import { CpfCnpjPipe } from '../../shared/pipes/cpf-cnpj.pipe';

@Component({
  selector: 'app-clients',
  imports: [ReactiveFormsModule, TableModule, Button, InputText, CpfCnpjPipe, RouterLink],
  templateUrl: './clients.html',
  styleUrl: './clients.scss'
})
export class Clients {
  private readonly service = inject(ClientsService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);

  readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    this.search.valueChanges
      .pipe(
        startWith(this.search.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.load(term))
      )
      .subscribe();
  }

  private load(term: string) {
    this.loading.set(true);
    return this.service.list(term).pipe(
      tap((data) => this.clients.set(data)),
      finalize(() => this.loading.set(false))
    );
  }

  newClient(): void {
    void this.router.navigate(['/clientes/novo']);
  }

  open(client: Client): void {
    void this.router.navigate(['/clientes', client.id]);
  }

  edit(client: Client): void {
    void this.router.navigate(['/clientes', client.id, 'editar']);
  }

  confirmDelete(client: Client): void {
    this.confirm.confirm({
      header: 'Confirmar exclusão',
      message: `Excluir o cliente "${client.tradeName}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(client.id).subscribe({
          next: () => {
            this.messages.add({
              severity: 'success',
              summary: 'Cliente excluído',
              detail: client.tradeName
            });
            this.load(this.search.value).subscribe();
          },
          error: () =>
            this.messages.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir o cliente.'
            })
        });
      }
    });
  }
}
