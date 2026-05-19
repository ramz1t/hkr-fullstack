import { type LucideIcon, HandCoins, Cherry } from "lucide-react";
import { type ComponentType } from "react";
import {
  type BetDto,
  type CoinflipBetDto,
  type SlotsBetDto
} from "@repo/types";
import { coinflip, slots, type AlgorithmStep } from "@repo/games";
import Coinflip from "./pages/Games/coinflip";
import Slots from "./pages/Games/slots";

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
  formatBetDetails: (bet: BetDto) => { title: string; value: string }[];
  computeOutcome: (hash: string) => string;
  getStoredOutcome: (bet: BetDto) => string;
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
    getStoredOutcome: (bet) => (bet as CoinflipBetDto).coinFlip.landedSide,
    algorithm: coinflip.algorithm,
    describeSteps: (hash) => coinflip.describeSteps(hash)
  },
  {
    slug: "slots",
    name: "Slots",
    description: "Spin the reels – match symbols on the main line to win big",
    icon: Cherry,
    component: Slots,
    formatBetDetails: (bet) => {
      const b = bet as SlotsBetDto;
      return [
        { title: "Outcome", value: b.slots.outcome },
        { title: "Main Line", value: b.slots.mainLine.join(" | ") }
      ];
    },
    computeOutcome: (hash) => slots.computeOutcome(hash),
    getStoredOutcome: (bet) => (bet as SlotsBetDto).slots.outcome,
    algorithm: slots.algorithm,
    describeSteps: (hash) => slots.describeSteps(hash)
  }
];
