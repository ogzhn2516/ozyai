import { NextResponse } from "next/server";
import { adminSessionCookie, getAdminCredentials } from "../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };
  const { username, password, sessionSecret } = getAdminCredentials();

  if (!username || !password || !sessionSecret) {
    return NextResponse.json(
      { error: "Admin kullanıcı adı ve şifre henüz yapılandırılmamış." },
      { status: 503 },
    );
  }

  if (body.username !== username || body.password !== password) {
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  }

  const response = NextResponse.json({ status: "authenticated" });
  response.cookies.set(adminSessionCookie, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
