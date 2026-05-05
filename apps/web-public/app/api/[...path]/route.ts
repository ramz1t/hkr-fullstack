import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const IS_PROD = process.env.NODE_ENV === "production";

async function proxy(
  request: NextRequest,
  path: string
): Promise<NextResponse> {
  const jar = await cookies();
  const accessToken = jar.get("access_token")?.value;
  const refreshToken = jar.get("refresh_token")?.value;

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined;

  const call = (token?: string) => {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, {
      method: request.method,
      headers,
      body
    });
  };

  let res = await call(accessToken);

  let newAccessToken: string | undefined;
  let newRefreshToken: string | undefined;

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` }
    });

    if (!refreshRes.ok) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    const tokens = (await refreshRes.json()) as {
      access_token: string;
      refresh_token: string;
    };
    newAccessToken = tokens.access_token;
    newRefreshToken = tokens.refresh_token;
    res = await call(newAccessToken);
  }

  const data = await res.json().catch(() => null);
  const response = NextResponse.json(data, { status: res.status });

  if (newAccessToken && newRefreshToken) {
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60
    });
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60
    });
  }

  return response;
}

type Params = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Params) {
  return proxy(req, `/${(await params).path.join("/")}`);
}
export async function POST(req: NextRequest, { params }: Params) {
  return proxy(req, `/${(await params).path.join("/")}`);
}
export async function PUT(req: NextRequest, { params }: Params) {
  return proxy(req, `/${(await params).path.join("/")}`);
}
export async function PATCH(req: NextRequest, { params }: Params) {
  return proxy(req, `/${(await params).path.join("/")}`);
}
export async function DELETE(req: NextRequest, { params }: Params) {
  return proxy(req, `/${(await params).path.join("/")}`);
}
