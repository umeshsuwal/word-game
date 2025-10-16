import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  updateDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { GameHistory, WordHistory, UserProfile } from "@/types/user"

export class HistoryService {
  // Save game result to user's history
  static async saveGameHistory(
    userId: string,
    gameData: {
      roomCode: string
      playerName: string
      playerEmail: string | null
      score: number
      rank: number
      isWinner: boolean
      wordsUsed: string[]
      totalPlayers: number
    }
  ): Promise<void> {
    try {
      const historyRef = doc(collection(db, "gameHistory"))
      const now = Timestamp.now()

      await setDoc(historyRef, {
        roomCode: gameData.roomCode,
        playerId: userId,
        playerName: gameData.playerName,
        playerEmail: gameData.playerEmail,
        score: gameData.score,
        rank: gameData.rank,
        isWinner: gameData.isWinner,
        wordsUsed: gameData.wordsUsed,
        totalPlayers: gameData.totalPlayers,
        playedAt: now,
        gameStartedAt: now,
        gameEndedAt: now,
      })

      // Update user stats
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        gamesPlayed: increment(1),
        gamesWon: increment(gameData.isWinner ? 1 : 0),
        totalWords: increment(gameData.wordsUsed.length),
        totalScore: increment(gameData.score),
      })
    } catch (error) {
      console.error("Error saving game history:", error)
      throw error
    }
  }

  // Save word usage to history
  static async saveWordHistory(
    userId: string,
    wordData: {
      word: string
      meaning: string
      userName: string
      roomCode: string
      score: number
    }
  ): Promise<void> {
    try {
      const wordRef = doc(collection(db, "wordHistory"))

      await setDoc(wordRef, {
        word: wordData.word,
        meaning: wordData.meaning,
        usedBy: userId,
        usedByName: wordData.userName,
        roomCode: wordData.roomCode,
        score: wordData.score,
        usedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error saving word history:", error)
    }
  }

  // Get user's game history
  static async getUserGameHistory(userId: string, limitCount: number = 50): Promise<GameHistory[]> {
    try {
      const historyRef = collection(db, "gameHistory")
      // Simplified query without orderBy to avoid composite index requirement
      // Data will be sorted client-side
      const q = query(
        historyRef,
        where("playerId", "==", userId),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const games = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GameHistory[]
      
      // Sort client-side by playedAt descending
      return games.sort((a, b) => {
        const aTime = a.playedAt?.toMillis?.() || 0
        const bTime = b.playedAt?.toMillis?.() || 0
        return bTime - aTime
      })
    } catch (error) {
      console.error("Error fetching game history:", error)
      return []
    }
  }

  // Get user's word history
  static async getUserWordHistory(userId: string, limitCount: number = 100): Promise<WordHistory[]> {
    try {
      const wordRef = collection(db, "wordHistory")
      const q = query(
        wordRef,
        where("usedBy", "==", userId),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const words = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WordHistory[]
      
      // Sort client-side by usedAt descending
      return words.sort((a, b) => {
        const aTime = a.usedAt?.toMillis?.() || 0
        const bTime = b.usedAt?.toMillis?.() || 0
        return bTime - aTime
      })
    } catch (error) {
      console.error("Error fetching word history:", error)
      return []
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // Get all unique words used by user
  static async getUserUniqueWords(userId: string): Promise<string[]> {
    try {
      const wordHistory = await this.getUserWordHistory(userId, 1000)
      const uniqueWords = new Set(wordHistory.map((w) => w.word))
      return Array.from(uniqueWords).sort()
    } catch (error) {
      console.error("Error fetching unique words:", error)
      return []
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalGames: number
    totalWins: number
    totalWords: number
    totalScore: number
    winRate: number
    averageScore: number
    averageWordsPerGame: number
  }> {
    try {
      const profile = await this.getUserProfile(userId)
      
      if (!profile) {
        return {
          totalGames: 0,
          totalWins: 0,
          totalWords: 0,
          totalScore: 0,
          winRate: 0,
          averageScore: 0,
          averageWordsPerGame: 0,
        }
      }

      const winRate = profile.gamesPlayed > 0 ? (profile.gamesWon / profile.gamesPlayed) * 100 : 0
      const averageScore = profile.gamesPlayed > 0 ? profile.totalScore / profile.gamesPlayed : 0
      const averageWordsPerGame =
        profile.gamesPlayed > 0 ? profile.totalWords / profile.gamesPlayed : 0

      return {
        totalGames: profile.gamesPlayed,
        totalWins: profile.gamesWon,
        totalWords: profile.totalWords,
        totalScore: profile.totalScore,
        winRate: Math.round(winRate * 10) / 10,
        averageScore: Math.round(averageScore * 10) / 10,
        averageWordsPerGame: Math.round(averageWordsPerGame * 10) / 10,
      }
    } catch (error) {
      console.error("Error calculating user stats:", error)
      return {
        totalGames: 0,
        totalWins: 0,
        totalWords: 0,
        totalScore: 0,
        winRate: 0,
        averageScore: 0,
        averageWordsPerGame: 0,
      }
    }
  }
}
