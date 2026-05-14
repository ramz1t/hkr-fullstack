import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./common/database/database.module";
import { AuthModule } from "./controllers/auth/auth.module";
import { UsersModule } from "./controllers/users/users.module";
import { WalletsModule } from "./controllers/wallets/wallets.module";
import { ProvablyFairModule } from "./controllers/provably-fair/provably-fair.module";
import { BetsModule } from "./controllers/bets/bets.module";
import { InterceptorsModule } from "./common/interceptors";
import { FiltersModule } from "./common/filters";
import { PipesModule } from "./common/pipes/pipes.module";
import { PaymentProviderModule } from "./common/payment/payment-provider.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../.env",
      isGlobal: true
    }),
    DatabaseModule,
    InterceptorsModule,
    FiltersModule,
    PipesModule,
    PaymentProviderModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    ProvablyFairModule,
    BetsModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule { }
