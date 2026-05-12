import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAccessTokenGuard, JwtRefreshTokenGuard } from "../../common/guards";
import type { RequestWithUser } from "../../common/types";
import { LoginRequestDto, RegisterRequestDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiBody({ type: LoginRequestDto })
  async login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Post("register")
  @ApiBody({ type: RegisterRequestDto })
  async register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Post("refresh")
  @UseGuards(JwtRefreshTokenGuard)
  async refresh(@Req() req: RequestWithUser<"refreshToken">) {
    return this.authService.refresh(req.user);
  }

  @Post("logout")
  @UseGuards(JwtAccessTokenGuard)
  async logout(@Req() req: RequestWithUser<"accessToken">) {
    await this.authService.logout(req.user.sessionId);
  }
}
