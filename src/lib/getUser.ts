import { cookies } from "next/headers";
import axios from "axios";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await axios.get(process.env.NEXT_PUBLIC_USER_URL!, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    return null;
  }
}
