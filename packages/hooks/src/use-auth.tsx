import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode
} from "react";
import type {
  ApiResponse,
  JwtPayload,
  LoginDto,
  RegisterDto,
  Tokens
} from "@repo/types";
import useLocalStorage from "./use-local-storage.js";
import { decodeJwt, isTokenExpired, parseError } from "./utils.js";

export type { JwtPayload as User };

interface AuthContextValue {
  user: JwtPayload | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (t: Tokens) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKENS_KEY = "auth_tokens";

interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl: string;
}

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const [tokens, setTokens] = useLocalStorage<Tokens>(
    TOKENS_KEY,
    null as unknown as Tokens
  );

  const user = useMemo<JwtPayload | null>(
    () => (tokens ? decodeJwt(tokens.accessToken) : null),
    [tokens]
  );

  const persistTokens = useCallback(
    (t: Tokens | null) => setTokens(t),
    [setTokens]
  );

  const updateTokens = useCallback(
    (t: Tokens) => persistTokens(t),
    [persistTokens]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const dto: LoginDto = { email, password };
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
      const body: ApiResponse<Tokens> = await res.json();
      if (!res.ok) throw new Error(parseError(body, "Login failed"));
      persistTokens(body.data!);
    },
    [apiBaseUrl, persistTokens]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const dto: RegisterDto = { email, password };
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });
      const body: ApiResponse<Tokens> = await res.json();
      if (!res.ok) throw new Error(parseError(body, "Registration failed"));
      persistTokens(body.data!);
    },
    [apiBaseUrl, persistTokens]
  );

  const logout = useCallback(async () => {
    let accessToken = tokens?.accessToken;

    // we need this because token can be expired at the time of logout
    if (accessToken && isTokenExpired(accessToken) && tokens?.refreshToken) {
      const res = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });
      const body: ApiResponse<Tokens> = await res.json();
      if (res.ok && body.data) {
        accessToken = body.data.accessToken;
      }
    }

    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
    } finally {
      persistTokens(null);
    }
  }, [apiBaseUrl, tokens, persistTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateTokens
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
