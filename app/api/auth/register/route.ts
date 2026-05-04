import { NextResponse } from "next/server";
import { createUser, toPublicUser, userSessionCookie } from "../../../lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Ad en az 2 karakter olmalı." }, { status: 400 });
  }

  if (!email.includes("@") || email.length < 6) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  }

  try {
    const user = createUser(name, email);
    const response = NextResponse.json({ status: "registered", user: toPublicUser(user) });

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
      { error: error instanceof Error ? error.message : "Kayıt oluşturulamadı." },
      { status: 409 },
    );
  }
}
