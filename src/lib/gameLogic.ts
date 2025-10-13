import type { Room, Player, WordValidationResult } from "@/types/game"

const TURN_TIME = 30 // seconds
const VOWELS = ["A", "E", "I", "O", "U"]
const CONSONANTS = [
  "B",
  "C",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]

export class GameLogic {
  private rooms: Map<string, Room> = new Map()

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  createRoom(roomCode: string, hostId: string, hostUsername: string): Room {
    const room: Room = {
      code: roomCode,
      players: [
        {
          id: hostId,
          username: hostUsername,
          isHost: true,
          isAlive: true,
          score: 0,
        },
      ],
      currentPlayerIndex: 0,
      currentLetter: "",
      gameStarted: false,
      gameOver: false,
      winner: null,
      usedWords: [],
      lastWord: null,
    }
    this.rooms.set(roomCode, room)
    return room
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode)
  }

  joinRoom(roomCode: string, playerId: string, username: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room || room.gameStarted) return null

    const player: Player = {
      id: playerId,
      username,
      isHost: false,
      isAlive: true,
      score: 0,
    }
    room.players.push(player)
    return room
  }

  removePlayer(roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    room.players = room.players.filter((p) => p.id !== playerId)

    // If host left, assign new host
    if (room.players.length > 0 && !room.players.some((p) => p.isHost)) {
      room.players[0].isHost = true
    }

    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomCode)
      return null
    }

    return room
  }

  startGame(roomCode: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room || room.players.length < 2) return null

    room.gameStarted = true
    room.currentPlayerIndex = 0
    room.currentLetter = this.generateRandomLetter()
    return room
  }

  generateRandomLetter(): string {
    const useVowel = Math.random() < 0.4 // 40% chance of vowel
    const letters = useVowel ? VOWELS : CONSONANTS
    return letters[Math.floor(Math.random() * letters.length)]
  }

  async validateWord(roomCode: string, word: string, playerId: string): Promise<WordValidationResult> {
    const room = this.rooms.get(roomCode)
    if (!room) {
      return { valid: false, word }
    }

    const normalizedWord = word.toLowerCase().trim()
    const currentPlayer = room.players[room.currentPlayerIndex]

    // Check if it's the player's turn
    if (currentPlayer.id !== playerId) {
      return { valid: false, word }
    }

    // Check if word starts with the required letter
    if (!normalizedWord.startsWith(room.currentLetter.toLowerCase())) {
      return { valid: false, word }
    }

    // Check if word was already used
    if (room.usedWords.includes(normalizedWord)) {
      return { valid: false, word }
    }

    // Validate with dictionary API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`)

      if (!response.ok) {
        return { valid: false, word }
      }

      const data = await response.json()
      const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "No definition available"
      const phonetic = data[0]?.phonetic || ""

      // Word is valid - store it as the last word
      room.usedWords.push(normalizedWord)
      room.lastWord = normalizedWord
      currentPlayer.score += normalizedWord.length

      return {
        valid: true,
        word: normalizedWord,
        meaning,
        phonetic,
      }
    } catch (error) {
      return { valid: false, word }
    }
  }

  eliminatePlayer(roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    const player = room.players.find((p) => p.id === playerId)
    if (player) {
      player.isAlive = false
    }

    return room
  }

  nextTurn(roomCode: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    const alivePlayers = room.players.filter((p) => p.isAlive)

    // Check for game over
    if (alivePlayers.length <= 1) {
      room.gameOver = true
      room.winner = alivePlayers[0] || room.players.sort((a, b) => b.score - a.score)[0]
      return room
    }

    // Move to next alive player
    do {
      room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
    } while (!room.players[room.currentPlayerIndex].isAlive)

    // Set next letter: if there's a last word, use its last letter; otherwise generate random
    if (room.lastWord) {
      room.currentLetter = room.lastWord.charAt(room.lastWord.length - 1).toUpperCase()
    } else {
      room.currentLetter = this.generateRandomLetter()
    }
    
    return room
  }

  getTurnTime(): number {
    return TURN_TIME
  }
}
