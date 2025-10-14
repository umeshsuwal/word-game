"use client"

import { Badge } from "@/components/ui/badge"

interface GameHeaderProps {
  roomCode: string
  alivePlayers: number
  timeLeft: number
}

export function GameHeader({ roomCode, alivePlayers, timeLeft }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Room: {roomCode}</h1>
        <p className="text-sm text-muted-foreground">{alivePlayers} players remaining</p>
      </div>
      <Badge variant="secondary" className="text-lg px-4 py-2">
        {timeLeft}s
      </Badge>
    </div>
  )
}
