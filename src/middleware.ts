import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIVATE_PATHS = ["/messages", "/anotherprivatepage"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate = PRIVATE_PATHS.some((path) => pathname.startsWith(path));
  if (!isPrivate) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;
  if (accessToken) return NextResponse.next();

  const authorizeUrl = process.env.NEXT_PUBLIC_AUTHORIZE_URL!;
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI!);
  const state = encodeURIComponent(pathname);

  return NextResponse.redirect(
    `${authorizeUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=&state=${state}`
  );
}

export const config = {
  matcher: ["/messages/:path*", "/anotherprivatepage/:path*"],
};
