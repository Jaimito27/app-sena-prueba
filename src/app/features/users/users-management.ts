import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { UserService } from '../../core/services/user.service';
import { SelectUser, UserState } from '../../state/user.state';
import { User } from '../../shared/models/user.interface';
import { Observable, take } from 'rxjs';

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

  @Select(UserState.allUsers) allUsers$!: Observable<User[]>;
  @Select(UserState.isLoading) isLoading$!: Observable<boolean>;
  @Select(UserState.usersError) usersError$!: Observable<string | null>;
  @Select(UserState.selectedUser) selectedUser$!: Observable<User | null>;

  filteredUsers: User[] = [];
  selectedTenantId: number = 0; //0 para todos los tenants

  ngOnInit(): void {
    this.userService.getUsers().subscribe(); //inicia la craga de usuarios

    //suscribirse a los cambos en allUsers$ y selectedTenantId para aplicar el filtro
    this.allUsers$.subscribe(users => {
      this.applyFilter(users)
    });
  }

  private applyFilter(users: User[]): void {
    if (this.selectedTenantId === 0) {
      this.filteredUsers = users;
    } else {
      this.filteredUsers = users.filter(user => user.tenantId === this.selectedTenantId);
    }
  }

  filterUsers(): void {
    // Al hacer clic en el botón, fuerza la reevaluación del filtro
    // La suscripción en ngOnInit ya maneja esto, pero esto es más explícito para el botón

    this.allUsers$.pipe(take(1)).subscribe(users => this.applyFilter(users));
  }

  viewDetails(user: User): void {
    this.store.dispatch(new SelectUser(user));
  }

  closeDetails(): void {
    this.store.dispatch(new SelectUser(null));
  }

  //metodos para crud
  editUser(user: User): void {
    console.log('Simulando edición de usuarios', user);
    this.userService.simulatedUpdateUser(user);
  }

  deleteUser(userId: number): void {
    if (confirm('¿Estas seguro de que quieres eliminar este usuario?')) {
      console.log('Simulnando eliminación de usuario con ID: ', userId);
      this.userService.simulatedDeleteUser(userId)
    }
  }

}
