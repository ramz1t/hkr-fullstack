import type { CoinflipBetDto } from "@repo/types";

export const formatCoinflipOutcome = (
  bet: CoinflipBetDto
): { label: string; won: boolean } => ({
  label: bet.coinFlip.landedSide,
  won: bet.coinFlip.chosenSide === bet.coinFlip.landedSide
});
