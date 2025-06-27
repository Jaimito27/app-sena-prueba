import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '../../state/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute)

  isLoading$: Observable<boolean> = this.store.select(state => state.auth.isLoading);
  errorMessage$: Observable<string | null> = this.store.select(state => state.auth.error);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // Suscribirse al estado de autenticación para redirigir tras un login exitoso
    this.store.select(AuthState.isAuthenticated).pipe().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          //el dispatch de setUser ya se hace en el auth service
          
          this.router.navigate(['/dashboard'])
        }, error: (err) => {
          console.error('Error en el login componente: ', err)
        }
      })
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  sessionExpiredMsg: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'expired') {
        this.sessionExpiredMsg = 'Tu sesión ha expirado. Por favor incia sesión nuevamente';
      } else {
        this.sessionExpiredMsg = null;
      }
    });
  }
}
