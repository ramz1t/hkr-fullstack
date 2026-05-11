import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { UserDto, UserRole } from "@repo/types";

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.db.client.user.findUnique({ where: { id } });

    return user
      ? {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          isBanned: user.isBanned
        }
      : null;
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await this.db.client.user.findUnique({ where: { email } });

    return user
      ? {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          isBanned: user.isBanned
        }
      : null;
  }

  async getPasswordHash(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    return user?.passwordHash;
  }
}
