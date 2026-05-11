import { TransactionDto } from "./transaction.dto";

export type WalletDto = {
  balance: number;
  transactions: TransactionDto[];
};
