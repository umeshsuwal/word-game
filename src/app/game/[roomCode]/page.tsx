"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getSocket, getStoredSocketId } from "@/lib/socket"
import { useAuth } from "@/contexts/AuthContext"
import { HistoryService } from "@/lib/historyService"
import { toast } from "sonner"
import type { Room, Player } from "@/types/game"
import { GameHeader } from "@/components/game/GameHeader"
import { CurrentLetterDisplay } from "@/components/game/CurrentLetterDisplay"
import { WordMeaningDisplay } from "@/components/game/WordMeaningDisplay"
import { UsedWordsList } from "@/components/game/UsedWordsList"
import { WordInputForm } from "@/components/game/WordInputForm"
import { PlayersList } from "@/components/game/PlayersList"

export default function GameRoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomCode = params.roomCode as string
  const { user } = useAuth()

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
    const oldSocketId = getStoredSocketId()

    // Wait for socket connection before setting player ID
    const handleConnect = () => {
      setCurrentPlayerId(socket.id || "")
      
      // Check if this is a reconnection
      if (oldSocketId && oldSocketId !== socket.id) {
        socket.emit("check-reconnection", { oldSocketId })
        
        // Listen for reconnection availability
        socket.once("reconnection-available", ({ roomCode: reconnectRoomCode }) => {
          if (reconnectRoomCode === roomCode) {
            // Attempt to rejoin the room
            socket.emit("rejoin-room", { roomCode, oldSocketId })
            toast.info("Reconnecting to game...")
          } else {
            // Not the same room, proceed normally
            socket.emit("get-room", { roomCode })
          }
        })
        
        // If no reconnection available, proceed normally
        setTimeout(() => {
          socket.emit("get-room", { roomCode })
        }, 1000)
      } else {
        // Normal connection - request room state
        socket.emit("get-room", { roomCode })
      }
    }

    // If already connected, set immediately
    if (socket.connected) {
      setCurrentPlayerId(socket.id || "")
      const oldSocketId = getStoredSocketId()
      
      if (oldSocketId && oldSocketId !== socket.id) {
        socket.emit("check-reconnection", { oldSocketId })
        
        socket.once("reconnection-available", ({ roomCode: reconnectRoomCode }) => {
          if (reconnectRoomCode === roomCode) {
            socket.emit("rejoin-room", { roomCode, oldSocketId })
            toast.info("Reconnecting to game...")
          } else {
            socket.emit("get-room", { roomCode })
          }
        })
        
        setTimeout(() => {
          socket.emit("get-room", { roomCode })
        }, 1000)
      } else {
        socket.emit("get-room", { roomCode })
      }
    } else {
      // Wait for connection
      socket.on("connect", handleConnect)
    }

    // Listen for successful reconnection
    socket.on("rejoined-room", ({ room: reconnectedRoom }: { room: Room }) => {
      console.log("[v0] Successfully rejoined room:", reconnectedRoom)
      setRoom(reconnectedRoom)
      setLoading(false)
      setCurrentPlayerId(socket.id || "")
      toast.success("Reconnected to game!")
      
      if (reconnectedRoom.gameStarted) {
        setTimeLeft(30)
      }
    })

    // Listen for other players reconnecting
    socket.on("player-reconnected", ({ username }: { playerId: string; username: string }) => {
      toast.info(`${username} reconnected`)
    })

    // Listen for players disconnecting
    socket.on("player-disconnected", ({ username }: { playerId: string; username: string }) => {
      toast.warning(`${username} disconnected`)
    })

    // Listen for players being removed
    socket.on("player-removed", ({ username, reason }: { username: string; reason: string }) => {
      toast.error(`${username} removed: ${reason}`)
    })

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

        // Save word history for authenticated users
        if (user && player.id === socket.id) {
          HistoryService.saveWordHistory(user.uid, {
            word,
            meaning,
            userName: player.username,
            roomCode,
            score: word.length,
          }).catch((error) => {
            console.error("Failed to save word history:", error)
          })
        }

        // Pronounce the word
        if ("speechSynthesis" in window && phonetic) {
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.rate = 0.8
          window.speechSynthesis.speak(utterance)
        }

        toast.success(`${player.username} scored!`, {
          description: `"${word}" is valid! +${word.length} points`,
        })
      }
    })

    socket.on("word-error", ({ player, word, reason, livesLeft }: any) => {
      const isMe = player.id === socket.id
      
      toast.error(`${isMe ? "Your" : player.username + "'s"} word "${word}" is invalid!`, {
        description: `${reason}. ${livesLeft > 0 ? `${livesLeft} life/lives remaining` : "Eliminated!"}`,
        duration: 3000,
      })
    })

    socket.on("player-eliminated", ({ player, reason }: { player: Player; reason: string }) => {
      toast.error(`${player.username} eliminated!`, {
        description: reason,
        duration: 3000,
      })
    })

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
      socket.off("word-error")
      socket.off("player-eliminated")
      socket.off("game-over")
      socket.off("rejoined-room")
      socket.off("player-reconnected")
      socket.off("player-disconnected")
      socket.off("player-removed")
    }
  }, [roomCode, router])

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
        <GameHeader roomCode={roomCode} alivePlayers={alivePlayers.length} timeLeft={timeLeft} gameMode={room.gameMode} />

        <Progress value={progressPercentage} className="h-2" />

        <CurrentLetterDisplay
          currentLetter={room.currentLetter}
          lastWord={room.lastWord}
          currentPlayerName={currentPlayer?.username || ""}
          isMyTurn={isMyTurn}
        />

        {showMeaning && currentMeaning && (
          <WordMeaningDisplay
            word={currentMeaning.word}
            meaning={currentMeaning.meaning}
            phonetic={currentMeaning.phonetic}
          />
        )}

        <UsedWordsList usedWords={room.usedWords} />

        {isMyTurn && !showMeaning && (
          <WordInputForm
            currentLetter={room.currentLetter}
            wordInput={wordInput}
            onWordInputChange={setWordInput}
            onSubmit={handleSubmitWord}
            onKeyPress={handleKeyPress}
          />
        )}

        <PlayersList players={room.players} currentPlayerId={currentPlayer?.id || ""} />
      </div>
    </div>
  )
}
