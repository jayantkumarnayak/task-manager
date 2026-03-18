import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/login",
  "/register",
  "/",
];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/api/tasks"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes
  if (publicRoutes.some((route) => pathname === route)) {
    // Redirect authenticated users away from login/register pages
    if (["/login", "/register"].includes(pathname)) {
      const token = request.cookies.get("token")?.value;
      if (token) {
        try {
          jwt.verify(token, process.env.JWT_SECRET || "");
          // User is authenticated, redirect to dashboard
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch (error) {
          // Invalid token, continue to login page
        }
      }
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET || "");
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Match all routes except _next and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
