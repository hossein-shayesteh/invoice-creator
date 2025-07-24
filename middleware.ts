import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
  MODERATOR: "MODERATOR",
} as const;

const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const session = await auth();
    const userRole = session?.user?.role;

    // Redirect unauthenticated users from protected routes
    if (!session?.user && isProtectedRoute(pathname)) {
      return redirectToSignIn(request);
    }

    // Redirect authenticated users away from auth pages
    if (session?.user && isAuthRoute(pathname)) {
      return redirectToDashboard(request);
    }

    // Block non-admins from admin routes
    if (session?.user && isAdminRoute(pathname) && userRole === Role.USER) {
      return redirectToDashboard(request);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    if (isProtectedRoute(pathname)) {
      return redirectToSignIn(request);
    }
    return NextResponse.next();
  }
}

// Helper functions
function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string) {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

function redirectToSignIn(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToDashboard(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|sign-in|sign-up).*)",
  ],
};
