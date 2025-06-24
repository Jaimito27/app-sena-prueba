import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store, UpdateState } from '@ngxs/store';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../../shared/models/user.interface';
import { FetchUsers, FetchUsersSuccess, FetchUsersFailure, AddUser, DeleteUser } from '../../state/user.state';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private store = inject(Store);
  private API_URL = 'https://dummyjson.com/users';
  constructor() { }

  //obtener usuario
  getUsers(): Observable<{ users: User[] }> {
    this.store.dispatch(new FetchUsers()); //dispara accion de inicio de carga
    return this.http.get<{ users: User[] }>(this.API_URL).pipe(
      tap(res => {
        //asignar roles y tenandId simulados al traer la data
        const usersWithSimulatedData: User[] = res.users.map(user => ({
          ...user,
          roles: user.id === 1 ? ['admin', 'user'] : ['user'],
          tenantId: (user.id % 2 === 0) ? 'tenant2' : 'tenant1', // Si ID es par, Tenant 2. Si es impar, Tenant 1.
        }));
        this.store.dispatch(new FetchUsersSuccess(usersWithSimulatedData)); //dispara acción de exito
      }),
      catchError(error => {
        const errorMessage = 'Error al cargar usuarios: ' + (error.message || 'Error desconocido');
        this.store.dispatch(new FetchUsersFailure(errorMessage)); //Dispara acción de fallo
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  //estos metodos simular el resto del crud pero no ejecutan nada mas que disprar acciones y axctualizar el estado local

  simulatedAddUser(user: User): void {
    this.store.dispatch(new AddUser(user));
  }

  simulatedUpdateUser(user: User): void {
    this.store.dispatch(new UpdateState(user));
  }

  simulatedDeleteUser(userId: number): void {
    this.store.dispatch(new DeleteUser(userId))
  }
}
