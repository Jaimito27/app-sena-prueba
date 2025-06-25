import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
export class Navbar implements OnInit {
  private store = inject(Store);
  //selectores para obtener el estado de autenticación y el rol de admin



  isAuthenticated$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  isUser$!: Observable<boolean>;

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
    this.isAdmin$ = this.store.select(AuthState.isAdmin);
    this.isUser$ = this.store.select(AuthState.isUser)
  }
  constructor() { }

  onLogout(): void {
    this.store.dispatch(new Logout());
  }
}
