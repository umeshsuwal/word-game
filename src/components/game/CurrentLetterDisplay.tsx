"use client"

import { Card, CardContent } from "@/components/ui/card"

interface CurrentLetterDisplayProps {
  currentLetter: string
  lastWord: string | null
  currentPlayerName: string
  isMyTurn: boolean
}

export function CurrentLetterDisplay({
  currentLetter,
  lastWord,
  currentPlayerName,
  isMyTurn,
}: CurrentLetterDisplayProps) {
  return (
    <Card className="border-4 border-primary">
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            {lastWord ? `Last word: "${lastWord}" - Start with` : "Current Letter"}
          </p>
          <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentLetter}
          </div>
          <p className="text-xl font-medium">{isMyTurn ? "Your turn!" : `${currentPlayerName}'s turn`}</p>
        </div>
      </CardContent>
    </Card>
  )
}
