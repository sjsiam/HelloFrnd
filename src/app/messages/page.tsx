import { getUser } from "@/src/lib/getUser";

export default async function MessagesPage() {
  const user = await getUser();
  return (
    <div>
      <h1>Private Messages - {user?.name}</h1>
      <p>This content is only visible to logged-in users.</p>
    </div>
  );
}
