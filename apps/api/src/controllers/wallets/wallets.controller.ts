import { Controller, Get, Post, Query, Body, UseGuards } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAccessTokenGuard } from "../../common/guards";
import { CurrentUser } from "../../common/decorators";
import type { JwtPayload } from "@repo/types";
import {
  GetPaginatedTransactionsDto,
  MakePaymentDto,
  PaymentAction
} from "./dto";
import { ApiBody } from "@nestjs/swagger";

@Controller("wallet")
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

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
    return this.walletsService.findTransactionsByUserId(
      user.sub,
      query.page,
      query.pageSize
    );
  }

  @Get("me/balance")
  @UseGuards(JwtAccessTokenGuard)
  async meBalance(@CurrentUser() user: JwtPayload) {
    return this.walletsService.getBalance(user.sub);
  }

  @Post("me/payment")
  @ApiBody({ type: MakePaymentDto })
  @UseGuards(JwtAccessTokenGuard)
  async makePayment(
    @CurrentUser() user: JwtPayload,
    @Body() body: MakePaymentDto
  ) {
    switch (body.action) {
      case PaymentAction.DEPOSIT:
        return await this.walletsService.makeDeposit(user.sub, body.amount);
      case PaymentAction.WITHDRAWAL:
        return await this.walletsService.makeWithdrawal(user.sub, body.amount);
    }
  }
}
