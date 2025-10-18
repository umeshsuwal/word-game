import { Bot } from "lucide-react"

interface AILoadingScreenProps {
  isCheckingAuth: boolean
}

export function AILoadingScreen({ isCheckingAuth }: AILoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="mx-auto relative w-16 h-16">
          <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Bot className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>
        <div>
          <p className="text-lg font-medium">
            {isCheckingAuth ? "Checking authentication..." : "Starting AI Mode..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {isCheckingAuth ? "Please wait" : "Preparing Expert AI opponent"}
          </p>
        </div>
      </div>
    </div>
  )
}
