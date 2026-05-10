import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { BetsService } from "./bets.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";
import { PlaceCoinflipBetDto } from "./dto";

@Controller()
@UseGuards(JwtAccessTokenGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post("games/coinflip/bet")
  @ApiBody({ type: PlaceCoinflipBetDto })
  async placeCoinFlipBet(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PlaceCoinflipBetDto
  ) {
    return this.betsService.placeCoinFlipBet(user.sub, dto.wager, dto.side);
  }

  @Get("bets/:id")
  async getBet(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.betsService.getBet(user.sub, id);
  }
}
