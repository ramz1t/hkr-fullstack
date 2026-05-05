import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "@repo/types";
import { Request } from "express";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    return request.user;
  }
);
