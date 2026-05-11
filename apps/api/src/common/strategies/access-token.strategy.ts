import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import type { JwtPayload } from "@repo/types";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.access_token || null,
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      passReqToCallback: true
    });
  }

  validate(req: Request, payload: JwtPayload) {
    return payload;
  }
}
