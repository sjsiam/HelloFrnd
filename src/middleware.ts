import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";
import {config as authConfig} from "./config";

const PRIVATE_PATHS = ["/messages", "/anotherprivatepage"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate = PRIVATE_PATHS.some((path) => pathname.startsWith(path));
  if (!isPrivate) return NextResponse.next();

  const accessToken = req.cookies.get("access_token")?.value;

  if (!accessToken) {
    // No token → redirect to OAuth login
    const authorizeUrl = process.env.NEXT_PUBLIC_AUTHORIZE_URL!;
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_REDIRECT_URI!
    );
    const state = encodeURIComponent(pathname + req.nextUrl.search);

    return NextResponse.redirect(
      `${authorizeUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=&state=${state}`
    );
  }

  try {
    await axios.get(`${process.env.FILEION_AUTH_API_URL}/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.next();
  } catch (err) {
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_AUTHORIZE_URL}?client_id=${
        process.env.NEXT_PUBLIC_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        authConfig.oauth2.redirectUri
      )}&response_type=code&scope=&state=${encodeURIComponent(
        pathname + req.nextUrl.search
      )}`
    );
    res.cookies.delete("access_token");
    return res;
  }
}

export const config = {
  matcher: ["/messages/:path*", "/anotherprivatepage/:path*"],
};
