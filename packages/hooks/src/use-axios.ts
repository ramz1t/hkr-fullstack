import axios, { AxiosError, type AxiosResponse, type AxiosInstance } from "axios";
import { useMemo, useRef } from "react";
import { useAuth } from "./use-auth.js";
import type { ApiResponse, Tokens } from "@repo/types";
import { isTokenExpired } from "./utils.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Module-level lock so concurrent requests share a single refresh attempt.
// This is needed to prevent race condition when multiple /refresh are requested
let refreshPromise: Promise<Tokens> | null = null;

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
          if (!refreshPromise) {
            refreshPromise = axios
              .post<ApiResponse<Tokens>>(
                `${BASE_URL}/auth/refresh`,
                { refreshToken },
                { headers: { "Content-Type": "application/json" } }
              )
              .then((res) => res.data.data!)
              .finally(() => {
                refreshPromise = null;
              });
          }

          const newTokens = await refreshPromise;

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

    inst.interceptors.response.use(
      (res: AxiosResponse<ApiResponse<unknown>>) => {
        // add handling here if needed
        return res;
      },
      (err: AxiosError<ApiResponse<unknown>>) => {
        const possibleMessage = err.response?.data.error?.message;
        if (possibleMessage) {
          console.error(possibleMessage);
        }
        return Promise.reject(err);
      }
    );

    return inst;
  }, []);

  return instance;
};
