import { createServer } from "http"
import { Server } from "socket.io"
import { GameLogic } from "@/lib/gameLogic"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const gameLogic = new GameLogic()
const turnTimers: Map<string, NodeJS.Timeout> = new Map()

io.on("connection", (socket) => {
  console.log("[v0] User connected:", socket.id)

  socket.on("create-room", ({ username, customCode }) => {
    const roomCode = customCode || gameLogic.generateRoomCode()
    const room = gameLogic.createRoom(roomCode, socket.id, username)

    socket.join(roomCode)
    socket.emit("room-created", { roomCode, room })
    console.log("[v0] Room created:", roomCode)
  })

  socket.on("join-room", ({ roomCode, username }) => {
    const room = gameLogic.joinRoom(roomCode, socket.id, username)

    if (!room) {
      socket.emit("join-error", { message: "Room not found or game already started" })
      return
    }

    socket.join(roomCode)
    io.to(roomCode).emit("room-updated", { room })
    console.log("[v0] Player joined room:", roomCode, username)
  })

  socket.on("get-room", ({ roomCode }) => {
    const room = gameLogic.getRoom(roomCode)

    if (!room) {
      socket.emit("room-error", { message: "Room not found" })
      return
    }

    // Ensure socket is in the room
    socket.join(roomCode)
    socket.emit("room-updated", { room })
    console.log("[v0] Room state requested:", roomCode)
  })

  socket.on("start-game", ({ roomCode }) => {
    const room = gameLogic.startGame(roomCode)

    if (!room) {
      socket.emit("start-error", { message: "Cannot start game" })
      return
    }

    io.to(roomCode).emit("game-started", { room })
    startTurnTimer(roomCode)
    console.log("[v0] Game started:", roomCode)
  })

  socket.on("submit-word", async ({ roomCode, word }) => {
    const result = await gameLogic.validateWord(roomCode, word, socket.id)
    const room = gameLogic.getRoom(roomCode)

    if (!room) return

    if (result.valid) {
      io.to(roomCode).emit("word-result", {
        success: true,
        word: result.word,
        meaning: result.meaning,
        phonetic: result.phonetic,
        player: room.players.find((p) => p.id === socket.id),
      })

      // Clear timer and move to next turn
      clearTurnTimer(roomCode)
      setTimeout(() => {
        const updatedRoom = gameLogic.nextTurn(roomCode)
        if (updatedRoom) {
          if (updatedRoom.gameOver) {
            io.to(roomCode).emit("game-over", { room: updatedRoom })
          } else {
            io.to(roomCode).emit("next-turn", { room: updatedRoom })
            startTurnTimer(roomCode)
          }
        }
      }, 6000) // Show meaning for 6 seconds
    } else {
      // Invalid word - eliminate player
      gameLogic.eliminatePlayer(roomCode, socket.id)
      const player = room.players.find((p) => p.id === socket.id)

      io.to(roomCode).emit("player-eliminated", {
        player,
        reason: "Invalid word",
      })

      clearTurnTimer(roomCode)
      setTimeout(() => {
        const updatedRoom = gameLogic.nextTurn(roomCode)
        if (updatedRoom) {
          if (updatedRoom.gameOver) {
            io.to(roomCode).emit("game-over", { room: updatedRoom })
          } else {
            io.to(roomCode).emit("next-turn", { room: updatedRoom })
            startTurnTimer(roomCode)
          }
        }
      }, 3000)
    }
  })

  socket.on("disconnect", () => {
    console.log("[v0] User disconnected:", socket.id)

    // Find and remove player from all rooms
    // In production, you'd track socket-to-room mapping
  })

  function startTurnTimer(roomCode: string) {
    clearTurnTimer(roomCode)

    const timer = setTimeout(() => {
      const room = gameLogic.getRoom(roomCode)
      if (!room || room.gameOver) return

      const currentPlayer = room.players[room.currentPlayerIndex]
      gameLogic.eliminatePlayer(roomCode, currentPlayer.id)

      io.to(roomCode).emit("player-eliminated", {
        player: currentPlayer,
        reason: "Time out",
      })

      setTimeout(() => {
        const updatedRoom = gameLogic.nextTurn(roomCode)
        if (updatedRoom) {
          if (updatedRoom.gameOver) {
            io.to(roomCode).emit("game-over", { room: updatedRoom })
          } else {
            io.to(roomCode).emit("next-turn", { room: updatedRoom })
            startTurnTimer(roomCode)
          }
        }
      }, 3000)
    }, gameLogic.getTurnTime() * 1000)

    turnTimers.set(roomCode, timer)
  }

  function clearTurnTimer(roomCode: string) {
    const timer = turnTimers.get(roomCode)
    if (timer) {
      clearTimeout(timer)
      turnTimers.delete(roomCode)
    }
  }
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
