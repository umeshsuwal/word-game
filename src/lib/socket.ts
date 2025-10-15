"use client"

import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null
const STORAGE_KEY = "word-game-socket-id"

// Store socket ID for reconnection
const storeSocketId = (socketId: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, socketId)
  }
}

// Retrieve stored socket ID
export const getStoredSocketId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY)
  }
  return null
}

// Clear stored socket ID
const clearStoredSocketId = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      autoConnect: true,
    })

    // Store socket ID when connected
    socket.on("connect", () => {
      if (socket?.id) {
        storeSocketId(socket.id)
      }
    })

    // Clean up on intentional disconnect
    socket.on("disconnect", (reason) => {
      // Only clear if it's an intentional disconnect by the client
      if (reason === "io client disconnect") {
        clearStoredSocketId()
      }
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    clearStoredSocketId()
    socket.disconnect()
    socket = null
  }
}
