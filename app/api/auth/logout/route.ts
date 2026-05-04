import { NextResponse } from "next/server";
import { userSessionCookie } from "../../../lib/user-store";

export async function POST() {
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
