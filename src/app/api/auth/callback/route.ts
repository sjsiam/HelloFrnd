import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "/";

    if (!code) {
      return NextResponse.redirect(`${req.nextUrl.origin}/error`);
    }

    const tokenRes = await axios.post(
      process.env.NEXT_PUBLIC_TOKEN_URL!,
      {
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        code,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const redirectTo = `${req.nextUrl.origin}${state}`;

    const response = NextResponse.redirect(redirectTo);
    response.cookies.set("access_token", tokenRes.data.access_token, {
      httpOnly: true,
      secure: false, // set true in production HTTPS
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("OAuth callback error:", err.response?.data || err.message);
    return NextResponse.redirect(`${req.nextUrl.origin}/error`);
  }
}
