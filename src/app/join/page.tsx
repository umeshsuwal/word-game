"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSocket } from "@/lib/socket"
import { useAuth } from "@/contexts/AuthContext"
import type { Room } from "@/types/game"

export default function JoinGamePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-fill username for logged-in users
  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName)
    }
  }, [user])

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setLoading(true)
    setError("")

    const socket = getSocket()

    socket.emit("join-room", {
      roomCode: roomCode.trim().toUpperCase(),
      username: username.trim(),
    })

    socket.once("room-updated", ({ room }: { room: Room }) => {
      router.push(`/waitingLobby/${room.code}`)
    })

    socket.once("join-error", ({ message }: { message: string }) => {
      setError(message)
      setLoading(false)
    })

    // Timeout fallback
    setTimeout(() => {
      if (loading) {
        setError("Failed to join room. Please check the room code.")
        setLoading(false)
      }
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <CardTitle className="text-2xl">Join Game</CardTitle>
              <CardDescription>Enter the room code to join an existing game</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </motion.div>
            )}

            {user && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label>Playing as</Label>
                <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                  {user.displayName || user.email}
                </div>
              </motion.div>
            )}

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="Enter 6-character code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </motion.div>

            {error && (
              <motion.p 
                className="text-sm text-destructive"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={handleJoinRoom} disabled={loading} className="w-full" size="lg">
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={() => router.push("/")}>
                Back
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
