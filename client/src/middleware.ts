import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return new NextResponse(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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