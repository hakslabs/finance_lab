import { type NextRequest, NextResponse } from "next/server";

import { TEMP_AUTH_COOKIE_NAME, verifyTemporaryAuthSession } from "@/app/_lib/auth/session";

const publicPathPrefixes = ["/login", "/api", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TEMP_AUTH_COOKIE_NAME)?.value;
  const session = await verifyTemporaryAuthSession(token, process.env.CRON_SECRET);

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
