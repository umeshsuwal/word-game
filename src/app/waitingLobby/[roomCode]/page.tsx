"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function WaitingLobby() {
  const { roomCode } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") ?? "";
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_room", { name, roomCode }); // ensure rejoin if refreshed

    // Handler that deduplicates users by id before updating state
    const handleUpdateUsers = (incoming: { id: string; name: string }[]) => {
      if (!Array.isArray(incoming)) return;
      const seen = new Set<string>();
      const deduped = incoming.filter((u) => {
        if (!u || typeof u.id !== "string") return false;
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
      setUsers(deduped);
    };

    socket.on("update_users", handleUpdateUsers);
    socket.on("error_message", (msg: string) => alert(msg));
    return () => {
      if (!socket) return;
      socket.off("update_users", handleUpdateUsers);
      socket.off("error_message");
    };
  }, [name, roomCode]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center gap-6 w-96">
        <h1 className="text-2xl font-bold text-gray-800">Room: {roomCode}</h1>
        <h2 className="text-lg text-gray-600">Players Joined</h2>

        <ul className="w-full border rounded-lg overflow-hidden">
          {users.map((u) => (
            <li
              key={u.id}
              className="border-b last:border-b-0 text-center py-2 text-gray-700"
            >
              {u.name}
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-400">
          Share this code with friends: <span className="font-semibold">{roomCode}</span>
        </p>

        <button
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={() => router.push("/")}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
