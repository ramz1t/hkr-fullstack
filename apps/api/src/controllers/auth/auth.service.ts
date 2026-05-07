import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { DatabaseService } from "../../common/database/database.service";
import { UsersService } from "../users/users.service";
import type { LoginDto, RegisterDto, JwtPayload, Tokens } from "@repo/types";
import { API_ERRORS, UserRole } from "@repo/types";
import crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
  private SALT_ROUNDS = 12;

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw API_ERRORS.AUTH_INVALID_CREDENTIALS;
    }

    if (user?.isBanned) {
      throw API_ERRORS.AUTH_ACCOUNT_BANNED;
    }

    const passwordHash = await this.usersService.getPasswordHash(user.id);

    if (!passwordHash || !(await bcrypt.compare(dto.password, passwordHash))) {
      throw API_ERRORS.AUTH_INVALID_CREDENTIALS;
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw API_ERRORS.AUTH_EMAIL_ALREADY_REGISTERED;
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.db.client.user.create({
      data: {
        email: dto.email,
        passwordHash
      }
    });

    return await this.generateTokens(
      user.id,
      user.email,
      user.role as UserRole
    );
  }

  async refresh(payload: JwtPayload & Pick<Tokens, "refreshToken">) {
    const session = await this.db.client.session.findUnique({
      where: { id: payload.sessionId }
    });

    if (!session || session.userId !== payload.sub) {
      throw API_ERRORS.AUTH_INVALID_SESSION;
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(payload.refreshToken)
      .digest("hex");

    if (incomingHash !== session.refreshTokenHash) {
      await this.db.client.session.deleteMany({
        where: { userId: session.userId }
      });

      throw API_ERRORS.AUTH_INVALID_SESSION;
    }

    const user = await this.db.client.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, role: true, isBanned: true }
    });

    if (!user || user.isBanned) {
      throw API_ERRORS.AUTH_ACCOUNT_BANNED;
    }

    return this.generateTokens(
      user.id,
      user.email,
      user.role as UserRole,
      session.id
    );
  }

  async logout(sessionId: string) {
    await this.db.client.session.delete({
      where: { id: sessionId }
    });
  }

  async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    previousSessionId?: string
  ) {
    const accessTtl = +this.configService.getOrThrow<number>("JWT_ACCESS_TTL", {
      infer: true
    });
    const refreshTtl = +this.configService.getOrThrow<number>(
      "JWT_REFRESH_TTL",
      { infer: true }
    );
    const newSessionId = crypto.randomUUID();

    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      sessionId: newSessionId
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET", {
        infer: true
      }),
      expiresIn: refreshTtl
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    if (previousSessionId) {
      await this.db.client.session.deleteMany({
        where: { id: previousSessionId }
      });
    }

    await this.db.client.session.create({
      data: {
        id: newSessionId,
        userId,
        refreshTokenHash
      }
    });

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET", {
        infer: true
      }),
      expiresIn: accessTtl
    });

    return {
      accessToken,
      refreshToken
    };
  }
}
