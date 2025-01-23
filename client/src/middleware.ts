import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "./constants/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  // Admin routes
  if (hostname?.startsWith("admin.")) {
    // Map root admin paths to admin directory
    const url = request.nextUrl.clone();
    const token = request.cookies.get("token");

    // Keep login path as is
    if (pathname === "/login") {
      url.pathname = routes.admin.login;
      return NextResponse.rewrite(url);
    }

    // Check authentication for admin routes
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Skip auth check for static assets and API routes
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Rewrite all admin routes to use admin directory
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Redirect admin URLs from main domain to admin subdomain
  if (pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.host = `admin.${hostname}`;
    url.pathname = pathname.replace("/admin", "");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*",
  ],
};
