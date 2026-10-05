import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import type { Role } from '../models/domain';

/** Restringe a rota aos papéis informados. Sem permissão → `/403`. */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.user();
    if (user && roles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/403']);
  };
}
