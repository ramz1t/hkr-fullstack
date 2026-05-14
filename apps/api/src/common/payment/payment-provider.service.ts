import { Injectable, OnModuleInit, OnModuleDestroy, Logger, BadRequestException } from "@nestjs/common";
import { PaymentProvider } from "@repo/types";

@Injectable()
export class PaymentProviderService implements OnModuleInit, OnModuleDestroy, PaymentProvider {
  constructor() { }

  async onModuleInit(): Promise<void> {
    Logger.log("Initializing mock payment provider", "PaymentProviderService");
  }

  async onModuleDestroy(): Promise<void> {
    Logger.log("Destroying mock payment provider", "PaymentProviderService");
  }

  async deposit(userId: string, amount: number): Promise<void> {
    Logger.log(`Depositing ${amount} for user ${userId} successful`, "PaymentProviderService");
  }

  async withdraw(userId: string, amount: number): Promise<void> {
    Logger.log(`Withdrawing ${amount} for user ${userId} successful`, "PaymentProviderService");
  }
}
