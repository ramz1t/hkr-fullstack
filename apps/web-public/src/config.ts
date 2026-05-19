import { type LucideIcon, HandCoins } from "lucide-react";
import { type ComponentType } from "react";
import { type BetDto, type CoinflipBetDto } from "@repo/types";
import { coinflip, type AlgorithmStep } from "@repo/games";
import Coinflip from "./pages/Games/coinflip";

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
  formatBetDetails: (bet: BetDto) => { title: string; value: string }[];
  computeOutcome: (hash: string) => string;
  algorithm: string;
  describeSteps: (hash: string) => AlgorithmStep[];
}

export const GAMES: GameConfig[] = [
  {
    slug: "coinflip",
    name: "Coinflip",
    description: "Choose Heads or Tails and flip for a chance to double up",
    icon: HandCoins,
    component: Coinflip,
    formatBetDetails: (bet) => {
      const b = bet as CoinflipBetDto;
      return [
        { title: "Chosen", value: b.coinFlip.chosenSide },
        { title: "Landed", value: b.coinFlip.landedSide }
      ];
    },
    computeOutcome: (hash) => coinflip.computeOutcome(hash),
    algorithm: coinflip.algorithmDescription,
    describeSteps: (hash) => coinflip.describeSteps(hash)
  }
];
