import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { TableModule } from 'primeng/table';

import { DamagesService } from '../../core/api/damages.service';
import { LoansService } from '../../core/api/loans.service';
import type { Damage, Loan } from '../../core/models/domain';

@Component({
  selector: 'app-damaged-loans',
  imports: [TableModule, DatePipe],
  templateUrl: './damaged-loans.html',
  styleUrl: './damaged-loans.scss'
})
export class DamagedLoans {
  private readonly damagesService = inject(DamagesService);
  private readonly loansService = inject(LoansService);

  readonly damages = signal<Damage[]>([]);
  readonly loans = signal<Loan[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin([this.damagesService.list(), this.loansService.list()]).subscribe({
      next: ([damages, loans]) => {
        this.damages.set(damages);
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loanOrg(loanId: string): string {
    return this.loans().find((l) => l.id === loanId)?.organization ?? '—';
  }

  itemPatrimony(damage: Damage): string {
    const loan = this.loans().find((l) => l.id === damage.loanId);
    return loan?.items.find((i) => i.id === damage.loanItemId)?.patrimonyNumber ?? '—';
  }
}
