import { UserRole } from "../../dto";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
};

