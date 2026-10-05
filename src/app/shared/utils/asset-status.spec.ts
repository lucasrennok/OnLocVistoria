import { assetStatusLabel, assetStatusSeverity } from './asset-status';

describe('asset-status', () => {
  it('retorna o rótulo em pt-BR', () => {
    expect(assetStatusLabel('disponivel')).toBe('Disponível');
    expect(assetStatusLabel('emprestado')).toBe('Emprestado');
    expect(assetStatusLabel('avariado')).toBe('Avariado');
  });

  it('retorna a severidade da tag', () => {
    expect(assetStatusSeverity('disponivel')).toBe('success');
    expect(assetStatusSeverity('emprestado')).toBe('info');
    expect(assetStatusSeverity('avariado')).toBe('danger');
  });
});
