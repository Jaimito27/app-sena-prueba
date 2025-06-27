import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';

import { Store } from '@ngxs/store';
import { AuthState, Logout } from '../../state/auth.state';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
  isDarkTheme = false;
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

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      document.documentElement.setAttribute('data-theme', saved || 'light');
      this.isDarkTheme = (saved || 'light') === 'dark';
    }


  }
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/login'])
  }


  toggleTheme() {
      if (isPlatformBrowser(this.platformId)) {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.isDarkTheme = newTheme === 'dark';
    }
  }


}
