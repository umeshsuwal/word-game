"use client"

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
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index === 0
                  ? "bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500"
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getMedalIcon(index) || (
                  <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <PlayerAvatar username={player.username} size={48} />
              <div className="flex-1">
                <p className="font-bold text-lg">{player.username}</p>
                <Badge variant={player.isAlive ? "default" : "secondary"}>
                  {player.isAlive ? "Survived" : "Eliminated"}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{player.score}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
