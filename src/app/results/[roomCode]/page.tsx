"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const { roomCode } = useParams();
  const router = useRouter();

  useEffect(() => {
    // placeholder: you can fetch game state here or initialize client-side game logic
    if (!roomCode) router.push("/");
  }, [roomCode, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold">Result {roomCode}</h1>
        <p className="text-sm text-gray-500 mt-2">Game content goes here.</p>
      </div>
    </div>
  );
}
