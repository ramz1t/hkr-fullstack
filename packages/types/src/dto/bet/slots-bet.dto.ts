import type { BetDto } from "./bet.dto";
import type { SlotOutcome } from "./slot-outcome.enum";
import { SlotReels } from "./slot-reels.type";
import type { SlotSymbol } from "./slot-symbol.enum";

export type SlotsBetDto = BetDto & {
  slots: {
    reels: SlotReels;
    mainLine: [SlotSymbol, SlotSymbol, SlotSymbol];
    outcome: SlotOutcome;
  };
};
