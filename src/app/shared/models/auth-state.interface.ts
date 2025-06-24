import { User } from "./user.interface";

export interface AuthStateModel {
  token: string | null;
  user: User | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
