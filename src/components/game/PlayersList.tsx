"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayerAvatar } from "@/components/ui/avatar"
import { Trophy, Heart } from "lucide-react"
import type { Player } from "@/types/game"

interface PlayersListProps {
  players: Player[]
  currentPlayerId: string
}

export function PlayersList({ players, currentPlayerId }: PlayersListProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player) => {
            const isCurrentTurn = player.id === currentPlayerId

            return (
              <div
                key={player.id}
                className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
                  player.isAlive
                    ? isCurrentTurn
                      ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                      : "bg-muted/50"
                    : "bg-destructive/10 opacity-50"
                }`}
              >
                <div className="relative">
                  <PlayerAvatar username={player.username} size={32} />
                  {!player.isAlive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{player.username}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Trophy className="w-3 h-3" />
                      <span>{player.score}</span>
                    </div>
                    {player.isAlive && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-3 h-3 ${
                              i < player.lives
                                ? "fill-red-500 text-red-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
