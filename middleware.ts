import { NextRequest, NextResponse } from "next/server";

const adminCookie = "wiro_admin_session";
const userCookie = "wiro_user_session";
const protectedUserPaths = ["/panel", "/create", "/image-generator", "/voice-generator"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedUserPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const session = request.cookies.get(userCookie)?.value;

    if (session) {
      return NextResponse.next();
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expectedSession = process.env.ADMIN_SESSION_SECRET;
  const session = request.cookies.get(adminCookie)?.value;

  if (expectedSession && session === expectedSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/panel/:path*", "/create/:path*", "/image-generator/:path*", "/voice-generator/:path*"],
};
