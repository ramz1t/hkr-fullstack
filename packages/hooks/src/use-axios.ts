import axios, { type AxiosInstance } from "axios";
import { useMemo, useRef } from "react";
import { useAuth } from "./use-auth.js";
import type { ApiResponse, Tokens } from "@repo/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const TOKEN_EXPIRY_BUFFER_SECONDS = Math.floor(
  Number(import.meta.env.VITE_JWT_ACCESS_TTL ?? 900) / 10
);

const isTokenExpired = (token: string): boolean => {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64 || "")) as { exp: number };
    return Date.now() / 1000 >= exp - TOKEN_EXPIRY_BUFFER_SECONDS;
  } catch {
    return true;
  }
};

export const useAxios = (): AxiosInstance => {
  const { tokens, updateTokens, logout } = useAuth();
  const tokensRef = useRef(tokens);
  const updateTokensRef = useRef(updateTokens);
  const logoutRef = useRef(logout);
  tokensRef.current = tokens;
  updateTokensRef.current = updateTokens;
  logoutRef.current = logout;

  const instance = useMemo(() => {
    const inst = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" }
    });

    inst.interceptors.request.use(async (config) => {
      let accessToken = tokensRef.current?.accessToken;
      const refreshToken = tokensRef.current?.refreshToken;

      if (!accessToken) return config;

      if (isTokenExpired(accessToken)) {
        if (!refreshToken) {
          await logoutRef.current();
          return Promise.reject(new Error("Session expired"));
        }

        try {
          const res = await axios.post<ApiResponse<Tokens>>(
            `${BASE_URL}/api/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
          const newTokens = res.data.data!;
          updateTokensRef.current(newTokens);
          tokensRef.current = newTokens;
          accessToken = newTokens.accessToken;
        } catch {
          await logoutRef.current();
          return Promise.reject(new Error("Session expired"));
        }
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });

    return inst;
  }, []);

  return instance;
};
