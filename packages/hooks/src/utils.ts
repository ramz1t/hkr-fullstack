import type { ApiResponse, JwtPayload } from "@repo/types";

const TOKEN_EXPIRY_BUFFER_SECONDS = Math.floor(
  Number(import.meta.env.VITE_JWT_ACCESS_TTL ?? 900) / 10
);

export const isTokenExpired = (token: string): boolean => {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64 || "")) as { exp: number };
    return Date.now() / 1000 >= exp - TOKEN_EXPIRY_BUFFER_SECONDS;
  } catch {
    return true;
  }
};

export const decodeJwt = (token: string): JwtPayload => {
  const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64 || "")) as JwtPayload;
};

export const parseError = (
  body: ApiResponse<unknown>,
  fallback: string
): string => body.error?.message ?? fallback;
