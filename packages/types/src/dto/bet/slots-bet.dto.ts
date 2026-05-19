import type { BetDto } from "./bet.dto";
import type { SlotOutcome } from "./slot-outcome.enum";
import type { SlotSymbol } from "./slot-symbol.enum";

export type SlotReels = [
  [SlotSymbol, SlotSymbol, SlotSymbol],
  [SlotSymbol, SlotSymbol, SlotSymbol],
  [SlotSymbol, SlotSymbol, SlotSymbol]
];

export type SlotsBetDto = BetDto & {
  slots: {
    reels: SlotReels;
    mainLine: [SlotSymbol, SlotSymbol, SlotSymbol];
    outcome: SlotOutcome;
  };
};
