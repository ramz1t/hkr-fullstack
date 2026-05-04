import { UserRole } from "./user-role.enum";

export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
};
