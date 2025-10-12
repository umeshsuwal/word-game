"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSocket } from "@/lib/socket"
import type { Room } from "@/types/game"

export default function CreateGamePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreateRoom = () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    setError("")

    const socket = getSocket()

    socket.emit("create-room", {
      username: username.trim(),
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
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Game</CardTitle>
            <CardDescription>Set up a new game room and invite your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleCreateRoom} disabled={loading} className="w-full" size="lg">
              {loading ? "Creating..." : "Create Room"}
            </Button>

            <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={() => router.push("/")}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
