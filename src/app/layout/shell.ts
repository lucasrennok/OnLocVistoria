import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

import { AuthService } from '../core/auth/auth.service';
import type { Role } from '../core/models/domain';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Avatar, Button, ConfirmDialog, Toast],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  readonly auth = inject(AuthService);

  private readonly navItems: NavItem[] = [
    { label: 'Painel', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Clientes', icon: 'pi pi-building', route: '/clientes' },
    { label: 'Equipamentos', icon: 'pi pi-wrench', route: '/equipamentos' },
    { label: 'Empréstimos', icon: 'pi pi-box', route: '/emprestimos' },
    { label: 'Devoluções', icon: 'pi pi-undo', route: '/devolucoes' },
    { label: 'Avariados', icon: 'pi pi-exclamation-triangle', route: '/avariados' },
    { label: 'Aprovações', icon: 'pi pi-check-circle', route: '/aprovacoes', roles: ['Gestor'] },
    { label: 'Usuários', icon: 'pi pi-users', route: '/usuarios', roles: ['Gestor'] }
  ];

  readonly visibleItems = computed(() =>
    this.navItems.filter((item) => !item.roles || item.roles.includes(this.auth.user()?.role ?? 'Analista'))
  );

  get initials(): string {
    const name = this.auth.user()?.name ?? '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
