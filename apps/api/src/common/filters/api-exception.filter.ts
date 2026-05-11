import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from "@nestjs/common";
import {
  API_ERRORS,
  ApiError,
  type ApiResponse,
  type ApiResponseError
} from "@repo/types";
import type { Request, Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const apiError = this.toApiError(exception);
    const apiResponseError = this.toApiResponseError(apiError);

    const body: ApiResponse<null> = {
      data: null,
      meta: {
        requestId: request.headers["x-request-id"]?.toString(),
        timestamp: new Date().toISOString(),
        path: request.path,
        method: request.method,
        statusCode: apiError.statusCode
      },
      error: apiResponseError
    };

    response.status(apiError.statusCode).json(body);
  }

  private toApiError(exception: unknown): ApiError {
    if (exception instanceof ApiError) {
      return exception;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();

      return new ApiError({
        message: exception.message,
        statusCode
      });
    }

    return API_ERRORS.INTERNAL_SERVER_ERROR;
  }

  private toApiResponseError(error: ApiError): ApiResponseError {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  }
}
