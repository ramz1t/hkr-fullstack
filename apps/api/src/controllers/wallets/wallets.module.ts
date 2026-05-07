import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { WalletsService } from "./wallets.service";
import { WalletsController } from "./wallets.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService]
})
export class WalletsModule {}
