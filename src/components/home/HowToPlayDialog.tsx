import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, Target, Clock, Heart, Trophy, Zap } from "lucide-react"

interface HowToPlayDialogProps {
  trigger?: React.ReactNode
}

export function HowToPlayDialog({ trigger }: HowToPlayDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="w-full">
            <HelpCircle className="w-5 h-5 mr-2" />
            How to Play
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
            How to Play Word Game
          </DialogTitle>
          <DialogDescription>
            Learn the rules and become a word master!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Game Objective */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-lg">Objective</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Be the last player standing by forming valid words that start with the given letter. 
              Outlast your opponents and prove your vocabulary skills!
            </p>
          </div>

          {/* How to Play */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-lg">How to Play</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Create a room or join an existing one with friends</li>
              <li>Wait for the host to start the game (minimum 2 players required)</li>
              <li>When it's your turn, you'll see a letter at the top</li>
              <li>Type a valid word that starts with that letter</li>
              <li>The next player gets a new random letter and continues</li>
              <li>Keep playing until only one player remains!</li>
            </ol>
          </div>

          {/* Rules */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Rules</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Time Limit</h4>
                    <p className="text-xs text-muted-foreground">
                      You have 30 seconds to submit a word. If time runs out, you lose a life!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Lives System</h4>
                    <p className="text-xs text-muted-foreground">
                      Each player starts with 3 lives. You lose a life if you:
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-2 space-y-1 ml-2">
                      <li>Submit an invalid word</li>
                      <li>Submit a word that doesn't start with the given letter</li>
                      <li>Submit a word that's already been used</li>
                      <li>Run out of time</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      When you lose all 3 lives, you're eliminated from the game.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Winning</h4>
                    <p className="text-xs text-muted-foreground">
                      The last player remaining with at least one life wins the game!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Pro Tips 💡</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Think fast but carefully - a valid word is better than a quick mistake</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Remember words already used to avoid repetition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Keep an eye on the timer and other players' lives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Start with simple, common words if you're running out of time</span>
              </li>
            </ul>
          </div>

          {/* Game Modes */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg">Game Modes</h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">🎮 Multiplayer Mode</h4>
                <p className="text-xs text-muted-foreground">
                  Play with friends online. Create a room and share the code, or join an existing room.
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-1">🤖 AI Mode</h4>
                <p className="text-xs text-muted-foreground">
                  Practice solo against an AI opponent. Perfect for learning or warming up!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
