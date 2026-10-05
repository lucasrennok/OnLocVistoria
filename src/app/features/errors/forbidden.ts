import { Component } from '@angular/core';
import { Card } from 'primeng/card';

/** Tela de acesso negado (403). */
@Component({
  selector: 'app-forbidden',
  imports: [Card],
  template: `
    <p-card>
      <div class="forbidden">
        <i class="pi pi-lock"></i>
        <h2>Acesso negado</h2>
        <p>Você não tem permissão para acessar este recurso.</p>
      </div>
    </p-card>
  `,
  styles: `
    .forbidden { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem 1rem; text-align: center; }
    .forbidden i { font-size: 2.5rem; color: var(--p-red-500); }
    .forbidden p { color: var(--p-surface-600); margin: 0; }
  `
})
export class Forbidden {}
