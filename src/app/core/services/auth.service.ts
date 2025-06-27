import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Login as LoginAction, SetUser, ForgotPassword as ForgotPasswordAction, Logout, AuthState } from '../../state/auth.state';
import { User } from '../../shared/models/user.interface';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private API_URL = 'https://dummyjson.com'
  constructor() { }

  //autenticación simulada

  login(username: string, password: string): Observable<any> {
    this.store.dispatch(new LoginAction(username, password));
    return this.http.post<any>(`${this.API_URL}/auth/login`, { username, password }).pipe(
      tap(res => {
        const expiresAt = Date.now() + 30 * 60 * 1000;
        const token = res.token || res.accessToken
        const userWithRoles = {
          ...res,
          roles: res.id === 1 ? ['admin', 'user'] : ['user'], // ejemplo: el id 1 es admin
          tenantId: res.id % 2 === 0 ? 'tenant1' : 'tenant2', // ejemplo de tenantId
        }
        this.store.dispatch(new SetUser(userWithRoles, token, expiresAt));
      }),
      catchError(error => {
        this.store.dispatch(new Logout());
        return throwError(() => new Error(error.error?.message || 'Error en el login'));
      })
    )
  }

  forgotPassword(email: string): Observable<any> {
    //dispara la acción para indicar que la operación comienza y establecer isLoading como true
    this.store.dispatch(new ForgotPasswordAction({ email: email, isLoading: true, error: null }));
    console.log(`Verificando email para recuperación de contraseña: ${email}`);
    //invocar los usuarios de la API

    return this.http.get<{ users: User[] }>(this.API_URL).pipe(
      //para cambiar del observable de la petición HTTP a un nuevo observable que simula el éxito o lanza un error.
      switchMap(res => {
        //busca el email proporcionado en el array de usuarios
        const foundUser = res.users.find(user => user.email === email)


        if (foundUser) {
          //si encuenta el email, simula el exito despues de una pequeña demora
          return of({ success: true, message: `Instrucciones de recuperación enviadas al correo ${email}` }).pipe(
            tap(() => {
              console.log('Recuperación simulada exitosa');
              //se dispara la acción para indicar que la operacion finalizó
              this.store.dispatch(new ForgotPasswordAction({ isLoading: false, error: null }));
            })
          );
        } else {
          //si no se encuenta el email lanza un eror
          const errorMesagge = 'No se encuentra el email proporcionado'
          this.store.dispatch(new ForgotPasswordAction({ isLoading: false, error: errorMesagge }))
          return throwError(() => new Error(errorMesagge)); // Lanza el error para que sea capturado por el catchError principal
        }
      }),
      //manejo generak de errores de la llamada HTTP o del swithmap
      catchError(error => {
        console.error('Recuperación de contraseña fallida', error);
        const errorMessage = error.message || 'Error en recuperación de constraseña';
        //el estado error desaparezca si hay fallo inesperado
        this.store.dispatch(new ForgotPasswordAction({ isLoading: false, error: errorMessage }));
        return throwError(() => new Error(errorMessage));
      })
    );
  }




  //registro (simulado)
  register(userDetails: any): Observable<any> {
    // userDetails debe incluir al menos: firstName, lastName, username, password, email, etc.
    return this.http.post<any>('https://dummyjson.com/users/add', userDetails).pipe(
      // Puedes mapear la respuesta si necesitas agregar lógica extra o notificar al usuario
      map(res => {
        // res es el usuario recién creado, pero NO incluye token
        // Aquí podrías retornar el usuario o solo un mensaje de éxito
        return res;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Error al registrar'));
      })
    );
  }

  //cerrar sesión
  logout(): void {
    this.store.dispatch(new Logout());
  }

  //simulación renovación de token
  renewToken(token: string): Observable<{ token: string, expiresAt: number }> {
    return this.http.post<any>(`${this.API_URL}/auth/refresh`, { token }).pipe(
      map(res => ({
        token: res.token,
        expiresAt: Date.now() + 30 * 60 * 1000,
      }))
    )
  }
}
