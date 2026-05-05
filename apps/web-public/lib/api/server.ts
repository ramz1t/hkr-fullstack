import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const jar = await cookies();
  const accessToken = jar.get("access_token")?.value;
  const refreshToken = jar.get("refresh_token")?.value;

  const call = (token?: string) => {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...init, headers });
  };

  let res = await call(accessToken);

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` }
    });
    if (refreshRes.ok) {
      const { access_token } = (await refreshRes.json()) as {
        access_token: string;
      };
      res = await call(access_token);
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? res.statusText ?? "Request failed");
  }

  return res.json() as Promise<T>;
}
