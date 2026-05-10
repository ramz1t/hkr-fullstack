import type { CreateBetDto } from "./create-bet.dto";
import type { CoinSide } from "./coin-side.enum";

export type CreateCoinFlipBetDto = CreateBetDto & {
  side: CoinSide;
};
