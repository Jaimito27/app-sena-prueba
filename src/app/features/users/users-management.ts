import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { UserService } from '../../core/services/user.service';
import { FetchUsers, SelectUser, UserState } from '../../state/user.state';
import { User } from '../../shared/models/user.interface';
import { Observable, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.scss'
})
export class Users implements OnInit {

  private store = inject(Store);
  private userService = inject(UserService); //inyecta el servicio de usuaros

  allUsers$!: Observable<User[]>;
  isLoading$!: Observable<boolean>;
  usersError$!: Observable<string | null>;
  selectedUser$!: Observable<User | null>;
  private destroy$ = new Subject<void>();
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedTenantId: string | null = null;

  ngOnInit(): void {

    //asignando los observables a los selectores directamente
    this.allUsers$ = this.store.select(UserState.allUsers);
    this.isLoading$ = this.store.select(UserState.isLoading);
    this.usersError$ = this.store.select(UserState.usersError);
    this.selectedUser$ = this.store.select(UserState.selectedUser);

    console.log('Value of this.allUsers$ (after assignment):', this.allUsers$);


     this.userService.getUsers().subscribe({
      next: () =>{      
      }, error: (error) => {
        console.log(error);
      }
     });
    //disparar la carga inicial de usuarios

    this.store.dispatch(new FetchUsers());
    //subscribirse a los cambios en allUsers$ para aplicar el filtro
    this.allUsers$.pipe(takeUntil(this.destroy$)).subscribe(users => {
      this.users = users;
      this.applyFilter();

    })

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      console.log(loading);
    })

     this.usersError$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        console.error('7. Users Component: usersError$ updated:', error);
        // Aquí podrías mostrar una notificación toast o similar
      }
    });

    this.selectedUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      console.log('8. Users Component: selectedUser$ updated:', user);
    });
  }

  applyFilter(): void {
    if (this.selectedTenantId === null || this.selectedTenantId ==='Todos los Tenants') {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => user.tenantId === this.selectedTenantId);
    }
  }

  filterUsers(): void {
    // Al hacer clic en el botón, fuerza la reevaluación del filtro
    // La suscripción en ngOnInit ya maneja esto, pero esto es más explícito para el botón

    this.applyFilter()
  }

  viewDetails(user: User): void {
    this.store.dispatch(new SelectUser(user));
  }

  closeDetails(): void {
    this.store.dispatch(new SelectUser(null));
  }

  //metodos para crud
  onEditUser(user: User): void {
    console.log('Simulando edición de usuarios', user);
    this.userService.simulatedUpdateUser(user);
  }

  onDeleteUser(userId: number): void {
    if (confirm('¿Estas seguro de que quieres eliminar este usuario?')) {
      console.log('Simulnando eliminación de usuario con ID: ', userId);
      this.userService.simulatedDeleteUser(userId)
    }
  }

}
