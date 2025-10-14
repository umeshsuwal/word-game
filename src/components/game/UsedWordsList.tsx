"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UsedWordsListProps {
  usedWords: string[]
}

export function UsedWordsList({ usedWords }: UsedWordsListProps) {
  if (usedWords.length === 0) return null

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Words Used ({usedWords.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {usedWords.map((word, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
