import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Room, Player } from "@/types/game"
import type { User } from "firebase/auth"
import { useGameState } from "./useGameState"
import { useGameTimer } from "./useGameTimer"
import { useAITurn } from "./useAITurn"
import { useWordSubmission } from "./useWordSubmission"

export function useAIGame(user: User | null | undefined) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const hasStartedGame = useRef(false)

  const gameState = useGameState()
  const aiTurn = useAITurn()
  const wordSubmission = useWordSubmission(user)

  const handleAITurnRef = useRef<((room: Room) => void) | null>(null)
  
  const timer = useGameTimer(() => handleTimeout())

  const showGameOverScreen = useCallback((winner: Player) => {
    toast.success("Game Over!", {
      description: `${winner.username} wins!`,
      duration: 5000,
    })

    setTimeout(() => router.push("/"), 5000)
  }, [router])

  const handlePlayerLoseLife = useCallback((playerId: string, reason: string) => {
    if (!gameState.room) return

    gameState.updatePlayerLife(playerId)

    if (gameState.room.gameOver && gameState.room.winner) {
      timer.stopTimer()
      const winner = gameState.room.winner
      setTimeout(() => {
        showGameOverScreen(winner)
      }, 3000)
    }
  }, [gameState, timer, showGameOverScreen])

  const handleTimeout = useCallback(() => {
    timer.stopTimer()
    if (!gameState.room || gameState.showMeaning) return

    const currentPlayer = gameState.room.players[gameState.room.currentPlayerIndex]
    
    handlePlayerLoseLife(currentPlayer.id, "Time out")
    
    if (!currentPlayer.isAI) {
      toast.error("Time's up!", {
        description: "You ran out of time!",
      })
    }

    setTimeout(() => {
      if (!gameState.room) return

      const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
      if (alivePlayers.length === 1) {
        showGameOverScreen(alivePlayers[0])
        return
      }

      timer.resetTimer()

      gameState.moveToNextTurn(gameState.room.currentLetter, (updatedRoom) => {
        console.log("=== After moveToNextTurn callback (timeout) ===")
        console.log("Updated room currentPlayerIndex:", updatedRoom.currentPlayerIndex)
        console.log("Is AI turn?", updatedRoom.players[updatedRoom.currentPlayerIndex].isAI)
        
        if (updatedRoom.players[updatedRoom.currentPlayerIndex].isAI && handleAITurnRef.current) {
          console.log("Calling AI turn after timeout")
          handleAITurnRef.current(updatedRoom)
        } else {
          timer.startTimer()
        }
      })
    }, 3000)
  }, [timer, gameState, handlePlayerLoseLife, showGameOverScreen])

  const handleAITurn = useCallback(async (currentRoom: Room) => {
    const currentPlayer = currentRoom.players[currentRoom.currentPlayerIndex]

    await aiTurn.processAITurn(
      currentRoom,
      (word, meaning, phonetic) => {
        gameState.setCurrentMeaning({ word, meaning, phonetic })
        gameState.setShowMeaning(true)
        gameState.updateRoomWithWord(word, currentPlayer.id)

        setTimeout(() => {
          gameState.setShowMeaning(false)
          aiTurn.completeAITurn()

          if (!gameState.room) return

          const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            timer.stopTimer()
            showGameOverScreen(alivePlayers[0])
            return
          }

          const nextLetter = word.charAt(word.length - 1).toUpperCase()
          timer.resetTimer()

          gameState.moveToNextTurn(nextLetter, (updatedRoom) => {
            console.log("=== After moveToNextTurn callback (AI success) ===")
            console.log("Updated room currentPlayerIndex:", updatedRoom.currentPlayerIndex)
            console.log("Is AI turn?", updatedRoom.players[updatedRoom.currentPlayerIndex].isAI)
            
            if (updatedRoom.players[updatedRoom.currentPlayerIndex].isAI && handleAITurnRef.current) {
              console.log("Calling AI turn after AI success (consecutive AI)")
              handleAITurnRef.current(updatedRoom)
            } else {
              timer.startTimer()
            }
          })
        }, 6000)
      },
      (reason) => {
        handlePlayerLoseLife(currentPlayer.id, reason)

        setTimeout(() => {
          if (!gameState.room) return

          const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            timer.stopTimer()
            showGameOverScreen(alivePlayers[0])
            return
          }

          timer.resetTimer()
          
          gameState.moveToNextTurn(gameState.room.currentLetter, (updatedRoom) => {
            console.log("=== After moveToNextTurn callback (AI failure) ===")
            console.log("Updated room currentPlayerIndex:", updatedRoom.currentPlayerIndex)
            console.log("Is AI turn?", updatedRoom.players[updatedRoom.currentPlayerIndex].isAI)
            
            if (updatedRoom.players[updatedRoom.currentPlayerIndex].isAI && handleAITurnRef.current) {
              console.log("Calling AI turn after AI failure")
              handleAITurnRef.current(updatedRoom)
            } else {
              timer.startTimer()
            }
          })
        }, 3000)
      },
      () => {
        handlePlayerLoseLife(currentPlayer.id, "Couldn't find a word")

        setTimeout(() => {
          if (!gameState.room) return

          const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            showGameOverScreen(alivePlayers[0])
            return
          }

          gameState.moveToNextTurn(gameState.room.currentLetter)
          timer.resetTimer()
          timer.startTimer()
        }, 3000)
      }
    )
  }, [aiTurn, gameState, timer, handlePlayerLoseLife, showGameOverScreen])

  handleAITurnRef.current = handleAITurn

  const handleSubmitWord = useCallback(async () => {
    if (!gameState.room || gameState.showMeaning) return

    timer.stopTimer()
    const currentPlayer = gameState.room.players[gameState.room.currentPlayerIndex]

    await wordSubmission.submitWord(
      gameState.room,
      (word, meaning, phonetic) => {
        gameState.setCurrentMeaning({ word, meaning, phonetic })
        gameState.setShowMeaning(true)
        gameState.updateRoomWithWord(word, currentPlayer.id)

        setTimeout(() => {
          gameState.setShowMeaning(false)

          if (!gameState.room) return

          const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            timer.stopTimer()
            showGameOverScreen(alivePlayers[0])
            return
          }

          const nextLetter = word.charAt(word.length - 1).toUpperCase()
          timer.resetTimer()
          
          gameState.moveToNextTurn(nextLetter, (updatedRoom) => {
            console.log("=== After moveToNextTurn callback (human success) ===")
            console.log("Updated room currentPlayerIndex:", updatedRoom.currentPlayerIndex)
            console.log("Is AI turn?", updatedRoom.players[updatedRoom.currentPlayerIndex].isAI)
            
            if (updatedRoom.players[updatedRoom.currentPlayerIndex].isAI && handleAITurnRef.current) {
              console.log("Calling AI turn after human success")
              handleAITurnRef.current(updatedRoom)
            } else {
              timer.startTimer()
            }
          })
        }, 6000)
      },
      (reason) => {
        handlePlayerLoseLife(currentPlayer.id, reason)

        setTimeout(() => {
          if (!gameState.room) return

          const alivePlayers = gameState.room.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            timer.stopTimer()
            showGameOverScreen(alivePlayers[0])
            return
          }

          timer.resetTimer()
          
          gameState.moveToNextTurn(gameState.room.currentLetter, (updatedRoom) => {
            console.log("=== After moveToNextTurn callback (human failure) ===")
            console.log("Updated room currentPlayerIndex:", updatedRoom.currentPlayerIndex)
            console.log("Is AI turn?", updatedRoom.players[updatedRoom.currentPlayerIndex].isAI)
            
            if (updatedRoom.players[updatedRoom.currentPlayerIndex].isAI && handleAITurnRef.current) {
              console.log("Calling AI turn after human failure")
              handleAITurnRef.current(updatedRoom)
            } else {
              timer.startTimer()
            }
          })
        }, 3000)
      }
    )
  }, [gameState, timer, wordSubmission, handlePlayerLoseLife, showGameOverScreen])

  const startGameWithName = useCallback((playerName: string) => {
    if (!user) {
      router.push("/")
      return
    }

    if (!playerName.trim()) {
      toast.error("Please enter a username")
      return
    }

    aiTurn.initializeAI()

    const humanPlayer: Player = {
      id: "human",
      username: playerName.trim(),
      isHost: true,
      isAlive: true,
      score: 0,
      lives: 3,
      isAI: false,
    }

    const aiPlayer: Player = {
      id: "ai",
      username: "AI Expert",
      isHost: false,
      isAlive: true,
      score: 0,
      lives: 3,
      isAI: true,
    }

    const initialRoom: Room = {
      code: "AI-MODE",
      players: [humanPlayer, aiPlayer],
      currentPlayerIndex: 0,
      currentLetter: gameState.generateRandomLetter(),
      gameStarted: true,
      gameOver: false,
      winner: null,
      usedWords: [],
      lastWord: null,
      isAIMode: true,
    }

    gameState.setRoom(initialRoom)
    gameState.setGameStarted(true)
    timer.resetTimer()
    
    console.log("=== Game started ===")
    console.log("Initial room:", initialRoom)
    console.log("Current player index:", initialRoom.currentPlayerIndex)
    console.log("Current player:", initialRoom.players[initialRoom.currentPlayerIndex])
    
    if (initialRoom.currentPlayerIndex === 0) {
      timer.startTimer()
    }
  }, [user, router, aiTurn, gameState, timer])

  const handlePlayAgain = useCallback(() => {
    gameState.setGameStarted(false)
    gameState.setRoom(null)
    aiTurn.resetAI()
    hasStartedGame.current = false
    setTimeout(() => {
      startGameWithName(username)
    }, 100)
  }, [gameState, aiTurn, username, startGameWithName])

  const handleLeaveGame = useCallback(() => {
    router.push("/")
  }, [router])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !gameState.showMeaning && !aiTurn.isAIThinking) {
      handleSubmitWord()
    }
  }, [gameState.showMeaning, aiTurn.isAIThinking, handleSubmitWord])

  useEffect(() => {
    if (user && !hasStartedGame.current) {
      hasStartedGame.current = true
      const playerName = user.displayName || user.email || "Player"
      setUsername(playerName)
      startGameWithName(playerName)
    } else if (user === null) {
      router.push("/")
    }
  }, [user, router, startGameWithName])

  useEffect(() => {
    return () => {
      timer.stopTimer()
    }
  }, [timer])

  return {
    username,
    gameStarted: gameState.gameStarted,
    room: gameState.room,
    wordInput: wordSubmission.wordInput,
    setWordInput: wordSubmission.setWordInput,
    timeLeft: timer.timeLeft,
    showMeaning: gameState.showMeaning,
    currentMeaning: gameState.currentMeaning,
    isAIThinking: aiTurn.isAIThinking,
    handleSubmitWord,
    handlePlayAgain,
    handleLeaveGame,
    handleKeyPress,
    TURN_TIME: timer.TURN_TIME,
  }
}
