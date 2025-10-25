"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlayerAvatar } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"
import type { Player } from "@/types/game"

interface WinnerCardProps {
  winner: Player
}

export function WinnerCard({ winner }: WinnerCardProps) {
  return (
    <Card className="border-4 border-yellow-500">
      <CardHeader className="text-center">
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <CardTitle className="text-3xl"> Game Over! </CardTitle>
          <CardDescription className="text-lg">
            <span className="font-bold text-foreground">{winner.username}</span> wins!
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <PlayerAvatar username={winner.username} size={80} />
          </motion.div>
          <motion.p 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            {winner.score} points
          </motion.p>
        </motion.div>
      </CardContent>
    </Card>
  )
}
