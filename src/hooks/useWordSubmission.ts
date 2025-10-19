import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Room } from "@/types/game"
import { validateWord } from "@/lib/wordValidation"
import { HistoryService } from "@/lib/historyService"
import type { User } from "firebase/auth"

export function useWordSubmission(user: User | null | undefined) {
  const [wordInput, setWordInput] = useState("")

  const submitWord = useCallback(async (
    room: Room,
    onSuccess: (word: string, meaning: string, phonetic: string) => void,
    onFailure: (reason: string) => void
  ) => {
    if (!wordInput.trim() || !room) return

    const word = wordInput.trim().toLowerCase()
    const currentPlayer = room.players[room.currentPlayerIndex]

    const validation = await validateWord(room.code, word, currentPlayer.id, room)

    setWordInput("")

    if (validation.valid) {
      if (user && currentPlayer.id === "human") {
        HistoryService.saveWordHistory(user.uid, {
          word: validation.word,
          meaning: validation.meaning || "",
          userName: currentPlayer.username,
          roomCode: "AI-MODE",
          score: word.length,
        }).catch(err => console.error("Failed to save word history:", err))
      }

      if ("speechSynthesis" in window && validation.phonetic) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }

      toast.success("Valid word!", {
        description: `"${word}" is correct! +${word.length} points`,
      })

      onSuccess(
        validation.word,
        validation.meaning || "",
        validation.phonetic || ""
      )
    } else {
      toast.error("Invalid word!", {
        description: validation.reason,
      })

      onFailure(validation.reason || "Invalid word")
    }
  }, [wordInput, user])

  return {
    wordInput,
    setWordInput,
    submitWord,
  }
}
