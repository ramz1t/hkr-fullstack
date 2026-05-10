import { SeedsDto } from "./seeds.dto";

export type RevealedSeedsDto = SeedsDto & {
  serverSeed: string;
};
