import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ClearAuthError, ForgotPassword as ForgotPasswordAction} from '../../state/auth.state';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  forgotPasswordForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);

  isLoading$: Observable<boolean> = this.store.select(state => state.auth.isLoading);
  errorMessage$: Observable<string | null> = this.store.select(state => state.auth.error);
  successMessage: string | null = null; // Para mensajes de éxito

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    //limpiar el mensaje al cambiar de formulario
    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.successMessage = null;
      this.store.dispatch(new ClearAuthError());
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.store.dispatch(new ForgotPasswordAction(this.forgotPasswordForm.value.email)); //simula el estado de carga
      const { email } = this.forgotPasswordForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Instrucciones de recuperación enviadas a tu correo.';
          alert(`Recuperación de contraseña simulada ${res.message}`)
          this.router.navigate(['/auth/login'])
        }, error: (err) => {
          this.successMessage = null;
          this.store.dispatch(new ForgotPasswordAction({ error: err.message || 'Error desconocido al enviar instrucciones', isLoading: false })); //Actualiza el estado con el error
          console.error('Error en recuperación de contraseña del componente: ', err)
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }


}
