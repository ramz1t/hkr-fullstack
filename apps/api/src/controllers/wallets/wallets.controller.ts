import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";
import { ApiQuery } from "@nestjs/swagger";
import { GetPaginatedTransactionsDto } from "./dto";

@Controller("wallet")
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) { }

  @Get("me")
  @UseGuards(JwtAccessTokenGuard)
  async me(@CurrentUser() user: JwtPayload) {
    return this.walletsService.findByUserId(user.sub);
  }

  @Get("me/transactions")
  @UseGuards(JwtAccessTokenGuard)
  async meTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetPaginatedTransactionsDto
  ) {
    return this.walletsService.findTransactionsByUserId(user.sub, query.page, query.pageSize);
  }
}
