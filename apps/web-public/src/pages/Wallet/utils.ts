import { TransactionType } from "@repo/types";

export const TYPE_LABEL: Record<TransactionType, string> = {
  [TransactionType.DEPOSIT]: "Deposit",
  [TransactionType.WITHDRAWAL]: "Withdrawal",
  [TransactionType.BET]: "Bet",
  [TransactionType.WIN]: "Win",
  [TransactionType.ADJUSTMENT]: "Adjustment"
};

export const TYPE_COLOR: Record<TransactionType, string> = {
  [TransactionType.DEPOSIT]: "text-green-600",
  [TransactionType.WIN]: "text-green-600",
  [TransactionType.ADJUSTMENT]: "text-muted-foreground",
  [TransactionType.WITHDRAWAL]: "text-red-500",
  [TransactionType.BET]: "text-red-500"
};

export const isDebit = (type: TransactionType) =>
  type === TransactionType.BET || type === TransactionType.WITHDRAWAL;

export const fmt = (n: number | undefined) =>
  n !== undefined ? n.toLocaleString() : "";
