import Link from "next/link";


export default function Home() {

  return (
    <main className="m-5">
      <div className="flex overflow-y-hidden h-[calc(100vh-50px)] max-w-[1700px] mx-auto bg-left-panel">
        {/* Green background decorator for Light Mode */}
        <div className="fixed top-0 left-0 w-full h-36 bg-green-primary dark:bg-transparent -z-30" />
        <Link href="/messages" className="m-auto">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition">
            Messages
          </button>
        </Link>
      </div>
    </main>
  );
}
