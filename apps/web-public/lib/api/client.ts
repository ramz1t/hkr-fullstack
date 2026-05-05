"use client";

export async function clientFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:expired"));
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}
