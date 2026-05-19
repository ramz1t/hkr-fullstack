import { CoinSide } from "@repo/types";
import { Game } from "./base";
import type { AlgorithmStep } from "./base";

export class CoinflipGame extends Game<CoinSide> {
  readonly algorithm =
    "SHA-256(serverSeed + clientSeed + nonce) -> first 2 hex chars as uint8; even = HEADS, odd = TAILS";

  computeOutcome(hash: string): CoinSide {
    return parseInt(hash.substring(0, 2), 16) % 2 === 0
      ? CoinSide.HEADS
      : CoinSide.TAILS;
  }

  describeSteps(hash: string): AlgorithmStep[] {
    const firstTwo = hash.substring(0, 2);
    const decimal = parseInt(firstTwo, 16);
    const isEven = decimal % 2 === 0;

    return [
      { instruction: "First 2 hex chars of SHA-256", result: firstTwo },
      { instruction: "Parse as uint8", result: String(decimal) },
      { instruction: "Check parity", result: isEven ? "even" : "odd" },
      {
        instruction: "Result",
        result: isEven ? CoinSide.HEADS : CoinSide.TAILS
      }
    ];
  }
}

export const coinflip = new CoinflipGame();
