import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bot } from "lucide-react"
import { CurrentLetterDisplay } from "@/components/game/CurrentLetterDisplay"
import { WordMeaningDisplay } from "@/components/game/WordMeaningDisplay"
import { WordInputForm } from "@/components/game/WordInputForm"

interface AIGameBoardProps {
  currentLetter: string
  lastWord: string | null
  currentPlayerName: string
  isMyTurn: boolean
  timeLeft: number
  turnTime: number
  isAIThinking: boolean
  showMeaning: boolean
  currentMeaning: {
    word: string
    meaning: string
    phonetic: string
  } | null
  wordInput: string
  onWordInputChange: (value: string) => void
  onSubmit: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function AIGameBoard({
  currentLetter,
  lastWord,
  currentPlayerName,
  isMyTurn,
  timeLeft,
  turnTime,
  isAIThinking,
  showMeaning,
  currentMeaning,
  wordInput,
  onWordInputChange,
  onSubmit,
  onKeyPress,
}: AIGameBoardProps) {
  const progressPercentage = (timeLeft / turnTime) * 100

  return (
    <div className="lg:col-span-2 space-y-4">
      <CurrentLetterDisplay 
        currentLetter={currentLetter}
        lastWord={lastWord}
        currentPlayerName={currentPlayerName}
        isMyTurn={isMyTurn}
      />

      {/* Timer */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className="font-mono font-bold">{timeLeft}s</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* AI Thinking Indicator */}
      {isAIThinking && (
        <Card className="border-2 border-green-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-green-600">
                AI is thinking...
              </div>
              <div className="text-muted-foreground animate-pulse">
                <Bot className="w-8 h-8 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Word Meaning Display */}
      {showMeaning && currentMeaning && (
        <WordMeaningDisplay
          word={currentMeaning.word}
          meaning={currentMeaning.meaning}
          phonetic={currentMeaning.phonetic}
        />
      )}

      {/* Word Input */}
      {isMyTurn && !showMeaning && !isAIThinking && (
        <WordInputForm
          wordInput={wordInput}
          onWordInputChange={onWordInputChange}
          onSubmit={onSubmit}
          onKeyPress={onKeyPress}
          currentLetter={currentLetter}
        />
      )}
    </div>
  )
}
