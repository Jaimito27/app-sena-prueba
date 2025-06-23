import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Login as LoginAction, SetUser, ForgotPassword, Logout } from '../../state/auth.state';
import { User } from '../../shared/models/user.interface';
import { catchError, map, tap } from 'rxjs/operators';
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
            tenantId: user.id % 2 === 0 ? 1 : 2, //alternar tendadid para simular
          };

          const simulatedToken = `fake-jwt-token-${user.id}-${Date.now()}`;

          this.store.dispatch(new SetUser(simulatedUser, simulatedToken));
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

  //Recuperación de contraseña
  forgotPassword(email: string): Observable<any> {
    //se simula una respuesta
    console.log(`Simulando una recuperación de contraseña ${email}`);
    this.store.dispatch(new ForgotPassword({ email: email, isLoading: true, error: null })); //dipara la acción de recuperacion
    return of({ success: true, message: `Instrucciones enviadas al ${email}` }).pipe(
      tap(() => {
        console.log('Simulación exitosa');
        this.store.dispatch(new ForgotPassword({ isLoading: false, error: null }))
      }),
      catchError(error => {
        console.error('Simulación fallida: ', error);
        const errorMessage = error.message || 'Error en la recuperación de contraseña';
        this.store.dispatch(new ForgotPassword({ isLoading: false, error: errorMessage }));
        return throwError(() => new Error(errorMessage))
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
          tenantId: Math.floor(Math.random() * 2) + 1, //asignar un tenant id aleatorio
        };
        const simulatedToken = `fake-jwt-token-new-<span class="math-inline">\{newUser\.id\}\-</span>{Date.now()}`;
        this.store.dispatch(new SetUser(simulatedUser, simulatedToken));
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
