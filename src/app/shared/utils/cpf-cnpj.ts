/**
 * Validação de CPF/CNPJ (dígitos verificadores) e utilidades de máscara.
 */

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

function allEqual(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || allEqual(cpf)) return false;

  const calcDigit = (base: string): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (base.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(cpf.slice(0, 9)) === Number(cpf[9]) && calcDigit(cpf.slice(0, 10)) === Number(cpf[10]);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || allEqual(cnpj)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return (
    calcDigit(cnpj.slice(0, 12), weights1) === Number(cnpj[12]) &&
    calcDigit(cnpj.slice(0, 13), weights2) === Number(cnpj[13])
  );
}

/** Valida CPF ou CNPJ conforme o tipo informado (ou qualquer um dos dois). */
export function isValidCpfOrCnpj(value: string, type?: 'CPF' | 'CNPJ'): boolean {
  const digits = onlyDigits(value);
  if (type === 'CPF') return isValidCpf(digits);
  if (type === 'CNPJ') return isValidCnpj(digits);
  return isValidCpf(digits) || isValidCnpj(digits);
}

/** Formata um CPF/CNPJ com máscara. */
export function maskCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
