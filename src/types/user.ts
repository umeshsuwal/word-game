import { Timestamp } from "firebase/firestore"

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string
  photoURL: string | null
  createdAt: Timestamp
  gamesPlayed: number
  gamesWon: number
  totalWords: number
  totalScore: number
}

export interface GameHistory {
  id: string
  roomCode: string
  playerId: string
  playerName: string
  playerEmail: string | null
  score: number
  rank: number
  isWinner: boolean
  wordsUsed: string[]
  playedAt: Timestamp
  gameStartedAt: Timestamp
  gameEndedAt: Timestamp
  totalPlayers: number
}

export interface WordHistory {
  id: string
  word: string
  meaning: string
  usedBy: string // user uid
  usedByName: string
  roomCode: string
  usedAt: Timestamp
  score: number
}
