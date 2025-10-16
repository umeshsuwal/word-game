"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      // Create user profile in Firestore if it doesn't exist
      if (user) {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            gamesPlayed: 0,
            gamesWon: 0,
            totalWords: 0,
            totalScore: 0,
          })
        }
      }
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
      
      // Create user profile in Firestore
      const userRef = doc(db, "users", userCredential.user.uid)
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        photoURL: null,
        createdAt: serverTimestamp(),
        gamesPlayed: 0,
        gamesWon: 0,
        totalWords: 0,
        totalScore: 0,
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
