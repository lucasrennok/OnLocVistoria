import type { LoanStatus } from '../../core/models/domain';

export function loanStatusLabel(status: LoanStatus): string {
  return status === 'sem avarias' ? 'Sem avarias' : 'Com avarias';
}

export function loanStatusSeverity(status: LoanStatus): 'success' | 'danger' {
  return status === 'sem avarias' ? 'success' : 'danger';
}
