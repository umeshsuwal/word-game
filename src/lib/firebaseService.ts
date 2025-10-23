import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Room, Player } from "@/types/game"

export class FirebaseService {
  private roomsCollection = collection(db, "rooms")

  async saveRoom(room: Room): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, room.code)
      await setDoc(roomRef, {
        ...room,
        updatedAt: serverTimestamp(),
        createdAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("Error saving room:", error)
      throw error
    }
  }

  async getRoom(roomCode: string): Promise<Room | null> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      const roomSnap = await getDoc(roomRef)

      if (!roomSnap.exists()) {
        return null
      }

      return roomSnap.data() as Room
    } catch (error) {
      console.error("Error getting room:", error)
      return null
    }
  }

  async updateRoom(roomCode: string, updates: Partial<Room>): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      await updateDoc(roomRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating room:", error)
      throw error
    }
  }

  async deleteRoom(roomCode: string): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      await deleteDoc(roomRef)
    } catch (error) {
      console.error("Error deleting room:", error)
      throw error
    }
  }

  async addUsedWord(roomCode: string, word: string): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      await updateDoc(roomRef, {
        usedWords: arrayUnion(word),
        lastWord: word,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error adding used word:", error)
      throw error
    }
  }

  async updatePlayer(roomCode: string, players: Player[]): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      await updateDoc(roomRef, {
        players,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating player:", error)
      throw error
    }
  }

  async updateGameState(
    roomCode: string,
    updates: {
      currentPlayerIndex?: number
      currentLetter?: string
      gameStarted?: boolean
      gameOver?: boolean
      winner?: Player | null
    }
  ): Promise<void> {
    try {
      const roomRef = doc(this.roomsCollection, roomCode)
      await updateDoc(roomRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating game state:", error)
      throw error
    }
  }
}

export const firebaseService = new FirebaseService()
