"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayerAvatar } from "@/components/ui/avatar"
import { getSocket } from "@/lib/socket"
import { toast } from "sonner"
import { Volume2, Trophy } from "lucide-react"
import type { Room, Player } from "@/types/game"

export default function GameRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string

  const [room, setRoom] = useState<Room | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [wordInput, setWordInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [showMeaning, setShowMeaning] = useState(false)
  const [currentMeaning, setCurrentMeaning] = useState<{
    word: string
    meaning: string
    phonetic: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const socket = getSocket()

    // Wait for socket connection before setting player ID
    const handleConnect = () => {
      setCurrentPlayerId(socket.id || "")
      // Request current room state once connected
      socket.emit("get-room", { roomCode })
    }

    // If already connected, set immediately
    if (socket.connected) {
      setCurrentPlayerId(socket.id || "")
      socket.emit("get-room", { roomCode })
    } else {
      // Wait for connection
      socket.on("connect", handleConnect)
    }

    // Listen for room updates (initial state)
    socket.on("room-updated", ({ room: updatedRoom }: { room: Room }) => {
      console.log("[v0] Room updated:", updatedRoom)
      setRoom(updatedRoom)
      setLoading(false)
      
      // If game has started, reset the timer
      if (updatedRoom.gameStarted) {
        setTimeLeft(30)
      }
    })

    // Listen for room errors
    socket.on("room-error", ({ message }: { message: string }) => {
      console.error("Room error:", message)
      setLoading(false)
      toast.error("Room Error", {
        description: message,
      })
    })

    // Listen for next turn
    socket.on("next-turn", ({ room: updatedRoom }: { room: Room }) => {
      console.log("[v0] Next turn:", updatedRoom)
      setRoom(updatedRoom)
      setTimeLeft(30)
      setWordInput("")
      setShowMeaning(false)
    })

    // Listen for word results
    socket.on("word-result", ({ success, word, meaning, phonetic, player }: any) => {
      if (success) {
        setCurrentMeaning({ word, meaning, phonetic })
        setShowMeaning(true)

        // Pronounce the word
        if ("speechSynthesis" in window && phonetic) {
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.rate = 0.8
          window.speechSynthesis.speak(utterance)
        }

        toast(`${player.username} scored!`, {
          description: `"${word}" is valid! +${word.length} points`,
        })
      }
    })

    // Listen for player elimination
    socket.on("player-eliminated", ({ player, reason }: { player: Player; reason: string }) => {
      toast(`${player.username} eliminated!`, {
        description: reason,
      })
    })

    // Listen for game over
    socket.on("game-over", ({ room: finalRoom }: { room: Room }) => {
      console.log("[v0] Game over, redirecting to results")
      router.push(`/results/${roomCode}`)
    })

    return () => {
      socket.off("connect", handleConnect)
      socket.off("room-updated")
      socket.off("room-error")
      socket.off("next-turn")
      socket.off("word-result")
      socket.off("player-eliminated")
      socket.off("game-over")
    }
  }, [roomCode, router])

  // Timer countdown
  useEffect(() => {
    if (!room || !room.gameStarted || showMeaning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [room, showMeaning])

  const handleSubmitWord = () => {
    if (!wordInput.trim()) return

    const socket = getSocket()
    socket.emit("submit-word", {
      roomCode,
      word: wordInput.trim(),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitWord()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
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

  if (!room.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    )
  }

  if (!room.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-6 space-y-4">
            <p className="text-center text-muted-foreground">Game hasn't started yet</p>
            <Button className="w-full" onClick={() => router.push(`/waitingLobby/${roomCode}`)}>
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlayer = room.players[room.currentPlayerIndex]
  const isMyTurn = currentPlayer?.id === currentPlayerId
  const alivePlayers = room.players.filter((p) => p.isAlive)
  const progressPercentage = (timeLeft / 30) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Room: {roomCode}</h1>
            <p className="text-sm text-muted-foreground">{alivePlayers.length} players remaining</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {timeLeft}s
          </Badge>
        </div>

        {/* Timer Progress */}
        <Progress value={progressPercentage} className="h-2" />

        {/* Current Letter Display */}
        <Card className="border-4 border-primary">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                {room.lastWord ? `Last word: "${room.lastWord}" - Start with` : "Current Letter"}
              </p>
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {room.currentLetter}
              </div>
              <p className="text-xl font-medium">{isMyTurn ? "Your turn!" : `${currentPlayer?.username}'s turn`}</p>
            </div>
          </CardContent>
        </Card>

        {/* Word Meaning Display */}
        {showMeaning && currentMeaning && (
          <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="py-6 space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{currentMeaning.word}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if ("speechSynthesis" in window) {
                      const utterance = new SpeechSynthesisUtterance(currentMeaning.word)
                      utterance.rate = 0.8
                      window.speechSynthesis.speak(utterance)
                    }
                  }}
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
              {currentMeaning.phonetic && (
                <p className="text-center text-sm text-muted-foreground">{currentMeaning.phonetic}</p>
              )}
              <p className="text-center text-green-800 dark:text-green-200">{currentMeaning.meaning}</p>
            </CardContent>
          </Card>
        )}

        {/* Used Words List */}
        {room.usedWords.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Words Used ({room.usedWords.length}):</h3>
                <div className="flex flex-wrap gap-2">
                  {room.usedWords.map((word, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word Input (only for current player) */}
        {isMyTurn && !showMeaning && (
          <Card>
            <CardContent className="py-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Type a word starting with "${room.currentLetter}"...`}
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                  autoFocus
                />
                <Button onClick={handleSubmitWord} size="lg">
                  Submit
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Word must start with <span className="font-bold text-foreground">{room.currentLetter}</span>. Press Enter to submit.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                    player.isAlive
                      ? player.id === currentPlayer?.id
                        ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                        : "bg-muted/50"
                      : "bg-destructive/10 opacity-50"
                  }`}
                >
                  <div className="relative">
                    <PlayerAvatar username={player.username} size={32} />
                    {!player.isAlive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <span className="text-white text-xs font-bold">✕</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{player.username}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Trophy className="w-3 h-3" />
                      <span>{player.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
