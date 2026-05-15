import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
  ParseUUIDPipe
} from "@nestjs/common";
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
  async login(
    @Body() dto: LoginRequestDto,
    @Headers("user-agent") userAgent?: string
  ) {
    return this.authService.login(dto, userAgent);
  }

  @Post("register")
  @ApiBody({ type: RegisterRequestDto })
  async register(
    @Body() dto: RegisterRequestDto,
    @Headers("user-agent") userAgent?: string
  ) {
    return this.authService.register(dto, userAgent);
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

  @Get("sessions")
  @UseGuards(JwtAccessTokenGuard)
  async getSessions(@Req() req: RequestWithUser<"accessToken">) {
    return this.authService.getSessions(req.user.sub);
  }

  @Delete("sessions/:sessionId")
  @UseGuards(JwtAccessTokenGuard)
  async revokeSession(
    @Req() req: RequestWithUser<"accessToken">,
    @Param("sessionId", ParseUUIDPipe) sessionId: string
  ) {
    await this.authService.revokeSession(req.user.sub, sessionId);
  }
}
