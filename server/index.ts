import { createServer } from "http"
import { Server } from "socket.io"
import { networkInterfaces } from "os"
import { GameLogic } from "../src/lib/gameLogic.js"

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
const socketRoomMap: Map<string, string> = new Map() // Track socket to room mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Check for reconnection
  socket.on("check-reconnection", ({ oldSocketId }) => {
    if (oldSocketId && gameLogic.wasPlayerInRoom(oldSocketId)) {
      const playerInfo = gameLogic.getPlayerLastRoom(oldSocketId)
      if (playerInfo) {
        socket.emit("reconnection-available", {
          roomCode: playerInfo.roomCode,
          username: playerInfo.username,
        })
        console.log("Reconnection available for:", oldSocketId, "->", socket.id)
      }
    }
  })

  // Handle reconnection to a room
  socket.on("rejoin-room", ({ roomCode, oldSocketId }) => {
    const room = gameLogic.rejoinRoom(roomCode, oldSocketId, socket.id)

    if (!room) {
      socket.emit("rejoin-error", { message: "Unable to rejoin room" })
      return
    }

    socket.join(roomCode)
    socketRoomMap.set(socket.id, roomCode)
    socketRoomMap.delete(oldSocketId) // Clean up old socket mapping
    
    // Notify the rejoined player
    socket.emit("rejoined-room", { room })
    
    // Notify other players in the room
    socket.to(roomCode).emit("player-reconnected", {
      playerId: socket.id,
      username: room.players.find((p) => p.id === socket.id)?.username,
    })
    
    console.log("Player rejoined room:", roomCode, socket.id)
  })

  socket.on("create-room", ({ username }) => {
    const roomCode = gameLogic.generateRoomCode()
    const room = gameLogic.createRoom(roomCode, socket.id, username)

    socket.join(roomCode)
    socketRoomMap.set(socket.id, roomCode) // Track socket to room
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
    socketRoomMap.set(socket.id, roomCode) // Track socket to room
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

    // Get the room code for this socket
    const roomCode = socketRoomMap.get(socket.id)
    
    if (roomCode) {
      const room = gameLogic.getRoom(roomCode)
      
      if (room) {
        // If game hasn't started, remove player immediately
        if (!room.gameStarted) {
          const updatedRoom = gameLogic.removePlayer(roomCode, socket.id)
          
          if (updatedRoom) {
            io.to(roomCode).emit("room-updated", { room: updatedRoom })
            console.log("Player removed from lobby:", roomCode)
          } else {
            console.log("Room deleted (empty):", roomCode)
          }
          
          socketRoomMap.delete(socket.id)
        } else {
          // Game is in progress - notify players and wait for reconnection
          const player = room.players.find((p) => p.id === socket.id)
          
          if (player) {
            io.to(roomCode).emit("player-disconnected", {
              playerId: socket.id,
              username: player.username,
            })
            
            console.log("Player disconnected during game:", socket.id, "Room:", roomCode)
            
            // Set a timeout to remove player after 60 seconds if they don't reconnect
            setTimeout(() => {
              // Check if player has reconnected (socket ID changed)
              const currentRoom = gameLogic.getRoom(roomCode)
              if (currentRoom) {
                const stillDisconnected = currentRoom.players.some((p) => p.id === socket.id)
                
                if (stillDisconnected) {
                  const finalRoom = gameLogic.removePlayer(roomCode, socket.id)
                  
                  if (finalRoom) {
                    io.to(roomCode).emit("room-updated", { room: finalRoom })
                    io.to(roomCode).emit("player-removed", {
                      username: player.username,
                      reason: "Failed to reconnect",
                    })
                    console.log("Player permanently removed after timeout:", socket.id)
                  } else {
                    console.log("Room deleted (empty):", roomCode)
                  }
                  
                  socketRoomMap.delete(socket.id)
                }
              }
            }, 60000) // 60 second timeout
          }
        }
      }
    }
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
