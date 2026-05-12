import { BetDto } from "./bet.dto";
import type { CoinSide } from "./coin-side.enum";

export type CoinflipBetDto = BetDto & {
  coinFlip: {
    chosenSide: CoinSide;
    landedSide: CoinSide;
  };
};
