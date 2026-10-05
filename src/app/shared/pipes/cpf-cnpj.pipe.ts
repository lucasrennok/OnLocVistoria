import { Pipe, PipeTransform } from '@angular/core';

import { maskCpfCnpj } from '../utils/cpf-cnpj';

/** Exibe um CPF/CNPJ formatado (ex.: `123.456.789-09` ou `12.345.678/0001-99`). */
@Pipe({ name: 'cpfCnpj', standalone: true })
export class CpfCnpjPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? maskCpfCnpj(value) : '';
  }
}
