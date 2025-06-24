import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState, Logout } from "../../state/auth.state";
import { map, take } from "rxjs";

export const AuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isAuthenticated).pipe(
    take(1), // Toma el valor actual y completa el observable
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        console.warn('Acceso denegado: Usuario no autenticado. Redirigiendo');
        store.dispatch(new Logout()); //desloguea (limpia estado, storage)
        router.navigate(['/auth/login'], { queryParams: { reason: 'expired' } })
        return false;
      }
    })
  )
}
