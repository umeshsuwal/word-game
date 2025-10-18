import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import type { Room, Player } from "@/types/game"
import { AIPlayer } from "@/lib/aiLogic"
import { validateWord } from "@/lib/wordValidation"

export function useAITurn() {
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiPlayerRef = useRef<AIPlayer | null>(null)
  const isProcessingAITurn = useRef(false)

  const initializeAI = useCallback(() => {
    aiPlayerRef.current = new AIPlayer()
  }, [])

  const resetAI = useCallback(() => {
    aiPlayerRef.current = null
  }, [])

  const processAITurn = useCallback(async (
    currentRoom: Room,
    onSuccess: (word: string, meaning: string, phonetic: string) => void,
    onFailure: (reason: string) => void,
    onNoWord: () => void
  ) => {
    if (!aiPlayerRef.current || isProcessingAITurn.current) {
      return
    }

    const currentPlayer = currentRoom.players[currentRoom.currentPlayerIndex]
    
    if (!currentPlayer.isAI) {
      return
    }

    isProcessingAITurn.current = true
    setIsAIThinking(true)

    try {
      const aiWordChoice = await aiPlayerRef.current.generateWord(
        currentRoom.currentLetter,
        currentRoom.usedWords,
        currentPlayer.lives
      )

      const aiWord = aiWordChoice ? aiWordChoice.word : null

      if (!aiWord) {
        setIsAIThinking(false)
        isProcessingAITurn.current = false
        onNoWord()
        return
      }

      const validation = await validateWord(
        currentRoom.code,
        aiWord,
        currentPlayer.id,
        currentRoom
      )

      setIsAIThinking(false)

      if (validation.valid) {
        if ("speechSynthesis" in window && validation.phonetic) {
          const utterance = new SpeechSynthesisUtterance(aiWord)
          utterance.rate = 0.8
          window.speechSynthesis.speak(utterance)
        }

        toast.success("AI played!", {
          description: `"${aiWord}" +${aiWord.length} points`,
        })

        onSuccess(
          validation.word,
          validation.meaning || "",
          validation.phonetic || ""
        )
      } else {
        isProcessingAITurn.current = false
        
        toast.error("AI made an error!", {
          description: validation.reason,
        })

        onFailure(validation.reason || "Invalid word")
      }
    } catch (error) {
      console.error("Error in AI turn:", error)
      isProcessingAITurn.current = false
      setIsAIThinking(false)
      onFailure("AI error")
    }
  }, [])

  const completeAITurn = useCallback(() => {
    isProcessingAITurn.current = false
  }, [])

  return {
    isAIThinking,
    initializeAI,
    resetAI,
    processAITurn,
    completeAITurn,
  }
}
