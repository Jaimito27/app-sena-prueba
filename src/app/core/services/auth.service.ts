import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Login as LoginAction, SetUser, ForgotPassword as ForgotPasswordAction, Logout } from '../../state/auth.state';
import { User } from '../../shared/models/user.interface';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private API_URL = 'https://dummyjson.com/users'
  constructor() { }

  //autenticación simulada

  login(email: string, password: string): Observable<any> {
    this.store.dispatch(new LoginAction(email, password));
    // Opción 2: Obtener todos los usuarios y filtrar en el cliente por el campo 'email'

    return this.http.get<{ users: User[] }>(this.API_URL).pipe(//trae todos los usuarios
      map(res => {
        //buscar e, usuario por email en el array que devuelve la API
        const user = res.users.find(u => u.email === email);
        if (user) {
          const simulatedUser: User = {
            ...user,
            roles: user.id === 1 ? ['admin', 'user'] : ['user'], //user con id es admin
            tenantId: user.id % 2 === 0 ? 'tenant1' : 'tenant2', //alternar tendadid para simular
          };

          const simulatedToken = `fake-jwt-token-${user.id}-${Date.now()}`;

          //el token exoira en 30 minutos
          const expiresAt=Date.now() +30 *60*1000; //30 miunutos
          //despacha con expiresAt
          this.store.dispatch(new SetUser(simulatedUser, simulatedToken, expiresAt));
          return { token: simulatedToken, user: simulatedUser };
        } else {
          throw new Error('Credenciales inválidas: Usuario no encontrado.')
        }
      }),
      catchError(error => {
        console.error('Error durante la llamada', error);
        return throwError(() => new Error('Error el inciar sesión: ' + (error.message || 'Error')));
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
    //con el endpoint /user/add se simula el registro
    return this.http.post<User>(`${this.API_URL}/add`, userDetails).pipe(
      tap(newUser => {
        console.log('Simulación de registro exitosa: ', newUser);
        const simulatedUser: User = {
          ...newUser,
          roles: ['user'], //por defecto, nuevos usuario son 'user'
          tenantId: (Math.floor(Math.random() * 2) + 1).toString(), //asignar un tenant id aleatorio
        };
        const simulatedToken = `fake-jwt-token-new-<span class="math-inline">\{newUser\.id\}\-</span>{Date.now()}`;
//el token exoira en 30 minutos
          const expiresAt=Date.now() +30 *60*1000; //30 miunutos


        this.store.dispatch(new SetUser(simulatedUser, simulatedToken, expiresAt));
      }),
      catchError(error => {
        console.error('Simulación de registro fallida: ', error);
        return throwError(() => new Error('Error al registrar usuario: ' + error.message));
      })
    );
  }

  //cerrar sesión
  logout(): void {
    this.store.dispatch(new Logout());
  }
}
