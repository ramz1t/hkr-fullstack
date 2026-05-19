import { Bet } from "@repo/database";

export type BetWithGameAndOutcomeDto = Bet & {
  game: { id: string; slug: string };
  coinFlip: { chosenSide: string; landedSide: string } | null;
  slotSpin: { reels: unknown; outcome: string } | null;
};
