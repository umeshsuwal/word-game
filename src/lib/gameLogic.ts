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
  private playerRoomMap: Map<string, { roomCode: string; username: string }> = new Map()
  private useFirebase: boolean = false
  private firebaseDb: any = null

  constructor(useFirebase: boolean = false) {
    this.useFirebase = useFirebase
    if (useFirebase) {
      this.initializeFirebase()
    }
  }

  private async initializeFirebase() {
    try {
  const { getAdminDb } = await import("../../server/firebase-admin")
      this.firebaseDb = getAdminDb()
      console.log("Firebase initialized for game logic")
    } catch (error) {
      console.error("Failed to initialize Firebase:", error)
      this.useFirebase = false
    }
  }

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async createRoom(roomCode: string, hostId: string, hostUsername: string, maxPlayers: number = 4, gameMode: "endless" | "classic" = "endless"): Promise<Room> {
    const room: Room = {
      code: roomCode,
      players: [
        {
          id: hostId,
          username: hostUsername,
          isHost: true,
          isAlive: true,
          score: 0,
          lives: 3,
        },
      ],
      currentPlayerIndex: 0,
      currentLetter: "",
      gameStarted: false,
      gameOver: false,
      winner: null,
      usedWords: [],
      lastWord: null,
      maxPlayers: Math.min(8, Math.max(2, maxPlayers)),
      gameMode,
    }
    this.rooms.set(roomCode, room)
    this.playerRoomMap.set(hostId, { roomCode, username: hostUsername })

    if (this.useFirebase && this.firebaseDb) {
      try {
        await this.firebaseDb.collection("rooms").doc(roomCode).set({
          ...room,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error saving room to Firebase:", error)
      }
    }

    return room
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode)
  }

  async joinRoom(roomCode: string, playerId: string, username: string): Promise<Room | null> {
    const room = this.rooms.get(roomCode)
    if (!room || room.gameStarted) return null

    // Check if room is full
    const maxPlayers = room.maxPlayers || 4
    if (room.players.length >= maxPlayers) {
      return null
    }

    const player: Player = {
      id: playerId,
      username,
      isHost: false,
      isAlive: true,
      score: 0,
      lives: 3,
    }
    room.players.push(player)
    this.playerRoomMap.set(playerId, { roomCode, username })

    if (this.useFirebase && this.firebaseDb) {
      try {
        await this.firebaseDb.collection("rooms").doc(roomCode).update({
          players: room.players,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error updating room in Firebase:", error)
      }
    }

    return room
  }

  async removePlayer(roomCode: string, playerId: string): Promise<Room | null> {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    room.players = room.players.filter((p) => p.id !== playerId)
    this.playerRoomMap.delete(playerId)

    if (room.players.length > 0 && !room.players.some((p) => p.isHost)) {
      room.players[0].isHost = true
    }

    if (room.players.length === 0) {
      this.rooms.delete(roomCode)
      
      if (this.useFirebase && this.firebaseDb) {
        try {
          await this.firebaseDb.collection("rooms").doc(roomCode).delete()
        } catch (error) {
          console.error("Error deleting room from Firebase:", error)
        }
      }
      
      return null
    }

    if (this.useFirebase && this.firebaseDb) {
      try {
        await this.firebaseDb.collection("rooms").doc(roomCode).update({
          players: room.players,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error updating room in Firebase:", error)
      }
    }

    return room
  }

  async startGame(roomCode: string): Promise<Room | null> {
    const room = this.rooms.get(roomCode)
    if (!room || room.players.length < 2) return null

    room.gameStarted = true
    room.currentPlayerIndex = 0
    room.currentLetter = this.generateRandomLetter()

    if (this.useFirebase && this.firebaseDb) {
      try {
        await this.firebaseDb.collection("rooms").doc(roomCode).update({
          gameStarted: true,
          currentPlayerIndex: room.currentPlayerIndex,
          currentLetter: room.currentLetter,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error updating game start in Firebase:", error)
      }
    }

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
      return { valid: false, word, reason: "Room not found" }
    }

    const normalizedWord = word.toLowerCase().trim()
    const currentPlayer = room.players[room.currentPlayerIndex]

    if (currentPlayer.id !== playerId) {
      return { valid: false, word, reason: "Not your turn" }
    }

    if (!normalizedWord.startsWith(room.currentLetter.toLowerCase())) {
      return { 
        valid: false, 
        word, 
        reason: `Word must start with "${room.currentLetter}"` 
      }
    }

    if (room.usedWords.includes(normalizedWord)) {
      return { 
        valid: false, 
        word, 
        reason: "This word has already been used" 
      }
    }

    try {
      const dataumuseResponse = await fetch(
        `https://api.datamuse.com/words?sp=${normalizedWord}&md=d&max=1`,
        { signal: AbortSignal.timeout(3000) }
      )

      if (dataumuseResponse.ok) {
        const datamuseData = await dataumuseResponse.json()
        
        if (datamuseData.length > 0 && datamuseData[0].word.toLowerCase() === normalizedWord) {
          const meaning = datamuseData[0].defs?.[0]?.replace(/^\w+\t/, "") || "Valid English word"
          
          room.usedWords.push(normalizedWord)
          room.lastWord = normalizedWord
          currentPlayer.score += normalizedWord.length

          if (this.useFirebase && this.firebaseDb) {
            try {
              await this.firebaseDb.collection("rooms").doc(roomCode).update({
                usedWords: room.usedWords,
                lastWord: room.lastWord,
                players: room.players,
                updatedAt: new Date(),
              })
            } catch (error) {
              console.error("Error saving used word to Firebase:", error)
            }
          }

          return {
            valid: true,
            word: normalizedWord,
            meaning,
            phonetic: "",
          }
        }
      }

      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`,
        { signal: AbortSignal.timeout(3000) }
      )

      if (!response.ok) {
        return { 
          valid: false, 
          word, 
          reason: "Word not found in dictionary" 
        }
      }

      const data = await response.json()
      const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "No definition available"
      const phonetic = data[0]?.phonetic || ""

      room.usedWords.push(normalizedWord)
      room.lastWord = normalizedWord
      currentPlayer.score += normalizedWord.length

      if (this.useFirebase && this.firebaseDb) {
        try {
          await this.firebaseDb.collection("rooms").doc(roomCode).update({
            usedWords: room.usedWords,
            lastWord: room.lastWord,
            players: room.players,
            updatedAt: new Date(),
          })
        } catch (error) {
          console.error("Error saving used word to Firebase:", error)
        }
      }

      return {
        valid: true,
        word: normalizedWord,
        meaning,
        phonetic,
      }
    } catch (error) {
      return { 
        valid: false, 
        word, 
        reason: "Failed to validate word (timeout or network error)" 
      }
    }
  }

  async eliminatePlayer(roomCode: string, playerId: string): Promise<{ room: Room; livesLeft: number } | null> {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    const player = room.players.find((p) => p.id === playerId)
    if (player) {
      player.lives -= 1
      
      if (player.lives <= 0) {
        player.isAlive = false
      }

      if (this.useFirebase && this.firebaseDb) {
        try {
          await this.firebaseDb.collection("rooms").doc(roomCode).update({
            players: room.players,
            updatedAt: new Date(),
          })
        } catch (error) {
          console.error("Error updating player elimination in Firebase:", error)
        }
      }
      
      return { room, livesLeft: player.lives }
    }

    return null
  }

  async nextTurn(roomCode: string): Promise<Room | null> {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    const alivePlayers = room.players.filter((p) => p.isAlive)

    // Check for classic mode win condition (200 points)
    if (room.gameMode === "classic") {
      const winningPlayer = room.players.find((p) => p.score >= 200)
      if (winningPlayer) {
        room.gameOver = true
        room.winner = winningPlayer
        
        if (this.useFirebase && this.firebaseDb) {
          try {
            await this.firebaseDb.collection("rooms").doc(roomCode).update({
              gameOver: true,
              winner: room.winner,
              updatedAt: new Date(),
            })
          } catch (error) {
            console.error("Error updating game over in Firebase:", error)
          }
        }
        
        return room
      }
    }

    // Check for endless mode win condition (last player standing)
    if (alivePlayers.length <= 1) {
      room.gameOver = true
      room.winner = alivePlayers[0] || room.players.sort((a, b) => b.score - a.score)[0]
      
      if (this.useFirebase && this.firebaseDb) {
        try {
          await this.firebaseDb.collection("rooms").doc(roomCode).update({
            gameOver: true,
            winner: room.winner,
            updatedAt: new Date(),
          })
        } catch (error) {
          console.error("Error updating game over in Firebase:", error)
        }
      }
      
      return room
    }

    do {
      room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
    } while (!room.players[room.currentPlayerIndex].isAlive)

    if (room.lastWord) {
      room.currentLetter = room.lastWord.charAt(room.lastWord.length - 1).toUpperCase()
    } else {
      room.currentLetter = this.generateRandomLetter()
    }

    if (this.useFirebase && this.firebaseDb) {
      try {
        await this.firebaseDb.collection("rooms").doc(roomCode).update({
          currentPlayerIndex: room.currentPlayerIndex,
          currentLetter: room.currentLetter,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error updating next turn in Firebase:", error)
      }
    }
    
    return room
  }

  getTurnTime(): number {
    return TURN_TIME
  }

  getPlayerLastRoom(oldPlayerId: string): { roomCode: string; username: string } | null {
    return this.playerRoomMap.get(oldPlayerId) || null
  }

  rejoinRoom(roomCode: string, oldPlayerId: string, newSocketId: string): Room | null {
    const room = this.rooms.get(roomCode)
    if (!room) return null

    const playerIndex = room.players.findIndex((p) => p.id === oldPlayerId)
    if (playerIndex === -1) return null

    const player = room.players[playerIndex]
    const oldId = player.id
    player.id = newSocketId

    // Update the player room map with new socket ID
    const playerInfo = this.playerRoomMap.get(oldId)
    if (playerInfo) {
      this.playerRoomMap.delete(oldId)
      this.playerRoomMap.set(newSocketId, playerInfo)
    }

    return room
  }

  wasPlayerInRoom(playerId: string): boolean {
    return this.playerRoomMap.has(playerId)
  }
}

export async function validateWord(
  roomCode: string,
  word: string,
  playerId: string,
  room: Room
): Promise<WordValidationResult> {
  const normalizedWord = word.toLowerCase().trim()
  const currentPlayer = room.players[room.currentPlayerIndex]

  if (currentPlayer.id !== playerId) {
    return { valid: false, word, reason: "Not your turn" }
  }

  if (!normalizedWord.startsWith(room.currentLetter.toLowerCase())) {
    return {
      valid: false,
      word,
      reason: `Word must start with "${room.currentLetter}"`,
    }
  }

  if (room.usedWords.includes(normalizedWord)) {
    return {
      valid: false,
      word,
      reason: "This word has already been used",
    }
  }

  try {
    const datamuseResponse = await fetch(
      `https://api.datamuse.com/words?sp=${normalizedWord}&md=d&max=1`,
      { signal: AbortSignal.timeout(3000) }
    )

    if (datamuseResponse.ok) {
      const datamuseData = await datamuseResponse.json()

      if (datamuseData.length > 0 && datamuseData[0].word.toLowerCase() === normalizedWord) {
        const meaning = datamuseData[0].defs?.[0]?.replace(/^\w+\t/, "") || "Valid English word"

        return {
          valid: true,
          word: normalizedWord,
          meaning,
          phonetic: "",
        }
      }
    }

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`,
      { signal: AbortSignal.timeout(3000) }
    )

    if (!response.ok) {
      return {
        valid: false,
        word,
        reason: "Word not found in dictionary",
      }
    }

    const data = await response.json()
    const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "No definition available"
    const phonetic = data[0]?.phonetic || ""

    return {
      valid: true,
      word: normalizedWord,
      meaning,
      phonetic,
    }
  } catch (error) {
    return {
      valid: false,
      word,
      reason: "Failed to validate word (timeout or network error)",
    }
  }
}
