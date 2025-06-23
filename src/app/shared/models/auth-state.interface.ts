import { User } from "./user.interface";

export interface AuthStateModel {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
