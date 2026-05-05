"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api";
const IS_PROD = process.env.NODE_ENV === "production";

async function setTokenCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set("access_token", accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60
  });
  jar.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}

export async function loginAction(formData: FormData): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password")
    })
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return body.message ?? "Invalid credentials";
  }

  const { accessToken, refreshToken } = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  await setTokenCookies(accessToken, refreshToken);
  return null;
}

export async function registerAction(
  formData: FormData
): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password")
    })
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return body.message ?? "Registration failed";
  }

  const { accessToken, refreshToken } = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  await setTokenCookies(accessToken, refreshToken);
  return null;
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete("access_token");
  jar.delete("refresh_token");
  redirect("/login");
}
