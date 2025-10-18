import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Room, Player } from "@/types/game"
import { AIPlayer } from "@/lib/aiLogic"
import { validateWord } from "@/lib/wordValidation"
import { HistoryService } from "@/lib/historyService"
import type { User } from "firebase/auth"

const TURN_TIME = 30
const VOWELS = ["A", "E", "I", "O", "U"]
const CONSONANTS = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]

export function useAIGame(user: User | null | undefined) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [wordInput, setWordInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const [showMeaning, setShowMeaning] = useState(false)
  const [currentMeaning, setCurrentMeaning] = useState<{
    word: string
    meaning: string
    phonetic: string
  } | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiPlayerRef = useRef<AIPlayer | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingAITurn = useRef(false)
  const hasStartedGame = useRef(false)

  const generateRandomLetter = (): string => {
    const useVowel = Math.random() < 0.3
    const letters = useVowel ? VOWELS : CONSONANTS
    return letters[Math.floor(Math.random() * letters.length)]
  }

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const showGameOverScreen = (winner: Player) => {
    toast.success("Game Over!", {
      description: `${winner.username} wins!`,
      duration: 5000,
    })

    setTimeout(() => {
      router.push("/")
    }, 5000)
  }

  const handlePlayerLoseLife = (playerId: string, reason: string) => {
    if (!room) return

    const updatedPlayers = room.players.map((p) => {
      if (p.id === playerId) {
        const newLives = p.lives - 1
        return {
          ...p,
          lives: newLives,
          isAlive: newLives > 0,
        }
      }
      return p
    })

    const alivePlayers = updatedPlayers.filter((p) => p.isAlive)
    const gameOver = alivePlayers.length === 1

    setRoom({
      ...room,
      players: updatedPlayers,
      gameOver,
      winner: gameOver ? alivePlayers[0] : null,
    })

    if (gameOver) {
      stopTimer()
      setTimeout(() => {
        showGameOverScreen(alivePlayers[0])
      }, 3000)
    }
  }

  const handleTimeout = () => {
    stopTimer()
    if (!room || showMeaning) return

    const currentPlayer = room.players[room.currentPlayerIndex]
    
    if (currentPlayer.isAI) {
      handlePlayerLoseLife(currentPlayer.id, "Time out")
    } else {
      handlePlayerLoseLife(currentPlayer.id, "Time out")
      toast.error("Time's up!", {
        description: "You ran out of time!",
      })
    }

    setTimeout(() => {
      setRoom(currentRoom => {
        if (!currentRoom) return null
        
        const alivePlayers = currentRoom.players.filter((p) => p.isAlive)
        if (alivePlayers.length === 1) {
          const gameOverRoom = {
            ...currentRoom,
            gameOver: true,
            winner: alivePlayers[0],
          }
          showGameOverScreen(alivePlayers[0])
          return gameOverRoom
        }

        let nextIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.players.length
        while (!currentRoom.players[nextIndex].isAlive) {
          nextIndex = (nextIndex + 1) % currentRoom.players.length
        }

        const nextLetter = currentRoom.currentLetter

        const nextRoom: Room = {
          ...currentRoom,
          currentPlayerIndex: nextIndex,
          currentLetter: nextLetter,
        }

        setTimeLeft(TURN_TIME)

        if (nextRoom.players[nextIndex].isAI) {
          handleAITurn(nextRoom)
        } else {
          startTimer()
        }

        return nextRoom
      })
    }, 3000)
  }

  const handleAITurn = async (currentRoom: Room) => {
    if (!aiPlayerRef.current) return

    if (isProcessingAITurn.current) {
      console.log("AI turn already in progress, skipping duplicate call")
      return
    }

    const currentPlayer = currentRoom.players[currentRoom.currentPlayerIndex]
    
    if (!currentPlayer.isAI) {
      console.log("Current player is not AI, skipping")
      return
    }

    isProcessingAITurn.current = true
    setIsAIThinking(true)

    try {
      const aiWordChoice = await aiPlayerRef.current.generateWord(currentRoom.currentLetter, currentRoom.usedWords, 0.5)
      const aiWord = aiWordChoice ? aiWordChoice.word : null

      if (!aiWord) {
        console.log("AI couldn't find a word")
        handlePlayerLoseLife(currentPlayer.id, "Couldn't find a word")
        setTimeout(() => {
          setIsAIThinking(false)
          isProcessingAITurn.current = false
          
          setRoom(currentRoom => {
            if (!currentRoom) return null
            
            const alivePlayers = currentRoom.players.filter((p) => p.isAlive)
            if (alivePlayers.length === 1) {
              const gameOverRoom = {
                ...currentRoom,
                gameOver: true,
                winner: alivePlayers[0],
              }
              showGameOverScreen(alivePlayers[0])
              return gameOverRoom
            }

            let nextIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.players.length
            while (!currentRoom.players[nextIndex].isAlive) {
              nextIndex = (nextIndex + 1) % currentRoom.players.length
            }

            const nextLetter = currentRoom.currentLetter

            const nextRoom: Room = {
              ...currentRoom,
              currentPlayerIndex: nextIndex,
              currentLetter: nextLetter,
            }

            setTimeLeft(TURN_TIME)
            startTimer()

            return nextRoom
          })
        }, 3000)
        return
      }

      const validation = await validateWord(currentRoom.code, aiWord, currentPlayer.id, currentRoom)

      setIsAIThinking(false)

      if (validation.valid) {
        setCurrentMeaning({
          word: validation.word,
          meaning: validation.meaning || "",
          phonetic: validation.phonetic || "",
        })
        setShowMeaning(true)

        const updatedPlayers = currentRoom.players.map((p) => {
          if (p.id === currentPlayer.id) {
            return { ...p, score: p.score + aiWord.length }
          }
          return p
        })

        const updatedRoomWithWord = {
          ...currentRoom,
          players: updatedPlayers,
          usedWords: [...currentRoom.usedWords, aiWord],
          lastWord: aiWord,
        }
        
        setRoom(updatedRoomWithWord)

        if ("speechSynthesis" in window && validation.phonetic) {
          const utterance = new SpeechSynthesisUtterance(aiWord)
          utterance.rate = 0.8
          window.speechSynthesis.speak(utterance)
        }

        toast.success("AI played!", {
          description: `"${aiWord}" +${aiWord.length} points`,
        })

        setTimeout(() => {
          setShowMeaning(false)
          isProcessingAITurn.current = false
          
          const alivePlayers = updatedRoomWithWord.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            setRoom({
              ...updatedRoomWithWord,
              gameOver: true,
              winner: alivePlayers[0],
            })
            stopTimer()
            showGameOverScreen(alivePlayers[0])
            return
          }

          let nextIndex = (updatedRoomWithWord.currentPlayerIndex + 1) % updatedRoomWithWord.players.length
          while (!updatedRoomWithWord.players[nextIndex].isAlive) {
            nextIndex = (nextIndex + 1) % updatedRoomWithWord.players.length
          }

          const nextLetter = aiWord.charAt(aiWord.length - 1).toUpperCase()

          const nextRoom: Room = {
            ...updatedRoomWithWord,
            currentPlayerIndex: nextIndex,
            currentLetter: nextLetter,
          }

          setRoom(nextRoom)
          setTimeLeft(TURN_TIME)

          if (nextRoom.players[nextIndex].isAI) {
            console.error("🔴 CRITICAL ERROR: AI getting consecutive turns!")
            startTimer()
          } else {
            startTimer()
          }
        }, 6000)
      } else {
        isProcessingAITurn.current = false
        handlePlayerLoseLife(currentPlayer.id, validation.reason || "Invalid word")
        
        toast.error("AI made an error!", {
          description: validation.reason,
        })

        setTimeout(() => {
          setRoom(currentRoom => {
            if (!currentRoom) return null
            
            const alivePlayers = currentRoom.players.filter((p) => p.isAlive)
            if (alivePlayers.length === 1) {
              const gameOverRoom = {
                ...currentRoom,
                gameOver: true,
                winner: alivePlayers[0],
              }
              stopTimer()
              showGameOverScreen(alivePlayers[0])
              return gameOverRoom
            }

            let nextIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.players.length
            while (!currentRoom.players[nextIndex].isAlive) {
              nextIndex = (nextIndex + 1) % currentRoom.players.length
            }

            const nextLetter = currentRoom.currentLetter

            const nextRoom: Room = {
              ...currentRoom,
              currentPlayerIndex: nextIndex,
              currentLetter: nextLetter,
            }

            setTimeLeft(TURN_TIME)

            if (nextRoom.players[nextIndex].isAI) {
              handleAITurn(nextRoom)
            } else {
              startTimer()
            }

            return nextRoom
          })
        }, 3000)
      }
    } catch (error) {
      console.error("Error in AI turn:", error)
      isProcessingAITurn.current = false
      setIsAIThinking(false)
      handlePlayerLoseLife(currentPlayer.id, "AI error")
    }
  }

  const handleSubmitWord = async () => {
    if (!wordInput.trim() || !room || showMeaning) return

    stopTimer()
    const word = wordInput.trim().toLowerCase()
    const currentPlayer = room.players[room.currentPlayerIndex]

    const validation = await validateWord(room.code, word, currentPlayer.id, room)

    if (validation.valid) {
      setCurrentMeaning({
        word: validation.word,
        meaning: validation.meaning || "",
        phonetic: validation.phonetic || "",
      })
      setShowMeaning(true)

      const updatedPlayers = room.players.map((p) => {
        if (p.id === currentPlayer.id) {
          return { ...p, score: p.score + word.length }
        }
        return p
      })

      const updatedRoomWithWord = {
        ...room,
        players: updatedPlayers,
        usedWords: [...room.usedWords, word],
        lastWord: word,
      }
      
      setRoom(updatedRoomWithWord)

      if (user && currentPlayer.id === "human") {
        HistoryService.saveWordHistory(user.uid, {
          word: validation.word,
          meaning: validation.meaning || "",
          userName: currentPlayer.username,
          roomCode: "AI-MODE",
          score: word.length,
        }).catch((error) => {
          console.error("Failed to save word history:", error)
        })
      }

      if ("speechSynthesis" in window && validation.phonetic) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }

      toast.success("Valid word!", {
        description: `"${word}" is correct! +${word.length} points`,
      })

      setTimeout(() => {
        setShowMeaning(false)
        
        const alivePlayers = updatedRoomWithWord.players.filter((p) => p.isAlive)
        if (alivePlayers.length === 1) {
          setRoom({
            ...updatedRoomWithWord,
            gameOver: true,
            winner: alivePlayers[0],
          })
          stopTimer()
          showGameOverScreen(alivePlayers[0])
          return
        }

        let nextIndex = (updatedRoomWithWord.currentPlayerIndex + 1) % updatedRoomWithWord.players.length
        while (!updatedRoomWithWord.players[nextIndex].isAlive) {
          nextIndex = (nextIndex + 1) % updatedRoomWithWord.players.length
        }

        const nextLetter = word.charAt(word.length - 1).toUpperCase()

        const nextRoom: Room = {
          ...updatedRoomWithWord,
          currentPlayerIndex: nextIndex,
          currentLetter: nextLetter,
        }

        setRoom(nextRoom)
        setTimeLeft(TURN_TIME)

        if (nextRoom.players[nextIndex].isAI) {
          handleAITurn(nextRoom)
        } else {
          startTimer()
        }
      }, 6000)
    } else {
      handlePlayerLoseLife(currentPlayer.id, validation.reason || "Invalid word")
      
      toast.error("Invalid word!", {
        description: validation.reason,
      })

      setTimeout(() => {
        setRoom(currentRoom => {
          if (!currentRoom) return null
          
          const alivePlayers = currentRoom.players.filter((p) => p.isAlive)
          if (alivePlayers.length === 1) {
            const gameOverRoom = {
              ...currentRoom,
              gameOver: true,
              winner: alivePlayers[0],
            }
            stopTimer()
            showGameOverScreen(alivePlayers[0])
            return gameOverRoom
          }

          let nextIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.players.length
          while (!currentRoom.players[nextIndex].isAlive) {
            nextIndex = (nextIndex + 1) % currentRoom.players.length
          }

          const nextLetter = currentRoom.currentLetter

          const nextRoom: Room = {
            ...currentRoom,
            currentPlayerIndex: nextIndex,
            currentLetter: nextLetter,
          }

          setTimeLeft(TURN_TIME)

          if (nextRoom.players[nextIndex].isAI) {
            handleAITurn(nextRoom)
          } else {
            startTimer()
          }

          return nextRoom
        })
      }, 3000)
    }

    setWordInput("")
  }

  const startGameWithName = (playerName: string) => {
    if (!user) {
      router.push("/")
      return
    }

    if (!playerName.trim()) {
      toast.error("Please enter a username")
      return
    }

    const difficulty = "expert"
    aiPlayerRef.current = new AIPlayer(difficulty)

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
      currentLetter: generateRandomLetter(),
      gameStarted: true,
      gameOver: false,
      winner: null,
      usedWords: [],
      lastWord: null,
      isAIMode: true,
    }

    setRoom(initialRoom)
    setGameStarted(true)
    setTimeLeft(TURN_TIME)
    
    if (initialRoom.currentPlayerIndex === 0) {
      startTimer()
    }
  }

  const handlePlayAgain = () => {
    setGameStarted(false)
    setRoom(null)
    aiPlayerRef.current = null
    hasStartedGame.current = false
    setTimeout(() => {
      startGameWithName(username)
    }, 100)
  }

  const handleLeaveGame = () => {
    router.push("/")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showMeaning && !isAIThinking) {
      handleSubmitWord()
    }
  }

  // Auto-start game when user logs in
  useEffect(() => {
    if (user && !hasStartedGame.current) {
      hasStartedGame.current = true
      
      const playerName = user.displayName || user.email || "Player"
      setUsername(playerName)
      
      const difficulty = "expert"
      aiPlayerRef.current = new AIPlayer(difficulty)

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
        currentLetter: generateRandomLetter(),
        gameStarted: true,
        gameOver: false,
        winner: null,
        usedWords: [],
        lastWord: null,
        isAIMode: true,
      }

      setRoom(initialRoom)
      setGameStarted(true)
      setTimeLeft(TURN_TIME)
      startTimer()
    } else if (user === null) {
      router.push("/")
    }
  }, [user, router])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [])

  return {
    username,
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
  }
}
