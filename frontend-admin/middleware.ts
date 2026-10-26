import { NextResponse, type NextRequest } from "next/server";

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

  // If user is already authenticated and visits login page or root, redirect to dashboard
  if ((isAuthPage || pathname === "/") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
