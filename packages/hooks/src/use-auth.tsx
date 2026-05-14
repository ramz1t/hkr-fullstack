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

const decodeJwt = (token: string): JwtPayload => {
  const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64 || "")) as JwtPayload;
};

const parseError = (body: ApiResponse<unknown>, fallback: string): string =>
  body.error?.message ?? fallback;

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
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
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
      const res = await fetch(`${apiBaseUrl}/auth/register`, {
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
    try {
      if (tokens?.refreshToken) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });
      }
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
