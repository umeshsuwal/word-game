import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const rooms = {}; // { roomCode: { users: [ { id, name } ] } }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // --- Create Room ---
  socket.on("create_room", ({ name }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = { users: [{ id: socket.id, name }] };
    socket.join(roomCode);
    socket.emit("room_created", { roomCode });
    io.to(roomCode).emit("update_users", rooms[roomCode].users);
  });

  // --- Join Room ---
  socket.on("join_room", ({ name, roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("error_message", "Room not found");

    // prevent duplicates
    if (!room.users.some((u) => u.id === socket.id)) {
      room.users.push({ id: socket.id, name });
    }

    socket.join(roomCode);
    io.to(roomCode).emit("update_users", room.users);
  });

  // --- Disconnect handler ---
  socket.on("disconnect", () => {
    for (const [roomCode, room] of Object.entries(rooms)) {
      room.users = room.users.filter((u) => u.id !== socket.id);
      io.to(roomCode).emit("update_users", room.users);
    }
  });
});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
