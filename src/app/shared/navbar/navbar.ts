import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, Logout } from '../../state/auth.state';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {

  private store = inject(Store);
  private router = inject(Router)
  //selectores para obtener el estado de autenticación y el rol de admin

  navbarOpen = false;

  userMenuOpen = false;
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  isAuthenticated$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  isUser$!: Observable<boolean>;
  currentUser$!: Observable<User | null>

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
    this.isAdmin$ = this.store.select(AuthState.isAdmin);
    this.isUser$ = this.store.select(AuthState.isUser);
    this.currentUser$ = this.store.select(AuthState.currentUser);

    const saved = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', saved || 'light');
  }
  constructor() { }

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/login'])
  }


  toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
    localStorage.setItem('theme', theme === 'dark' ? 'light' : 'dark');
  }


}
