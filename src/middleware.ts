import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieValue = request.cookies.get(sessionOptions.cookieName as string)?.value;

  let isAdmin = false;
  if (cookieValue) {
    try {
      const data = await unsealData<SessionData>(cookieValue, {
        password: sessionOptions.password as string,
      });
      isAdmin = !!data.isAdmin;
    } catch {}
  }

  if (pathname === "/admin/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.next();
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
