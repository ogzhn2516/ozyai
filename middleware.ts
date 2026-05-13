import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, verifySessionValue } from "./app/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = pathname === "/panel" || pathname.startsWith("/panel/");
  const isProtectedInfluencerList = pathname === "/influencers" || pathname.startsWith("/influencers/");
  const isProtectedApi = pathname.startsWith("/api/influencers");
  const isProtectedInstagramApi = pathname.startsWith("/api/instagram");

  if (!isProtectedPage && !isProtectedInfluencerList && !isProtectedApi && !isProtectedInstagramApi) {
    return NextResponse.next();
  }

  const session = request.cookies.get(sessionCookieName)?.value;

  if (await verifySessionValue(session)) {
    return NextResponse.next();
  }

  if (isProtectedApi || isProtectedInstagramApi) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/panel/:path*", "/influencers/:path*", "/api/influencers/:path*", "/api/instagram/:path*"],
};
