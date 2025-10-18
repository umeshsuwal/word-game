import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"
import type { Player } from "@/types/game"

interface AIGameOverScreenProps {
  winner: Player
  players: Player[]
  onPlayAgain: () => void
  onGoHome: () => void
}

export function AIGameOverScreen({ winner, players, onPlayAgain, onGoHome }: AIGameOverScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-gray-200 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)]">
        <CardContent className="py-10 px-8 space-y-6 text-center">
          <div className="relative">
            <div className={`absolute inset-0 ${winner.id === "human" ? "bg-yellow-500" : "bg-green-500"} rounded-full blur-2xl opacity-20`} />
            <div className="relative text-7xl mb-2">{winner.id === "human" ? "🏆" : "🤖"}</div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              {winner.id === "human" ? "You Win!" : "AI Wins!"}
            </h1>
            <p className="text-muted-foreground">
              {winner.id === "human" 
                ? "Congratulations! You've mastered the words!" 
                : "Good try! Practice makes perfect!"}
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Final Score</div>
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center p-4 rounded-lg transition-all ${
                  player.id === winner.id 
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-500 dark:border-green-600" 
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.isAI ? <Bot className="w-5 h-5" /> : <span className="text-xl">👤</span>}
                  <span className="font-semibold">{player.username}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{player.score}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onPlayAgain}
              className="w-full"
            >
              Play Again
            </Button>
            <Button 
              size="lg" 
              onClick={onGoHome}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
