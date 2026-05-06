import { TransactionType } from "./transaction-type.enum";

export type TransactionDto = {
  id: string;
  type: TransactionType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};
