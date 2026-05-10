import { CoinSide } from "./coin-side.enum";

export type CoinflipDto = {
  id: string;
  chosenSide: CoinSide;
  landedSide: CoinSide;
};
