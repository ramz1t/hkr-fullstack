import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { WalletDto, TransactionDto, TransactionType, PaginatedTransactionsDto } from "@repo/types";
import type { Transaction } from "@repo/database";

@Injectable()
export class WalletsService {
  constructor(private readonly db: DatabaseService) { }

  buildBalance(transactions: TransactionDto[]): number {
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

  private mapTransaction(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id,
      type: transaction.type as TransactionType,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  }

  async getBalance(userId: string): Promise<number> {
    const transactions = await this.db.client.transaction.findMany({
      where: { userId }
    });
    const transactionsDto = transactions.map(this.mapTransaction);

    return this.buildBalance(transactionsDto);
  }

  async findByUserId(userId: string): Promise<WalletDto | null> {
    const user = await this.db.client.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    const transactionsDb = await this.db.client.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    const transactions: TransactionDto[] = transactionsDb.map(this.mapTransaction);

    const balance = this.buildBalance(transactions);

    return { balance, transactions };
  }

  async findTransactionsByUserId(userId: string, page: number, pageSize: number): Promise<PaginatedTransactionsDto> {
    const transactionsDb = await this.db.client.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const transactions: TransactionDto[] = transactionsDb.map(this.mapTransaction);
    const total = await this.db.client.transaction.count({ where: { userId } });

    return { transactions, total, page, pageSize };
  }
}
