import type { CoinSide } from "./coin-side.enum";

export type BetDto = {
  id: string;
  gameId: string;
  gameSlug: string;
  wager: number;
  payout: number;
  nonce: number;
  serverSeed: string | null;
  serverSeedHash: string;
  clientSeed: string;
};
