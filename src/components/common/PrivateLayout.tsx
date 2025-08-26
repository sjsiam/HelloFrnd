import { getUser } from "@lib/getUser";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // If not logged in, redirect to OAuth login
  if (!user) {
    const authorizeUrl = process.env.NEXT_PUBLIC_AUTHORIZE_URL!;
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_REDIRECT_URI!
    );
    const state = encodeURIComponent("/"); // you can also preserve requested page
    redirect(
      `${authorizeUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=&state=${state}`
    );
  }

  return <>{children}</>;
}
