import { Controller, Get, UseGuards } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";

@Controller("wallet")
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) { }

  @Get("me")
  @UseGuards(JwtAccessTokenGuard)
  async me(@CurrentUser() user: JwtPayload) {
    return this.walletsService.findByUserId(user.sub);
  }
}
