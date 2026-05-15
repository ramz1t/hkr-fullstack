import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { UserDto, UserRole } from "@repo/types";

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) { }

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

  async getAll(): Promise<UserDto[]> {
    const users = await this.db.client.user.findMany();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isBanned: user.isBanned
    }));
  }

  async banUser(userId: string): Promise<void> {
    await this.db.client.user.update({
      where: { id: userId },
      data: { isBanned: true }
    });
  }

  async unbanUser(userId: string): Promise<void> {
    await this.db.client.user.update({
      where: { id: userId },
      data: { isBanned: false }
    });
  }

  async getPasswordHash(userId: string) {
    const user = await this.db.client.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    return user?.passwordHash;
  }
}
