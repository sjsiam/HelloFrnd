import PrivateLayout from "@/src/components/common/PrivateLayout";

export default function MessagesPage() {
  return (
    <PrivateLayout>
      <MessagesContent />
    </PrivateLayout>
  );
}

function MessagesContent() {
  return (
    <div>
      <h1>Private Messages</h1>
      <p>This content is only visible to logged-in users.</p>
    </div>
  );
}
