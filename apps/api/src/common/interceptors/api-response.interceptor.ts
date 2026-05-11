import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import type { ApiResponse } from "@repo/types";
import type { Request, Response } from "express";
import { map, Observable } from "rxjs";

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map(
        (data): ApiResponse<T> => ({
          data: data ?? null,
          meta: {
            requestId: request.headers["x-request-id"]?.toString(),
            timestamp: new Date().toISOString(),
            path: request.path,
            method: request.method,
            statusCode: response.statusCode
          },
          error: null
        })
      )
    );
  }
}
