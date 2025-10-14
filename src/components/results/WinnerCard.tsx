"use client"

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
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-yellow-500" />
        </div>
        <CardTitle className="text-3xl"> Game Over! </CardTitle>
        <CardDescription className="text-lg">
          <span className="font-bold text-foreground">{winner.username}</span> wins!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="text-center space-y-2">
          <PlayerAvatar username={winner.username} size={80} />
          <p className="text-2xl font-bold">{winner.score} points</p>
        </div>
      </CardContent>
    </Card>
  )
}
