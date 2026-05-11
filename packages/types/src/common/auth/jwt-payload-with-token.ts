import { JwtPayload } from "./jwt-payload";
import { Tokens } from "./tokens";

export type JwtPayloadWithTokens<K extends keyof Tokens> = JwtPayload &
  Pick<Tokens, K>;
