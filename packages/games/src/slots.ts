import { SlotOutcome, SlotSymbol, type SlotReels } from "@repo/types";
import { Game } from "./base";
import type { AlgorithmStep } from "./base";

const SYMBOLS = [
  SlotSymbol.DIAMOND,
  SlotSymbol.SEVEN,
  SlotSymbol.BAR,
  SlotSymbol.CHERRY,
  SlotSymbol.LEMON
] as const;

export class SlotsGame extends Game<SlotOutcome> {
  readonly algorithm =
    "SHA-256(serverSeed + clientSeed + nonce) -> bytes 0–17 as 9 uint8s; each byte % 5 maps to [DIAMOND, SEVEN, BAR, CHERRY, LEMON]; win determined by center row (main line)";

  private sym(hash: string, i: number): SlotSymbol {
    return SYMBOLS[
      parseInt(hash.substring(i * 2, i * 2 + 2), 16) % SYMBOLS.length
    ]!;
  }

  computeReels(hash: string): SlotReels {
    return [
      [this.sym(hash, 0), this.sym(hash, 1), this.sym(hash, 2)],
      [this.sym(hash, 3), this.sym(hash, 4), this.sym(hash, 5)],
      [this.sym(hash, 6), this.sym(hash, 7), this.sym(hash, 8)]
    ];
  }

  evaluateMainLine(
    mainLine: [SlotSymbol, SlotSymbol, SlotSymbol]
  ): SlotOutcome {
    const [a, b, c] = mainLine;
    if (
      a === SlotSymbol.DIAMOND &&
      b === SlotSymbol.DIAMOND &&
      c === SlotSymbol.DIAMOND
    ) {
      return SlotOutcome.JACKPOT;
    }
    if (a === b && b === c) {
      return SlotOutcome.BIG_WIN;
    }
    if (a === b || b === c) {
      return SlotOutcome.SMALL_WIN;
    }
    return SlotOutcome.LOSS;
  }

  computeOutcome(hash: string): SlotOutcome {
    const reels = this.computeReels(hash);
    return this.evaluateMainLine([reels[0][1], reels[1][1], reels[2][1]]);
  }

  describeSteps(hash: string): AlgorithmStep[] {
    const byte = (i: number) => parseInt(hash.substring(i * 2, i * 2 + 2), 16);
    const reels = this.computeReels(hash);
    const mainLine: [SlotSymbol, SlotSymbol, SlotSymbol] = [
      reels[0][1],
      reels[1][1],
      reels[2][1]
    ];
    return [
      {
        instruction: "Bytes 0–17 (uint8 -> symbol index)",
        result: Array.from(
          { length: 9 },
          (_, i) => `${byte(i)} % 5 = ${byte(i) % 5}`
        ).join(", ")
      },
      {
        instruction: "Reel 1 (top | mid | bot)",
        result: reels[0].join(" | ")
      },
      {
        instruction: "Reel 2 (top | mid | bot)",
        result: reels[1].join(" | ")
      },
      {
        instruction: "Reel 3 (top | mid | bot)",
        result: reels[2].join(" | ")
      },
      {
        instruction: "Main line (center row)",
        result: mainLine.join(" | ")
      },
      {
        instruction: "Outcome",
        result: this.evaluateMainLine(mainLine)
      }
    ];
  }
}

export const slots = new SlotsGame();
