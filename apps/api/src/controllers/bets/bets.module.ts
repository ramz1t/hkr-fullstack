import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { WalletsModule } from "../wallets/wallets.module";
import { BetsService } from "./bets.service";
import { BetsController } from "./bets.controller";

@Module({
  imports: [DatabaseModule, WalletsModule],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService]
})
export class BetsModule {}
