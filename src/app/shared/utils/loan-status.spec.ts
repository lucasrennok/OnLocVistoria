import { loanStatusLabel, loanStatusSeverity } from './loan-status';

describe('loan-status', () => {
  it('retorna o rótulo em pt-BR', () => {
    expect(loanStatusLabel('sem avarias')).toBe('Sem avarias');
    expect(loanStatusLabel('com avarias')).toBe('Com avarias');
  });

  it('retorna a severidade da tag', () => {
    expect(loanStatusSeverity('sem avarias')).toBe('success');
    expect(loanStatusSeverity('com avarias')).toBe('danger');
  });
});
