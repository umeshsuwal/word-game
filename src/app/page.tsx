"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthForm } from "@/components/auth/AuthForm"
import { UserProfileBar } from "@/components/home/UserProfileBar"
import { MainMenuCard } from "@/components/home/MainMenuCard"

export default function HomePage() {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {user && (
          <UserProfileBar user={user} onLogout={logout} />
        )}

        {showAuth && !user ? (
          <div className="animate-in fade-in duration-300">
            <AuthForm onSuccess={() => setShowAuth(false)} />
          </div>
        ) : (
          <MainMenuCard 
            showSignInPrompt={!user}
            onSignInClick={() => setShowAuth(true)}
          />
        )}
      </div>
    </div>
  )
}
