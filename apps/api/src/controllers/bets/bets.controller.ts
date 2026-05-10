import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { BetsService } from "./bets.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";
import { PlaceCoinFlipBetRequestDto } from "./dto";

@Controller()
@UseGuards(JwtAccessTokenGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post("games/coinflip/bet")
  @ApiBody({ type: PlaceCoinFlipBetRequestDto })
  async placeCoinFlipBet(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PlaceCoinFlipBetRequestDto
  ) {
    return this.betsService.placeCoinFlipBet(user.sub, dto.wager, dto.side);
  }

  @Get("bets/:id/verify")
  async verifyBet(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.betsService.verifyBet(user.sub, id);
  }
}
