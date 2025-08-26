import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const res = await axios.get(process.env.NEXT_PUBLIC_USER_URL!, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
