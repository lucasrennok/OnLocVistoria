import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isValidCpfOrCnpj } from '../utils/cpf-cnpj';

/**
 * Valida CPF/CNPJ (dígitos verificadores).
 * Se `documentTypeControlName` for informado, valida conforme o tipo selecionado.
 */
export function cpfCnpjValidator(documentTypeControlName = 'documentType'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (!value) return null;

    const type = control.parent?.get(documentTypeControlName)?.value as 'CPF' | 'CNPJ' | undefined;
    return isValidCpfOrCnpj(value, type) ? null : { cpfCnpj: true };
  };
}
