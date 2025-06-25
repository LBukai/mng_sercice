import { NextResponse } from "next/server";
import { auth } from "./app/auth";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const url = req.nextUrl;

  if (!isLoggedIn && !req.nextUrl.pathname.startsWith("/login")) {
    const callbackUrl = url.pathname + url.search; // original requested URL
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|css|js)).*)",
  ],
};
