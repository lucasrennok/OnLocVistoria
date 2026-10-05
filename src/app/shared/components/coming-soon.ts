import { Component, input } from '@angular/core';
import { Card } from 'primeng/card';

/** Placeholder de telas ainda não implementadas (fases futuras). */
@Component({
  selector: 'app-coming-soon',
  imports: [Card],
  template: `
    <p-card>
      <div class="soon">
        <i class="pi pi-hammer"></i>
        <h2>{{ title() }}</h2>
        <p>Esta tela será implementada nas próximas fases.</p>
      </div>
    </p-card>
  `,
  styles: `
    .soon { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem 1rem; text-align: center; }
    .soon i { font-size: 2rem; color: var(--p-surface-400); }
    .soon p { color: var(--p-surface-600); margin: 0; }
  `
})
export class ComingSoon {
  readonly title = input('Em construção');
}
