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

export default function CreateGamePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [username, setUsername] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-fill username for logged-in users
  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName)
    }
  }, [user])

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    if (maxPlayers < 2 || maxPlayers > 8) {
      setError("Room size must be between 2 and 8 players")
      return
    }

    setLoading(true)
    setError("")

    const socket = getSocket()

    socket.emit("create-room", {
      username: username.trim(),
      maxPlayers,
    })

    socket.once("room-created", ({ roomCode, room }: { roomCode: string; room: Room }) => {
      router.push(`/waitingLobby/${roomCode}`)
    })

    // Handle potential errors
    setTimeout(() => {
      setLoading(false)
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
              <CardTitle className="text-2xl">Create Game</CardTitle>
              <CardDescription>Set up a new game room and invite your friends</CardDescription>
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
              <Label htmlFor="maxPlayers">Room Size (2-8 players)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="maxPlayers"
                  type="number"
                  min="2"
                  max="8"
                  value={maxPlayers}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setMaxPlayers(Math.min(8, Math.max(2, value)))
                    }
                  }}
                  className="w-20"
                />
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map((size, index) => (
                    <motion.div
                      key={size}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant={maxPlayers === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMaxPlayers(size)}
                      >
                        {size}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
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
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button onClick={handleCreateRoom} disabled={loading} className="w-full" size="lg">
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
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
