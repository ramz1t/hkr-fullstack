import type { PaginationMeta } from "./pagination";

export type ApiResponse<T> = {
  data: T | null;
  meta: ApiResponseMeta;
  error: ApiResponseError | null;
};

export type ApiResponseMeta = {
  requestId?: string;
  timestamp: string;
  path?: string;
  method: string;
  statusCode: number;
  pagination?: PaginationMeta;
};

export type ApiResponseError = {
  code?: string;
  message: string;
  details?: unknown;
};
