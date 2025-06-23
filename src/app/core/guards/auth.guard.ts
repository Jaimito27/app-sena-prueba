import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../state/auth.state";
import { map, take } from "rxjs";

export const AuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isAuthenticated).pipe(
    take(1), // Toma el valor actual y completa el observable
    map(isAuthenticated => {
      if(isAuthenticated){
        return true;
      }else{
        console.warn('Acceso denegado: Usuario no autenticado. Redirigiendo');
        router.navigate(['/auth/login'])
        return false;
      }
    })
  )
}
