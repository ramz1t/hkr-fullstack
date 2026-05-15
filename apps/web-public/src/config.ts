import { type ComponentType } from "react";
import { type LucideIcon, HandCoins } from "lucide-react";
import { CoinSide, type BetDto, type CoinflipBetDto } from "@repo/types";
import Coinflip from "./pages/Games/coinflip";

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
  formatBetDetails: (bet: BetDto) => { title: string; value: string }[]; // specific details for Verify page
  computeOutcome: (hash: string) => string;
  getStoredOutcome: (bet: BetDto) => string;
  algorithm: string; // human readable algorithm explanation
  explain: (hash: string) => { label: string; value: string }[]; // step by step breakdown
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
    computeOutcome: (hash) =>
      parseInt(hash.substring(0, 2), 16) % 2 === 0
        ? CoinSide.HEADS
        : CoinSide.TAILS,
    getStoredOutcome: (bet) => (bet as CoinflipBetDto).coinFlip.landedSide,
    algorithm:
      "SHA-256(serverSeed + clientSeed + nonce) - first 2 hex chars as uint8; even = HEADS, odd = TAILS",
    explain: (hash) => {
      const firstTwo = hash.substring(0, 2);
      const decimal = parseInt(firstTwo, 16);
      const isEven = decimal % 2 === 0;
      return [
        { label: "First 2 hex chars", value: firstTwo },
        { label: "As decimal", value: String(decimal) },
        { label: "Parity", value: isEven ? "even" : "odd" },
        { label: "Result", value: isEven ? CoinSide.HEADS : CoinSide.TAILS }
      ];
    }
  }
];
