"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, ArrowLeft } from "lucide-react"

export default function MultiplayerPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)]">
          <CardHeader className="text-center space-y-6 pt-10 pb-8">
            <div className="mx-auto relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Users className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
                Multiplayer Mode
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                Play with friends in real-time word battles
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 pb-10 px-8">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => router.push("/create")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Room
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => router.push("/join")}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Existing Room
            </Button>

            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
