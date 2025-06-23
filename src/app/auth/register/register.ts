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
      username: ['', Validators.required], //campo de userame de la API
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
      const { username, email, password } = this.registerForm.value;

      const userDetails = {
        firstName: username.split('.')[0] || username, // Simular un nombre
        lastName: username.split('.')[1] || 'Doe',    // Simular un apellido
        username: username, // Esto es clave para la búsqueda posterior en login
        email: email,       // Esto es para mostrar coherencia, DummyJSON no lo usa para login
        password: password, // DummyJSON no procesa contraseñas en /add
        gender: 'male', // Por defecto, se puede hacer un selector en la UI
        image: 'https://robohash.org/temp.png?set=set4'
      };

      this.authService.register(userDetails).subscribe({
        next: (res) => {
          this.successMessage = 'Registro exitoso. ¡Puedes inciar sesión!';
          console.log('Registro exitoso', res);
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
