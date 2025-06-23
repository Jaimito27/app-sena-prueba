import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { RegisterComponent } from "./register/register";
import { ForgotPassword } from "./forgot-password/forgot-password";

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: '', redirectTo: 'login', pathMatch: 'full' } // redirige por defecto
]
