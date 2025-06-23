import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AuthState } from "../../state/auth.state";
import { map, take } from "rxjs/operators";

export const RoleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as string[];  // Obtiene los roles esperados de la data de la ruta

  if (!expectedRoles) {
    console.error('RoleGuard: No se especificaron los roles esperados para la ruta');
    return false;
  }

  return store.select(AuthState.currentUser).pipe(
    take(1),
    map(user => {
      if(user && user.roles && expectedRoles.some(role => user.roles.includes(role))){
        return true // el usuario tiene al menos uno de los roles requeridos
      }else {
        console.warn(`Acceso denegado: El usuario no tiene los roles requeridos (${expectedRoles.join(', ')}).`)
        router.navigate(['/dashboard']);
        return false;
      }
    })
  )

}
