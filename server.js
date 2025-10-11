import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const rooms = {}; // { roomCode: { host: socketId, users: [ { id, name } ] } }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // --- Create Room ---
  socket.on("create_room", ({ name }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = { host: socket.id, users: [{ id: socket.id, name }] };
    socket.join(roomCode);
    socket.emit("room_created", { roomCode });
    io.to(roomCode).emit("update_users", { users: rooms[roomCode].users, hostId: rooms[roomCode].host });
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
    io.to(roomCode).emit("update_users", { users: room.users, hostId: room.host });
  });

  // --- Start Game (host only) ---
  socket.on("start_game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("error_message", "Room not found");
    if (room.host !== socket.id) return socket.emit("error_message", "Only the host can start the game");

    // Broadcast that the game has started to all in room
    io.to(roomCode).emit("game_started", { roomCode });
  });

  // --- Disconnect handler ---
  socket.on("disconnect", () => {
    for (const [roomCode, room] of Object.entries(rooms)) {
      // remove user
      room.users = room.users.filter((u) => u.id !== socket.id);

      // if the disconnected socket was the host, promote next user (if any)
      if (room.host === socket.id) {
        if (room.users.length > 0) {
          room.host = room.users[0].id;
        } else {
          // no users left: delete room entirely
          delete rooms[roomCode];
          continue;
        }
      }

      io.to(roomCode).emit("update_users", { users: room.users, hostId: room.host });
    }
  });
});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
