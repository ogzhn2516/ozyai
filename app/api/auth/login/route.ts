import { NextResponse } from "next/server";
import { authenticateUser, toPublicUser, userSessionCookie } from "../../../lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  try {
    const user = authenticateUser(body.email ?? "", body.password ?? "");
    const response = NextResponse.json({ status: "authenticated", user: toPublicUser(user) });

    response.cookies.set(userSessionCookie, user.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Giriş yapılamadı." },
      { status: 401 },
    );
  }
}
