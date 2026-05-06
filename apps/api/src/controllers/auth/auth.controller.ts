import { Controller, Post, Body, Res, UseGuards, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBody } from "@nestjs/swagger";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import type { Tokens } from "@repo/types";
import { JwtRefreshTokenGuard } from "../../common/guards";
import type { RequestWithUser } from "../../common/types";
import { LoginRequestDto, RegisterRequestDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("login")
  @ApiBody({ type: LoginRequestDto })
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.login(dto);

    this.setTokens(res, tokens);

    return tokens;
  }

  @Post("register")
  @ApiBody({ type: RegisterRequestDto })
  async register(
    @Body() dto: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.register(dto);

    this.setTokens(res, tokens);

    return tokens;
  }

  @Post("refresh")
  @UseGuards(JwtRefreshTokenGuard)
  async refresh(
    @Req() req: RequestWithUser<"refreshToken">,
    @Res({ passthrough: true }) res: Response
  ) {
    const payload = req.user;

    const tokens = await this.authService.refresh(payload);

    this.setTokens(res, tokens);

    return tokens;
  }

  @Post("logout")
  @UseGuards(JwtRefreshTokenGuard)
  async logout(
    @Req() req: RequestWithUser<"refreshToken">,
    @Res({ passthrough: true }) res: Response
  ) {
    const payload = req.user;

    await this.authService.logout(payload.sessionId);

    this.clearTokens(res);
  }

  private setTokens(res: Response, tokens: Tokens) {
    const accessTtlMs =
      this.configService.getOrThrow<number>("JWT_ACCESS_TTL", {
        infer: true
      }) * 1000;
    const refreshTtlMs =
      this.configService.getOrThrow<number>("JWT_REFRESH_TTL", {
        infer: true
      }) * 1000;

    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: accessTtlMs,
      path: "/"
    });

    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: refreshTtlMs,
      path: "/auth"
    });
  }

  private clearTokens(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/auth" });
  }
}
