import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/profile", "/listings/create", "/messages"];
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export const config = {
  matcher: ["/profile/:path*", "/listings/create", "/messages/:path*"],
};
