import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { AuthState } from "../../state/auth.state";
import { switchMap, take } from "rxjs/operators";

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  // Obtenemos el token de forma síncrona (si es posible, o usamos take(1) para RxJS)
  // take(1) es importante para que el observable se complete después de obtener el token
  // y no cause un bucle infinito si se usa en un contexto de cambio de estado.

return store.select(AuthState.token).pipe(
  take(1), //solo el valor actual del token
  switchMap(token => { // switchMap es para transformar el observable del token en un observable de la petición
    if(token){
      //adjunat token
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(clonedReq)
    }
    return next(req) // se continua sin token si no hay uno
  })
)
}
