import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { WalletDto, TransactionDto, TransactionType } from "@repo/types";
import type { User } from "@repo/database";

@Injectable()
export class WalletsService {
  constructor(private readonly db: DatabaseService) {}

  async getBalance(userId: User["id"]): Promise<number> {
    const transactions = await this.db.client.transaction.findMany({
      where: { userId }
    });

    let balance = 0;
    for (const transaction of transactions) {
      switch (transaction.type as TransactionType) {
        case TransactionType.DEPOSIT:
        case TransactionType.WIN:
        case TransactionType.ADJUSTMENT:
          balance += transaction.amount;
          break;
        case TransactionType.WITHDRAWAL:
        case TransactionType.BET:
          balance -= transaction.amount;
          break;
      }
    }

    return balance;
  }

  async findByUserId(userId: string): Promise<WalletDto | null> {
    const user = await this.db.client.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    const balance = await this.getBalance(userId);

    const transactionsDb = await this.db.client.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const transactions: TransactionDto[] = transactionsDb.map((t) => ({
      id: t.id,
      type: t.type as TransactionType,
      amount: t.amount,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    return { balance, transactions };
  }
}
