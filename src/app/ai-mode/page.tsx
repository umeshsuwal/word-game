"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useAIGame } from "@/hooks/useAIGame"
import { AILoadingScreen,  AIGameOverScreen,  AIGameHeader,  AIGameBoard } from "@/components/ai-mode"
import { PlayersList } from "@/components/game/PlayersList"
import { UsedWordsList } from "@/components/game/UsedWordsList"
import { AIPlayer } from "@/lib/aiLogic"

export default function AIMod() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    gameStarted,
    room,
    wordInput,
    setWordInput,
    timeLeft,
    showMeaning,
    currentMeaning,
    isAIThinking,
    handleSubmitWord,
    handlePlayAgain,
    handleLeaveGame,
    handleKeyPress,
    TURN_TIME,
  } = useAIGame(user)

  useEffect(() => {
    if (user === null) {
      router.push("/")
    }
  }, [user, router])

  // Prefetch word dictionary for better AI performance
  useEffect(() => {
    AIPlayer.prefetchDictionary()
  }, [])

  if (user === undefined) {
    return <AILoadingScreen isCheckingAuth={true} />
  }

  if (user === null) {
    return <AILoadingScreen isCheckingAuth={true} />
  }

  if (user && !gameStarted) {
    return <AILoadingScreen isCheckingAuth={false} />
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    )
  }

  // Show game over screen
  if (room.gameOver && room.winner) {
    return (
      <AIGameOverScreen
        winner={room.winner}
        players={room.players}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleLeaveGame}
      />
    )
  }

  const currentPlayer = room.players[room.currentPlayerIndex]
  const isMyTurn = currentPlayer.id === "human"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <AIGameHeader onLeave={handleLeaveGame} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Players */}
          <div className="space-y-4">
            <PlayersList 
              players={room.players} 
              currentPlayerId={currentPlayer.id}
            />
            {room.usedWords.length > 0 && <UsedWordsList usedWords={room.usedWords} />}
          </div>

          {/* Center Column - Game */}
          <AIGameBoard
            currentLetter={room.currentLetter}
            lastWord={room.lastWord}
            currentPlayerName={currentPlayer.username}
            isMyTurn={isMyTurn}
            timeLeft={timeLeft}
            turnTime={TURN_TIME}
            isAIThinking={isAIThinking}
            showMeaning={showMeaning}
            currentMeaning={currentMeaning}
            wordInput={wordInput}
            onWordInputChange={setWordInput}
            onSubmit={handleSubmitWord}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>
    </div>
  )
}
