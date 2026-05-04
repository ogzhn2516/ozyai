import { NextRequest, NextResponse } from "next/server";

const adminCookie = "wiro_admin_session";
const userCookie = "wiro_user_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/panel")) {
    const session = request.cookies.get(userCookie)?.value;

    if (session) {
      return NextResponse.next();
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";

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
  matcher: ["/admin/:path*", "/panel/:path*"],
};
