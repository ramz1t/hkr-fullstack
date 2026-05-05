import { JwtPayloadWithTokens, Tokens } from "@repo/types";
import { Request } from "express";

export type RequestWithUser<K extends keyof Tokens> = Request & {
  user: JwtPayloadWithTokens<K>;
};
