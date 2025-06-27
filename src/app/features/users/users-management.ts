import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { UserService } from '../../core/services/user.service';
import { FetchUsers, SelectUser, UserState } from '../../state/user.state';
import { User } from '../../shared/models/user.interface';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { AuthState } from '../../state/auth.state';
import { UserForm } from './user-form/user-form';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserForm],
  templateUrl: './users-management.html',
  styleUrl: './users-management.scss'
})
export class Users implements OnInit, OnDestroy {

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
  currentTenantId: string | null = null;
  isAdmin = false;



  ngOnInit(): void {


    this.store.select(AuthState.userTenantId).pipe(takeUntil(this.destroy$)).subscribe(tenantId => {
      this.currentTenantId = tenantId;
      this.applyFilter();
    })

    this.store.select(AuthState.isAdmin).pipe(takeUntil(this.destroy$)).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.applyFilter();
    })

    //asignando los observables a los selectores directamente
    this.allUsers$ = this.store.select(UserState.allUsers);
    this.isLoading$ = this.store.select(UserState.isLoading);
    this.usersError$ = this.store.select(UserState.usersError);
    this.selectedUser$ = this.store.select(UserState.selectedUser);

    console.log('Value of this.allUsers$ (after assignment):', this.allUsers$);


    this.userService.getUsers().subscribe({
      next: () => {
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
    if (this.isAdmin) {
      //el admin puede ver todos los tenant
      if (this.selectedTenantId === null || this.selectedTenantId === 'Todos los Tenants') {
        this.filteredUsers = [...this.users];
      } else {
        this.filteredUsers = this.users.filter(user => user.tenantId === this.selectedTenantId);
      }
    } else if (this.currentTenantId) {
      //usuario normal solo ver su tenant
      this.filteredUsers = this.users.filter(user => user.tenantId === this.currentTenantId);
    } else {
      this.filteredUsers = [];
    }
  }


  viewDetails(user: User): void {
    this.store.dispatch(new SelectUser(user));
  }

  closeDetails(): void {
    this.store.dispatch(new SelectUser(null));
  }
  //editar y agregar
  isEditModalActive: boolean = false;
  currentUserForm: User = this.resetUserForm(); //objeto para el formulario
  isEditMode: boolean = false

  private resetUserForm(): User {
    return {
      id: 0,
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      gender: '',
      image: '',
      roles: ['user'],
      tenantId: 'tenant1',
    };
  }

  openAddUserModal(): void {
    this.isEditMode = false;
    this.currentUserForm = this.resetUserForm();
    this.isEditModalActive = true;
  }

  //metodos para crud
  onEditUser(user: User): void {
    this.isEditMode = true;
    this.currentUserForm = { ...user };
    this.isEditModalActive = true;
    console.log('Simulando edición de usuarios', user);
  }

  closeEditModal(): void {
    this.isEditModalActive = false;
    this.currentUserForm = this.resetUserForm(); //limpia el formulario al cerrar

  }
  onDeleteUser(userId: number): void {
    if (confirm('¿Estas seguro de que quieres eliminar este usuario?')) {
      console.log('Simulnando eliminación de usuario con ID: ', userId);
      this.userService.simulatedDeleteUser(userId)
    }
  }

  saveUser(user: User): void {
    if (this.isEditMode) {
      //llama al método de actualización simulado del servicio
      this.userService.simulatedUpdateUser(user);
      console.log('Users Component: Attempting to update user:', user);
    } else {
      //llama al metodo de adición
      this.userService.simulatedAddUser(user);
      console.log('Users Component: Attempting to add new user:', user);
    }
    this.closeEditModal(); //cierra el modal luego de guardar
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete()
  }
}
