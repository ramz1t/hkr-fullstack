export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

function isPaginationMeta(value: any): value is PaginationMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.page === "number" &&
    typeof value.pageSize === "number" &&
    typeof value.total === "number" &&
    typeof value.totalPages === "number" &&
    typeof value.hasMore === "boolean"
  );
}

export function isPaginatedResult<T = unknown>(
  value: any
): value is PaginatedResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray(value.data) &&
    isPaginationMeta(value.pagination)
  );
}
