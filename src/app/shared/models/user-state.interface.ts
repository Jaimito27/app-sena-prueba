import { User } from "./user.interface";

export interface UserStateModel {
  users: User[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
}
