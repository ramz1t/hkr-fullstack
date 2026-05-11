import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./common/database/database.module";
import { AuthModule } from "./controllers/auth/auth.module";
import { UsersModule } from "./controllers/users/users.module";
import { WalletsModule } from "./controllers/wallets/wallets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../../.env",
      isGlobal: true
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    WalletsModule,
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule { }
