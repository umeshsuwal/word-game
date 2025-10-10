"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-2xl p-10 flex flex-col gap-6 items-center">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Real-Time Room App
        </h1>
        <p className="text-gray-500 text-center max-w-md">
          Create a new room or join an existing one to collaborate in real-time.
        </p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push("/create")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition"
          >
            Create Room
          </button>
          <button
            onClick={() => router.push("/join")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow transition"
          >
            Join Room
          </button>
        </div>
      </div>
      <footer className="absolute bottom-6 text-sm text-gray-400">
        Built with Next.js + Socket.IO
      </footer>
    </div>
  );
}
