import type { AssetStatus } from '../../core/models/domain';

export function assetStatusLabel(status: AssetStatus): string {
  switch (status) {
    case 'disponivel':
      return 'Disponível';
    case 'emprestado':
      return 'Emprestado';
    case 'avariado':
      return 'Avariado';
  }
}

export function assetStatusSeverity(status: AssetStatus): 'success' | 'info' | 'danger' {
  switch (status) {
    case 'disponivel':
      return 'success';
    case 'emprestado':
      return 'info';
    case 'avariado':
      return 'danger';
  }
}
