import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import {
  AccessTokenStrategy,
  RefreshTokenStrategy
} from "../../common/strategies";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [JwtModule, UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService]
})
export class AuthModule {}
