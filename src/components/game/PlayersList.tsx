"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerAvatar } from "@/components/ui/avatar"
import { Trophy, Heart, User, Bot } from "lucide-react"
import type { Player } from "@/types/game"

interface PlayersListProps {
  players: Player[]
  currentPlayerId: string
}

export function PlayersList({ players, currentPlayerId }: PlayersListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => {
            const isCurrentTurn = player.id === currentPlayerId

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
                className={`p-3 rounded-lg transition-all ${
                  player.isAlive
                    ? isCurrentTurn
                      ? "bg-indigo-50 dark:bg-indigo-950/50 border-2 border-indigo-500"
                      : "bg-muted/50 border-2 border-transparent"
                    : "bg-gray-100 dark:bg-gray-900 opacity-60 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <motion.div 
                      className="relative flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {player.isAI ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <PlayerAvatar username={player.username} size={32} />
                      )}
                      {!player.isAlive && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-white text-xs font-bold">✕</span>
                        </motion.div>
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{player.username}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="w-3 h-3" />
                        <span>{player.score} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  {player.isAlive && (
                    <motion.div 
                      className="flex items-center gap-0.5 flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              i < player.lives
                                ? "fill-red-500 text-red-500"
                                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
