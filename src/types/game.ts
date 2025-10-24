export interface Player {
  id: string
  username: string
  isHost: boolean
  isAlive: boolean
  score: number
  lives: number
  isAI?: boolean
}

export interface Room {
  code: string
  players: Player[]
  currentPlayerIndex: number
  currentLetter: string
  gameStarted: boolean
  gameOver: boolean
  winner: Player | null
  usedWords: string[]
  lastWord: string | null
  isAIMode?: boolean
  maxPlayers?: number
}

export interface WordValidationResult {
  valid: boolean
  word: string
  meaning?: string
  phonetic?: string
  reason?: string
}

export interface GameState {
  room: Room
  timeLeft: number
}
