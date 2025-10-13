import { createServer } from "http"
import { Server } from "socket.io"
import { networkInterfaces } from "os"
import { GameLogic } from "@/lib/gameLogic"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (for local network access)
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const gameLogic = new GameLogic()
const turnTimers: Map<string, NodeJS.Timeout> = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("create-room", ({ username, customCode }) => {
    const roomCode = customCode || gameLogic.generateRoomCode()
    const room = gameLogic.createRoom(roomCode, socket.id, username)

    socket.join(roomCode)
    socket.emit("room-created", { roomCode, room })
    console.log("Room created:", roomCode)
  })

  socket.on("join-room", ({ roomCode, username }) => {
    const room = gameLogic.joinRoom(roomCode, socket.id, username)

    if (!room) {
      socket.emit("join-error", { message: "Room not found or game already started" })
      return
    }

    socket.join(roomCode)
    io.to(roomCode).emit("room-updated", { room })
    console.log("Player joined room:", roomCode, username)
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
    console.log("Room state requested:", roomCode)
  })

  socket.on("start-game", ({ roomCode }) => {
    const room = gameLogic.startGame(roomCode)

    if (!room) {
      socket.emit("start-error", { message: "Cannot start game" })
      return
    }

    io.to(roomCode).emit("game-started", { room })
    startTurnTimer(roomCode)
    console.log("Game started:", roomCode)
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
      // Invalid word - player loses a life
      const eliminationResult = gameLogic.eliminatePlayer(roomCode, socket.id)
      
      if (eliminationResult) {
        const player = eliminationResult.room.players.find((p) => p.id === socket.id)
        const livesLeft = eliminationResult.livesLeft

        // Emit word error with reason
        io.to(roomCode).emit("word-error", {
          player,
          word: result.word,
          reason: result.reason || "Invalid word",
          livesLeft,
        })

        // If player is eliminated (no lives left), emit elimination event
        if (livesLeft <= 0 && player) {
          io.to(roomCode).emit("player-eliminated", {
            player,
            reason: "No lives remaining",
          })
        }

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
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    // Find and remove player from all rooms
    // In production, you'd track socket-to-room mapping
  })

  function startTurnTimer(roomCode: string) {
    clearTurnTimer(roomCode)

    const timer = setTimeout(() => {
      const room = gameLogic.getRoom(roomCode)
      if (!room || room.gameOver) return

      const currentPlayer = room.players[room.currentPlayerIndex]
      const eliminationResult = gameLogic.eliminatePlayer(roomCode, currentPlayer.id)

      if (eliminationResult) {
        const livesLeft = eliminationResult.livesLeft

        // Emit timeout error
        io.to(roomCode).emit("word-error", {
          player: currentPlayer,
          word: "",
          reason: "Time out",
          livesLeft,
        })

        // If player is eliminated (no lives left), emit elimination event
        if (livesLeft <= 0) {
          io.to(roomCode).emit("player-eliminated", {
            player: currentPlayer,
            reason: "No lives remaining",
          })
        }
      }

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

httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Socket.io server running on:`)
  console.log(`   - Local:   http://localhost:${PORT}`)
  
  // Try to get and display the actual network IP
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    const netInterface = nets[name]
    if (!netInterface) continue
    
    for (const net of netInterface) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        console.log(`   - Network: http://${net.address}:${PORT}`)
      }
    }
  }
  console.log()
})
