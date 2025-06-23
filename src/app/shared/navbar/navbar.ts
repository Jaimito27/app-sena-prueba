import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, Logout } from '../../state/auth.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private store = inject(Store);
  //selectores para obtener el estado de autenticación y el rol de admin


  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.isAdmin) isAdmin$!: Observable<boolean>;

constructor(){}

onLogout(): void {
  this.store.dispatch(new Logout());
}
}
