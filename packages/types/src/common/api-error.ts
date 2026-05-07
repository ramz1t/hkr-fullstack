type ApiErrorArgs = {
  message: string;
  code?: string;
  statusCode: number;
  details?: unknown;
};

export class ApiError extends Error {
  code?: string;
  statusCode: number;
  details?: unknown;

  constructor({ message, code, statusCode, details }: ApiErrorArgs) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const API_ERRORS = {
  AUTH_INVALID_CREDENTIALS: new ApiError({
    code: "AUTH_INVALID_CREDENTIALS",
    message: "Invalid credentials",
    statusCode: 401
  }),
  AUTH_ACCOUNT_BANNED: new ApiError({
    code: "AUTH_ACCOUNT_BANNED",
    message: "Account is banned",
    statusCode: 403
  }),
  AUTH_INVALID_SESSION: new ApiError({
    code: "AUTH_INVALID_SESSION",
    message: "Invalid session",
    statusCode: 401
  }),
  AUTH_EMAIL_ALREADY_REGISTERED: new ApiError({
    code: "AUTH_EMAIL_ALREADY_REGISTERED",
    message: "Email already registered",
    statusCode: 409
  }),
  VALIDATION_FAILED: new ApiError({
    code: "VALIDATION_FAILED",
    message: "Validation failed",
    statusCode: 400
  }),
  INTERNAL_SERVER_ERROR: new ApiError({
    code: "INTERNAL_SERVER_ERRORS",
    message: "Internal server error",
    statusCode: 500
  })
} as const satisfies Record<string, ApiError>;
