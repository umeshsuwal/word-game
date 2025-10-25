"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerAvatar } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"
import type { Player } from "@/types/game"

interface LeaderboardProps {
  players: Player[]
  roomCode: string
}

export function Leaderboard({ players, roomCode }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Award className="w-6 h-6 text-amber-700" />
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Final Leaderboard</CardTitle>
        <CardDescription>Room: {roomCode}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index === 0
                  ? "bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500"
                  : "bg-muted/50"
              }`}
            >
              <motion.div 
                className="flex items-center justify-center w-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {getMedalIcon(index) || (
                  <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                )}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <PlayerAvatar username={player.username} size={48} />
              </motion.div>
              <div className="flex-1">
                <p className="font-bold text-lg">{player.username}</p>
                <Badge variant={player.isAlive ? "default" : "secondary"}>
                  {player.isAlive ? "Survived" : "Eliminated"}
                </Badge>
              </div>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
              >
                <p className="text-2xl font-bold">{player.score}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
