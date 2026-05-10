export type BetVerifyDto = {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  outcomeHash: string;
  result: Record<string, unknown>;
  match: boolean;
};
