"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface WordInputFormProps {
  currentLetter: string
  wordInput: string
  onWordInputChange: (value: string) => void
  onSubmit: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function WordInputForm({
  currentLetter,
  wordInput,
  onWordInputChange,
  onSubmit,
  onKeyPress,
}: WordInputFormProps) {
  return (
    <Card>
      <CardContent className="py-6 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Type a word starting with "${currentLetter}"...`}
            value={wordInput}
            onChange={(e) => onWordInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="text-lg"
            autoFocus
          />
          <Button onClick={onSubmit} size="lg">
            Submit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Word must start with <span className="font-bold text-foreground">{currentLetter}</span>. Press Enter to
          submit.
        </p>
      </CardContent>
    </Card>
  )
}
