import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { ProvablyFairService } from "./provably-fair.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";
import { SeedRequestDto } from "./dto";

@Controller("provably-fair")
@UseGuards(JwtAccessTokenGuard)
export class ProvablyFairController {
  constructor(private readonly provablyFairService: ProvablyFairService) {}

  @Get()
  async getCurrent(@CurrentUser() user: JwtPayload) {
    return this.provablyFairService.getCurrent(user.sub);
  }

  @Post("seed")
  @ApiBody({ type: SeedRequestDto })
  async seed(@CurrentUser() user: JwtPayload, @Body() dto: SeedRequestDto) {
    return this.provablyFairService.seed(user.sub, dto.clientSeed);
  }

  @Post("reveal")
  async reveal(@CurrentUser() user: JwtPayload) {
    return this.provablyFairService.reveal(user.sub);
  }
}
