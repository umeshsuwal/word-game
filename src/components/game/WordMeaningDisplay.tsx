"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"

interface WordMeaningDisplayProps {
  word: string
  meaning: string
  phonetic?: string
}

export function WordMeaningDisplay({ word, meaning, phonetic }: WordMeaningDisplayProps) {
  const handlePronounce = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
      <CardContent className="py-6 space-y-2">
        <div className="flex items-center gap-2 justify-center">
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{word}</h3>
          <Button variant="ghost" size="icon" onClick={handlePronounce}>
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>
        {phonetic && <p className="text-center text-sm text-muted-foreground">{phonetic}</p>}
        <p className="text-center text-green-800 dark:text-green-200">{meaning}</p>
      </CardContent>
    </Card>
  )
}
