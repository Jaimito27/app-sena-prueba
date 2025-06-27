import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ClearAuthError, Register as RegisterAction } from '../../state/auth.state';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService)
  private store = inject(Store);
  private router = inject(Router);

  isLoading$: Observable<boolean> = this.store.select(state => state.auth.isLoading);
  errorMessage$: Observable<string | null> = this.store.select(state => state.auth.error);
  successMessage: string | null = null; //para mensaje de exito del registro

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['male', Validators.required], // puedes poner 'male' o 'female' por defecto
      image: ['https://robohash.org/temp.png?set=set4', Validators.required]
    });

    //limpiar mensaje de error/exito al cmabiar de formulario
    this.registerForm.valueChanges.subscribe(() => {
      this.successMessage = null;
      this.store.dispatch(new ClearAuthError());
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.store.dispatch(new RegisterAction({ isLoading: true, error: null }));


      const userDetails = this.registerForm.value

      this.authService.register(userDetails).subscribe({
        next: (res) => {
          this.successMessage = 'Registro exitoso. ¡Puedes inciar sesión!';
          console.log('Registro exitoso', res);
          this.store.dispatch(new RegisterAction({isLoading: false, error: null}))
          this.router.navigate(['/auth/login'])
        }, error: (err) => {
          this.successMessage = null;
          this.store.dispatch(new RegisterAction({ error: err.message || 'Error desconocido al registar', isLoading: false })) //actualiza el estado con el error
          console.error('Error en el registro del componente:', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
