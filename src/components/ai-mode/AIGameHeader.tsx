import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DoorOpen, Bot } from "lucide-react"

interface AIGameHeaderProps {
  onLeave: () => void
}

export function AIGameHeader({ onLeave }: AIGameHeaderProps) {
  return (
    <Card className="border-2">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AI Mode</h1>
              <p className="text-xs text-muted-foreground">
                Expert Difficulty
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLeave}>
            <DoorOpen className="w-4 h-4 mr-1" />
            Leave Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
