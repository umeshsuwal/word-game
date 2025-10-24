"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerAvatar } from "@/components/ui/avatar"
import { getSocket, getStoredSocketId } from "@/lib/socket"
import { Copy, Crown } from "lucide-react"
import { toast } from "sonner"
import type { Room } from "@/types/game"

export default function LobbyPage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string

  const [room, setRoom] = useState<Room | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const socket = getSocket()

    const handleConnect = () => {
      setCurrentPlayerId(socket.id || "")
      socket.emit("get-room", { roomCode })
    }

    if (socket.connected) {
      setCurrentPlayerId(socket.id || "")
      socket.emit("get-room", { roomCode })
    } else {
      socket.on("connect", handleConnect)
    }

    socket.on("room-updated", ({ room: updatedRoom }: { room: Room }) => {
      console.log("Room updated:", updatedRoom)
      
      if (room && updatedRoom.players.length < room.players.length) {
        const disconnectedPlayer = room.players.find(
          p => !updatedRoom.players.some(up => up.id === p.id)
        )
        if (disconnectedPlayer) {
          toast("Player left", {
            description: `${disconnectedPlayer.username} has disconnected`,
          })
        }
      }
      
      setRoom(updatedRoom)
      setLoading(false)
    })

    socket.on("room-error", ({ message }: { message: string }) => {
      console.error("Room error:", message)
      setLoading(false)
      toast.error("Room Error", {
        description: message,
      })
    })

    // Listen for game start
    socket.on("game-started", ({ room: startedRoom }: { room: Room }) => {
      console.log("Game started, redirecting to game room")
      router.push(`/game/${roomCode}`)
    })

    return () => {
      socket.off("connect", handleConnect)
      socket.off("room-updated")
      socket.off("room-error")
      socket.off("game-started")
    }
  }, [roomCode, router])

  const handleStartGame = () => {
    if (!room) return

    if (room.players.length < 2) {
      toast("Not enough players", {
        description: "You need at least 2 players to start the game",
      })
      return
    }

    const socket = getSocket()
    socket.emit("start-game", { roomCode })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    toast("Room code copied!", {
      description: "Share this code with your friends to join",
    })
  }

  const isHost = room?.players.find((p) => p.id === currentPlayerId)?.isHost

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p className="text-muted-foreground">Loading lobby...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Room not found</CardTitle>
            <CardDescription>This room doesn't exist or has been closed</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Waiting Lobby</CardTitle>
            <CardDescription>Share the room code with your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="text-3xl font-bold tracking-wider">
                {roomCode}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Players List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Players ({room.players.length}/{room.maxPlayers || 4})
                </span>
                <Badge variant="secondary">
                  {room.players.length < 2 ? "Waiting..." : room.players.length >= (room.maxPlayers || 4) ? "Full" : "Ready"}
                </Badge>
              </div>
              <div className="space-y-2">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PlayerAvatar username={player.username} size={40} />
                      <div>
                        <p className="font-medium">{player.username}</p>
                        {player.id === currentPlayerId && <p className="text-xs text-muted-foreground">You</p>}
                      </div>
                    </div>
                    {player.isHost && (
                      <Badge variant="default" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Start Game Button (Host Only) */}
            {isHost && (
              <Button onClick={handleStartGame} size="lg" className="w-full">
                Start Game
              </Button>
            )}

            {!isHost && (
              <p className="text-center text-sm text-muted-foreground">Waiting for host to start the game...</p>
            )}

            <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={() => router.push("/")}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
