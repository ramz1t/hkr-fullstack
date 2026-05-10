import { CoinflipDto } from "./coinflip.dto";

export type CoinflipBetDto = {
  id: string;
  userId: string;
  wager: number;
  payout: number;
  nonce: number;
  coinflip: CoinflipDto;
  createdAt: Date;
  updatedAt: Date;
};
