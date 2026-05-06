import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "../types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser<"accessToken">>();
    return request.user;
  }
);
