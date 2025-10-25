import { motion, AnimatePresence } from "framer-motion"
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CurrentLetterDisplay 
          currentLetter={currentLetter}
          lastWord={lastWord}
          currentPlayerName={currentPlayerName}
          isMyTurn={isMyTurn}
        />
      </motion.div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Remaining</span>
                <motion.span 
                  className="font-mono font-bold"
                  animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
                >
                  {timeLeft}s
                </motion.span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Thinking Indicator */}
      <AnimatePresence>
        {isAIThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-green-500">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold text-green-600">
                    AI is thinking...
                  </div>
                  <motion.div 
                    className="text-muted-foreground"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="w-8 h-8 mx-auto" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Meaning Display */}
      <AnimatePresence>
        {showMeaning && currentMeaning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WordMeaningDisplay
              word={currentMeaning.word}
              meaning={currentMeaning.meaning}
              phonetic={currentMeaning.phonetic}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Input */}
      <AnimatePresence>
        {isMyTurn && !showMeaning && !isAIThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WordInputForm
              wordInput={wordInput}
              onWordInputChange={onWordInputChange}
              onSubmit={onSubmit}
              onKeyPress={onKeyPress}
              currentLetter={currentLetter}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
