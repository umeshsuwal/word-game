"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getSocket } from "@/lib/socket"
import { useAuth } from "@/contexts/AuthContext"
import { HistoryService } from "@/lib/historyService"
import { Home } from "lucide-react"
import type { Room } from "@/types/game"
import { WinnerCard } from "@/components/results/WinnerCard"
import { Leaderboard } from "@/components/results/Leaderboard"

export default function ResultPage() {
  const { roomCode } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [historySaved, setHistorySaved] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    const handleConnect = () => {
      socket.emit("get-room", { roomCode })
    }

    if (socket.connected) {
      socket.emit("get-room", { roomCode })
    } else {
      socket.on("connect", handleConnect)
    }

    socket.on("room-updated", ({ room: updatedRoom }: { room: Room }) => {
      console.log("Results - Room data:", updatedRoom)
      setRoom(updatedRoom)
      setLoading(false)
    })

    socket.on("room-error", () => {
      setLoading(false)
    })

    return () => {
      socket.off("connect", handleConnect)
      socket.off("room-updated")
      socket.off("room-error")
    }
  }, [roomCode])

  useEffect(() => {
    if (!room || !user || historySaved) return

    const saveHistory = async () => {
      try {
        const socket = getSocket()
        const currentPlayer = room.players.find((p) => p.id === socket.id)
        
        if (!currentPlayer) return

        const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score)
        const rank = sortedPlayers.findIndex((p) => p.id === currentPlayer.id) + 1
        const isWinner = rank === 1

        await HistoryService.saveGameHistory(user.uid, {
          roomCode: room.code,
          playerName: currentPlayer.username,
          playerEmail: user.email,
          score: currentPlayer.score,
          rank,
          isWinner,
          wordsUsed: room.usedWords,
          totalPlayers: room.players.length,
        })

        setHistorySaved(true)
        console.log("Game history saved successfully")
      } catch (error) {
        console.error("Failed to save game history:", error)
      }
    }

    saveHistory()
  }, [room, user, historySaved])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-6 space-y-4">
            <p className="text-center text-muted-foreground">Room not found</p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score)
  const winner = room.winner || sortedPlayers[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WinnerCard winner={winner} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Leaderboard players={room.players} roomCode={roomCode as string} />
        </motion.div>

        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.div 
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button onClick={() => router.push("/")} size="lg" className="w-full gap-2">
              <Home className="w-5 h-5" />
              Home
            </Button>
          </motion.div>
          <motion.div 
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button onClick={() => router.push("/create")} variant="outline" size="lg" className="w-full">
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
