import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPrismaClient, type DatabaseClient } from "@repo/database";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly client: DatabaseClient;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      this.configService.get<string>("DATABASE_URL") ?? "";

    this.client = createPrismaClient(connectionString);
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
