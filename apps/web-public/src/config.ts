import { type ComponentType } from "react";
import { type LucideIcon, HandCoins } from "lucide-react";
import Coinflip from "./pages/Games/coinflip";

export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
}

export const GAMES: GameConfig[] = [
  {
    slug: "coinflip",
    name: "Coinflip",
    description: "Choose Heads or Tails and flip for a chance to double up",
    icon: HandCoins,
    component: Coinflip
  }
];
