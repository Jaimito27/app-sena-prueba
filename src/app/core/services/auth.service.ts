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

  login(email: string, password: string) {
    this.store.dispatch(new LoginAction(email, password)); //diapara la acción de inicio de sesión

    //para simular, se usa el email como username

    return this.http.get<{ users: User[] }>(`<span class="math-inline">\{this\.API\_URL\}/filter?key\=username&value\=</span>{email}`).pipe(
      map(response => response.users[0]), //obtiene el primer usuario que coincida
      tap(user => {
        if (user) {
          const simulatedUser: User = {
            ...user,
            roles: user.id === 1 ? ['admin', 'user'] : ['user'], //usuario con id 1, es el admin
            tenantId: user.id % 2 === 0 ? 1 : 2, //alternad tenantdId para simular
          };
          const simulatedToken = `fake-jwt-token-<span class="math-inline">\{user\.id\}\-</span>{Date.now()}`;

          this.store.dispatch(new SetUser(simulatedUser, simulatedToken))
          return { token: simulatedToken, user: simulatedUser }
        } else {
          throw new Error('Credenciales inválidas')
        }
      }),
      catchError(error => {
        console.error('Login failed: ', error);
        return throwError(() => new Error('Error al iniciar sesión: ' + error.message));
      })
    );
  }

  //Recuperación de contraseña
  forgotPassword(email: string): Observable<any> {
    //se simula una respuesta
    console.log(`Simulando una recuperación de contraseña ${email}`);
    this.store.dispatch(new ForgotPassword(email)); //dipara la acción de recuperacion
    return of({ success: true, message: `Instrucciones enviadas al ${email}` }).pipe(
      tap(() => console.log('Simulación exitosa')),
      catchError(error => {
        console.error('Simulación fallida: ', error);
        return throwError(() => new Error('Error en la recuperación de contraseña'));
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
