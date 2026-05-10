export type BetDto = {
  id: string;
  gameSlug: string;
  wager: number;
  payout: number;
  nonce: number;
  won: boolean;
  createdAt: Date;
  updatedAt: Date;
};
