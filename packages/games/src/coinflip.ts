import { CoinSide } from "@repo/types";
import { Game } from "./base";

export class CoinflipGame extends Game<CoinSide> {
  readonly algorithm =
    "SHA-256(serverSeed + clientSeed + nonce) -> first 2 hex chars as uint8; even = HEADS, odd = TAILS";

  computeOutcome(hash: string): CoinSide {
    return parseInt(hash.substring(0, 2), 16) % 2 === 0
      ? CoinSide.HEADS
      : CoinSide.TAILS;
  }
}

export const coinflip = new CoinflipGame();
