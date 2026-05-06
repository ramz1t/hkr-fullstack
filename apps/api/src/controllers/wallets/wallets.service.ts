import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { WalletDto, TransactionDto, TransactionType } from "@repo/types";

@Injectable()
export class WalletsService {
  constructor(private readonly db: DatabaseService) { }

  async findByUserId(userId: string): Promise<WalletDto | null> {
    // Return null only if user doesn't exist
    const user = await this.db.client.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }

    // Construct wallet data
    const wallet: WalletDto = {
      balance: 0,
      transactions: []
    };

    const transactionsDb = await this.db.client.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }  // latest first 
    });

    for (const txDb of transactionsDb) {
      const tx: TransactionDto = {
        id: txDb.id,
        type: txDb.type as TransactionType,
        amount: txDb.amount,
        createdAt: txDb.createdAt,
        updatedAt: txDb.updatedAt,
      };

      this.updateWalletWithTransaction(wallet, tx);
    }

    return wallet;
  };

  private updateWalletWithTransaction(wallet: WalletDto, transaction: TransactionDto) {
    wallet.transactions.push(transaction);

    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        wallet.balance += transaction.amount;
        break;
      case TransactionType.WITHDRAWAL:
        wallet.balance -= transaction.amount;
        break;
      case TransactionType.BET:
        wallet.balance -= transaction.amount;
        break;
      case TransactionType.WIN:
        wallet.balance += transaction.amount;
        break;
      case TransactionType.ADJUSTMENT:
        wallet.balance += transaction.amount;
        break;
    }
  }
}
