"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

export default function JoinRoom() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;
    socket.on("error_message", (msg) => alert(msg));
    socket.on("update_users", () => {
      router.push(`/waitingLobby/${roomCode}?name=${encodeURIComponent(name)}`);
    });
    return () => {
      if (!socket) return;
      socket.off("error_message");
      socket.off("update_users");
    };
  }, [name, roomCode]);

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return alert("Enter both name and room code");
    if (!socket) return alert("Socket not initialized");
    socket.emit("join_room", { name, roomCode });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-semibold text-center text-gray-700">Join a Room</h1>
        <input
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Room code (e.g. ABC123)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          onClick={handleJoin}
        >
          Join Room
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
