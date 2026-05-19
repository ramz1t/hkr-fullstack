export type AlgorithmStep = {
  instruction: string;
  result: string;
};

export abstract class Game<T extends string = string> {
  abstract readonly algorithm: string;

  abstract computeOutcome(hash: string): T;

  describeSteps(hash: string): AlgorithmStep[] {
    return [
      { instruction: "Algorithm", result: this.algorithm },
      { instruction: "Outcome", result: this.computeOutcome(hash) }
    ];
  }
}
