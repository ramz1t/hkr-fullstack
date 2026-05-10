import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { DatabaseService } from "../../common/database/database.service";
import { UsersService } from "../users/users.service";
import type { LoginDto, RegisterDto, JwtPayload, Tokens } from "@repo/types";
import { UserRole } from "@repo/types";
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
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user?.isBanned) {
      throw new ForbiddenException("Account is banned");
    }

    const passwordHash = await this.usersService.getPasswordHash(user.id);

    if (!passwordHash || !(await bcrypt.compare(dto.password, passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const serverSeed = crypto.randomBytes(32).toString("hex");
    const serverSeedHash = crypto
      .createHash("sha256")
      .update(serverSeed)
      .digest("hex");
    const clientSeed = crypto.randomBytes(16).toString("hex");

    const user = await this.db.client.user.create({
      data: {
        email: dto.email,
        passwordHash,
        provablyFair: {
          create: {
            clientSeed,
            serverSeed,
            serverSeedHash
          }
        }
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
      throw new UnauthorizedException("Invalid session");
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(payload.refreshToken)
      .digest("hex");

    if (incomingHash !== session.refreshTokenHash) {
      await this.db.client.session.deleteMany({
        where: { userId: session.userId }
      });

      throw new UnauthorizedException("Invalid session");
    }

    const user = await this.db.client.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, role: true, isBanned: true }
    });

    if (!user || user.isBanned) {
      throw new ForbiddenException("Account is banned");
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
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
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
      secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: accessTtl
    });

    return {
      accessToken,
      refreshToken
    };
  }
}
