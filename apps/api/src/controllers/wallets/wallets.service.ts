import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { PaymentProviderService } from "../../common/payment/payment-provider.service";
import {
  WalletDto,
  TransactionDto,
  TransactionType,
  PaginatedTransactionsDto
} from "@repo/types";
import type { Transaction } from "@repo/database";

@Injectable()
export class WalletsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly paymentProvider: PaymentProviderService
  ) {}

  private buildBalance(transactions: TransactionDto[]): number {
    let balance = 0;
    for (const transaction of transactions) {
      switch (transaction.type) {
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

  async getBalance(userId: string): Promise<number> {
    const transactions = await this.db.client.transaction.findMany({
      where: { userId }
    });
    const transactionsDto = transactions.map(this.toTransactionDto);

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
    const transactions: TransactionDto[] = transactionsDb.map(
      this.toTransactionDto
    );

    const balance = this.buildBalance(transactions);

    return { balance, transactions };
  }

  async findTransactionsByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedTransactionsDto> {
    const transactionsDb = await this.db.client.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const transactions: TransactionDto[] = transactionsDb.map(
      this.toTransactionDto
    );
    const total = await this.db.client.transaction.count({ where: { userId } });

    return { transactions, total, page, pageSize };
  }

  async makeDeposit(userId: string, amount: number): Promise<TransactionDto> {
    await this.paymentProvider.deposit(userId, amount);
    return await this.createTransaction(
      userId,
      TransactionType.DEPOSIT,
      amount
    );
  }

  async makeWithdrawal(
    userId: string,
    amount: number
  ): Promise<TransactionDto> {
    const balance = await this.getBalance(userId);

    if (balance < amount) {
      throw new BadRequestException("Insufficient balance");
    }

    await this.paymentProvider.withdraw(userId, amount);
    return await this.createTransaction(
      userId,
      TransactionType.WITHDRAWAL,
      amount
    );
  }

  async createTransaction(
    userId: string,
    type: TransactionType,
    amount: number
  ): Promise<TransactionDto> {
    const transaction = await this.db.client.transaction.create({
      data: {
        userId,
        type,
        amount
      }
    });

    return this.toTransactionDto(transaction);
  }

  private toTransactionDto(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id,
      type: transaction.type as TransactionType,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  }
}
