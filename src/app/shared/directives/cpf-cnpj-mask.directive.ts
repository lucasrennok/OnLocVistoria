import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

import { maskCpfCnpj, onlyDigits } from '../utils/cpf-cnpj';

/** Aplica a máscara de CPF/CNPJ ao digitar (compatível com `formControl`). */
@Directive({ selector: 'input[cpfCnpjMask]', standalone: true })
export class CpfCnpjMaskDirective {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  @HostListener('input')
  onInput(): void {
    const digits = onlyDigits(this.el.nativeElement.value);
    const formatted = digits ? maskCpfCnpj(digits) : '';
    this.el.nativeElement.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: false });
  }
}
