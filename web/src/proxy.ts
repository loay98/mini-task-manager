import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/cookies";

const protectedPaths = ["/dashboard", "/tasks"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/tasks/:path*"],
};