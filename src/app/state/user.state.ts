//definición del estado por defecto

import { Injectable } from "@angular/core";
import { UserStateModel } from "../shared/models/user-state.interface";
import { User } from "../shared/models/user.interface";
import { Action, Selector, State, StateContext } from "@ngxs/store";

const initialState: UserStateModel = {
  users: [],
  isLoading: false,
  error: null,
  selectedUser: null,
}

//definición de las acciones
export class FetchUsers {
  static readonly type = '[Users] Fetch Users';
}

export class FetchUsersSuccess {
  static readonly type = '[Users] Fetch Users Success';
  constructor(public users: User[]) { }
}

export class FetchUsersFailture {
  static readonly type = '[Users] Fetch Users Failure';
  constructor(public error: string) { }
}

export class SelectUser {
  static readonly type = '[Users] Select User';
  constructor(public user: User | null) { }
}

//opciones para simular un crud

export class AddUser {
  static readonly type = '[Users] Add User';
  constructor(public user: User) { }
}

export class UpdateUser {
  static readonly type = '[Users] Update User';
  constructor(public user: User) { }
}

export class DeleteUser {
  static readonly type = '[Users] Delete User';
  constructor(public userId: number) { }
}

//definir el estado
@State<UserStateModel>({
  name: 'users',
  defaults: initialState,
})
@Injectable()
export class UserState {
  //selectores

  @Selector()
  static allUsers(state: UserStateModel): User[] {
    return state.users;
  }

  @Selector()
  static isLoading(state: UserStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static usersError(state: UserStateModel): string | null {
    return state.error;
  }

  @Selector()
  static selectedUser(state: UserStateModel): User | null {
    return state.selectedUser;
  }

  //manejadores de acciones

  @Action(FetchUsers)
  fetchUsers(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ isLoading: true, error: null });
  }

  @Action(FetchUsersSuccess)
  fetchUsersSuccess(ctx: StateContext<UserStateModel>, action: FetchUsersSuccess) {
    ctx.patchState({
      users: action.users,
      isLoading: false,
      error: null,
    });
  }

  @Action(FetchUsersFailture)
  fetchUsersFailture(ctx: StateContext<UserStateModel>, action: FetchUsersFailture) {
    ctx.patchState({
      isLoading: false,
      error: action.error,
    });
  }

  @Action(SelectUser)
  selectUser(ctx: StateContext<UserStateModel>, action: SelectUser) {
    ctx.patchState({
      selectedUser: action.user
    })
  }
  //manejadores del crud
  @Action(AddUser)
  addUser(ctx: StateContext<UserStateModel>, action: AddUser) {
    const state = ctx.getState();
    ctx.patchState({
      users: [...state.users, { ...action.user, id: state.users.length > 0 ? Math.max(...state.users.map(u => u.id)) + 1 : 1 }]
    });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<UserStateModel>, action: UpdateUser) {
    const state = ctx.getState();
    const updatedUsers = state.users.map(user =>
      user.id === action.user.id ? { ...action.user } : user
    );
    ctx.patchState({ users: updatedUsers, selectedUser: action.user });// Actualiza el seleccionado si es el mismo
  }

  @Action(DeleteUser)
  deleteUser(ctx: StateContext<UserStateModel>, action: DeleteUser) {
    const state = ctx.getState();
    const filteredUsers = state.users.filter(user => user.id !== action.userId);
    ctx.patchState({ users: filteredUsers, selectedUser: null });

  }

}
