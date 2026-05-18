export abstract class Game<T extends string = string> {
  abstract readonly algorithm: string;

  abstract computeOutcome(hash: string): T;
}
