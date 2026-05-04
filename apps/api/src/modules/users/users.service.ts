import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { UserRole } from "@repo/types";

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string) {
    const user = await this.db.client.user.findUnique({ where: { id } });

    return user
      ? {
          id: user.id,
          email: user.email,
          role: user.role as UserRole
        }
      : null;
  }

  async findByEmail(email: string) {
    const user = await this.db.client.user.findUnique({ where: { email } });

    return user
      ? { id: user.id, email: user.email, role: user.role as UserRole }
      : null;
  }

  async getPasswordHash(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    return user?.passwordHash;
  }

  async getRefreshTokenHash(sessionId: string) {
    const session = await this.db.client.session.findUnique({
      where: { id: sessionId },
      select: { refreshTokenHash: true }
    });

    return session?.refreshTokenHash ?? null;
  }
}
