import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { ProvablyFairService } from "./provably-fair.service";
import { ProvablyFairController } from "./provably-fair.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProvablyFairController],
  providers: [ProvablyFairService]
})
export class ProvablyFairModule {}
