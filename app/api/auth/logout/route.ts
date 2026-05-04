import { NextResponse } from "next/server";
import { clearUserSession, userSessionCookie } from "../../../lib/user-store";

export async function POST(request: Request) {
  const sessionToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${userSessionCookie}=`))
    ?.split("=")[1];

  clearUserSession(sessionToken);

  const response = NextResponse.json({ status: "signed_out" });
  response.cookies.set(userSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
