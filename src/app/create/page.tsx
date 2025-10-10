"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function CreateRoom() {
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleRoomCreated = ({ roomCode }: { roomCode: string }) => {
      router.push(`/waitingLobby/${roomCode}?name=${encodeURIComponent(name)}`);
    };

    if (!socket) return;
    socket.on("room_created", handleRoomCreated);

    return () => {
      if (!socket) return;
      socket.off("room_created", handleRoomCreated);
    };
  }, [name, router]);

  const handleCreate = () => {
    if (!name.trim()) return alert("Please enter your name");
    if (!socket) return alert("Socket not initialized");
    socket.emit("create_room", { name });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-semibold text-center text-gray-700">
          Create a Room
        </h1>
        <input
          className="border border-gray-300 rounded-lg text-black p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          onClick={handleCreate}
        >
          Create Room
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-700 text-sm mt-2"
        >
          Back
        </button>
      </div>
    </div>
  );
}
