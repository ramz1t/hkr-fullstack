import { CoinflipBetDto } from "./coinflip-bet.dto";
import { SlotsBetDto } from "./slots-bet.dto";

export type AnyGameBetDto = CoinflipBetDto | SlotsBetDto;
