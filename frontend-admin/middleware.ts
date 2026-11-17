import { NextResponse, type NextRequest } from "next/server";

function getUserRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isAuthPage = pathname.startsWith("/login");
  const isDashboardPage =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/candidates") ||
    pathname.startsWith("/kanban") ||
    pathname.startsWith("/interviews") ||
    pathname.startsWith("/offers") ||
    pathname.startsWith("/job-description") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/notifications");

  // If user is unauthenticated and attempting to access protected dashboard routes
  if (isDashboardPage && !token) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("returnUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const role = getUserRoleFromToken(token);
  const isEmployee = role === "EMPLOYEE";

  // If user is already authenticated and visits login page or root, redirect based on role
  if ((isAuthPage || pathname === "/") && token) {
    const targetUrl = isEmployee ? "/interviews" : "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // If an interviewer (EMPLOYEE) attempts to access unauthorized pages, redirect to /interviews
  if (
    token &&
    isEmployee &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/candidates") ||
      pathname.startsWith("/kanban") ||
      pathname.startsWith("/job-description") ||
      pathname.startsWith("/offers") ||
      pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/interviews", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
