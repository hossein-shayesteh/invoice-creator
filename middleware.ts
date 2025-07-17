import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];

export default async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const pathname = request.nextUrl.pathname;
    
    // Safe check for admin role with proper null/undefined handling
    const isAdmin = session?.user?.role === Role.ADMIN;
    
    // If user is not authenticated and trying to access protected route, redirect to sign-in
    if (!session?.user && protectedRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // If user is authenticated and trying to access sign-in page, redirect to dashboard
    if (session?.user && pathname.startsWith("/sign-in")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // If user is not Admin and trying to access admin routes, redirect to dashboard
    if (session?.user && !isAdmin && adminRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On auth error, redirect to sign-in for protected routes
    if (protectedRoutes.includes(request.nextUrl.pathname) || 
        adminRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};