import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { UsersService } from '../../core/api/users.service';
import type { Role, User } from '../../core/models/domain';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button, Tag],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users {
  private readonly service = inject(UsersService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.loading.set(true);
    return this.service.list().pipe(
      tap((users) => this.users.set(users)),
      finalize(() => this.loading.set(false))
    );
  }

  roleSeverity(role: Role): 'info' | 'success' {
    return role === 'Gestor' ? 'success' : 'info';
  }

  newUser(): void {
    void this.router.navigate(['/usuarios/novo']);
  }

  confirmDelete(user: User): void {
    this.confirm.confirm({
      header: 'Confirmar exclusão',
      message: `Excluir o usuário "${user.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(user.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Usuário excluído', detail: user.name });
            this.load().subscribe();
          },
          error: () =>
            this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' })
        });
      }
    });
  }
}
