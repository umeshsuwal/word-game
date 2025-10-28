"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { AuthForm } from "@/components/auth/AuthForm"
import { UserProfileBar } from "@/components/home/UserProfileBar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Users, Bot, HelpCircle, LogIn, ArrowLeft } from "lucide-react"
import { HowToPlayDialog } from "@/components/home/HowToPlayDialog"

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [redirectAfterAuth, setRedirectAfterAuth] = useState<string | null>(null)

  if (showAuth && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AuthForm 
            onSuccess={() => {
              setShowAuth(false)
              if (redirectAfterAuth) {
                router.push(redirectAfterAuth)
                setRedirectAfterAuth(null)
              }
            }}
            onBack={() => {
              setShowAuth(false)
              setRedirectAfterAuth(null)
            }}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <UserProfileBar user={user} onLogout={logout} />
          </motion.div>
        )}

        <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)]">
          <CardHeader className="text-center space-y-6 pt-10 pb-8">
            <motion.div 
              className="mx-auto relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Gamepad2 className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </motion.div>
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <CardTitle className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
                Word Game
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                Challenge your vocabulary skills
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-3 pb-10 px-8">
            {/* Multiplayer Mode */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => router.push("/multiplayer")}
              >
                <Users className="w-5 h-5 mr-2" />
                Multiplayer Mode
              </Button>
            </motion.div>

            {/* AI Mode */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-semibold border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 hover:bg-green-600 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => {
                  if (!user) {
                    setRedirectAfterAuth("/ai-mode")
                    setShowAuth(true)
                  } else {
                    router.push("/ai-mode")
                  }
                }}
              >
                <Bot className="w-5 h-5 mr-2" />
                Play vs AI
              </Button>
            </motion.div>

            {/* How to Play */}
            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <HowToPlayDialog 
                trigger={
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-12 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    How to Play
                  </Button>
                }
              />
            </motion.div>

            {!user && (
              <>
                <motion.div 
                  className="relative py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-black px-3 text-gray-500 dark:text-gray-500 font-semibold tracking-wider">
                      Optional
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-12 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setShowAuth(true)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in to track your progress
                  </Button>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
