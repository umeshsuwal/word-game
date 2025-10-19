import { useState, useCallback } from "react"
import type { Room, Player } from "@/types/game"

const VOWELS = ["A", "E", "I", "O", "U"]
const CONSONANTS = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]

export function useGameState() {
  const [room, setRoom] = useState<Room | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [showMeaning, setShowMeaning] = useState(false)
  const [currentMeaning, setCurrentMeaning] = useState<{
    word: string
    meaning: string
    phonetic: string
  } | null>(null)

  const generateRandomLetter = useCallback((): string => {
    const shouldBeVowel = Math.random() < 0.3
    const letters = shouldBeVowel ? VOWELS : CONSONANTS
    return letters[Math.floor(Math.random() * letters.length)]
  }, [])

  const updatePlayerLife = useCallback((playerId: string) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return null

      const updatedPlayers = currentRoom.players.map((p) => {
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

      return {
        ...currentRoom,
        players: updatedPlayers,
        gameOver,
        winner: gameOver ? alivePlayers[0] : null,
      }
    })
  }, [])

  const getNextPlayerIndex = useCallback((currentRoom: Room): number => {
    let nextIndex = (currentRoom.currentPlayerIndex + 1) % currentRoom.players.length
    while (!currentRoom.players[nextIndex].isAlive) {
      nextIndex = (nextIndex + 1) % currentRoom.players.length
    }
    return nextIndex
  }, [])

  const moveToNextTurn = useCallback((newLetter: string, callback?: (updatedRoom: Room) => void) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return null

      const nextIndex = getNextPlayerIndex(currentRoom)

      const updatedRoom = {
        ...currentRoom,
        currentPlayerIndex: nextIndex,
        currentLetter: newLetter,
      }

      if (callback) {
        setTimeout(() => callback(updatedRoom), 0)
      }
      
      return updatedRoom
    })
  }, [getNextPlayerIndex])

  const updateRoomWithWord = useCallback((word: string, playerId: string) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return null

      const updatedPlayers = currentRoom.players.map((p) => {
        if (p.id === playerId) {
          return { ...p, score: p.score + word.length }
        }
        return p
      })

      return {
        ...currentRoom,
        players: updatedPlayers,
        usedWords: [...currentRoom.usedWords, word],
        lastWord: word,
      }
    })
  }, [])

  return {
    room,
    setRoom,
    gameStarted,
    setGameStarted,
    showMeaning,
    setShowMeaning,
    currentMeaning,
    setCurrentMeaning,
    generateRandomLetter,
    updatePlayerLife,
    getNextPlayerIndex,
    moveToNextTurn,
    updateRoomWithWord,
  }
}
