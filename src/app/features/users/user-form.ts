import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

import { ROLES, UsersService } from '../../core/api/users.service';
import type { Role } from '../../core/models/domain';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, Card, InputText, Button, Select],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsersService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly saving = signal(false);
  readonly roles = ROLES;

  private readonly emailTaken = (control: AbstractControl) => {
    const value: string = control.value;
    if (!value) return of(null);
    return this.service.isEmailTaken(value).pipe(map((taken) => (taken ? { emailTaken: true } : null)));
  };

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', { validators: [Validators.required, Validators.email], asyncValidators: [this.emailTaken] }],
    role: ['Analista' as Role, [Validators.required]]
  });

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    this.service.create(payload).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Usuário criado', detail: payload.name });
        void this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar o usuário.' });
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/usuarios']);
  }
}
