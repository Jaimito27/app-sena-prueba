import { Action, Selector, State, StateContext } from "@ngxs/store";
import { AuthStateModel } from '../shared/models/auth-state.interface';
import { Injectable } from "@angular/core";
import { User } from "../shared/models/user.interface";


//estado por defecto
const initialState: AuthStateModel = {
  token: null,
  user: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public email: string, public password: string) { }
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class SetUser {
  static readonly type = '[Auth] Set User';
  constructor(public user: User, public token: string, public expiresAt: number) { }
}

export class ClearAuthError {
  static readonly type = '[Auth] Clear Auth Error';
}

export class Register {
  static readonly type = '[Auth] Register'
  constructor(public payload?: { isLoading?: boolean, error?: string | null }) { }
}

export class ForgotPassword {
  static readonly type = '[Auth] Forgot Password';
  constructor(public payload?: { email?: string; isLoading?: boolean, error?: string | null }) { }
}


//definir los estados
@State<AuthStateModel>({
  name: 'auth', //nombre unico para este estado
  defaults: initialState
})
@Injectable()
export class AuthState {

  //con los selectores para acceder con facilidad a partes del estado

  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static expiresAt(state: AuthStateModel): number | null {
    return state.expiresAt;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    if (!state.token || !state.user) return false;
    if (!state.expiresAt) return false;
    return state.expiresAt > Date.now()
  }

  @Selector()
  static currentUser(state: AuthStateModel): User | null {
    return state.user
  }

  @Selector()
  static isAdmin(state: AuthStateModel): boolean {
    return state.user?.roles?.includes('admin') || false;
  }

  @Selector()
  static isUser(state: AuthStateModel): boolean {
    return state.user?.roles?.includes('user') || false;
  }

  @Selector()
  static userTenantId(state: AuthStateModel): string | null {
    return state.user?.tenantId || null;
  }

  //majeadores de acciones
  //la logivca de autenticacion estará en el service, aca solo se manejan los estados

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ isLoading: true, error: null });

    //irian metodos de auth service pero ante la simulación se envia un exito o fallo
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({
      isLoading: action.payload?.isLoading ?? false,
      error: action.payload?.error ?? null
    });
    // Si no hay payload, esto solo limpia el estado de error/carga
  }

  @Action(ForgotPassword)
  forgotPassword(ctx: StateContext<AuthStateModel>, action: ForgotPassword) {
    ctx.patchState({
      isLoading: action.payload?.isLoading ?? false,
      error: action.payload?.error ?? null
    })
  }

  @Action(SetUser)
  setUser(ctx: StateContext<AuthStateModel>, action: SetUser) {
    ctx.patchState({
      token: action.token,
      user: action.user,
      expiresAt: action.expiresAt,
      isAuthenticated: true,
      isLoading: false,
      error: null
    })
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState(initialState); //resetea el estado a su valor inicial
    //limipiar el almacenamiento persistente
    localStorage.removeItem('auth.token');
    localStorage.removeItem('auth.user')
  }

  @Action(ClearAuthError)
  clearAuthError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }
}
