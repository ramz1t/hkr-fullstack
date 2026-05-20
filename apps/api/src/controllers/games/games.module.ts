import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService]
})
export class GamesModule {}
