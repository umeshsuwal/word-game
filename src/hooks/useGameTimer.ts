import { useState, useRef, useCallback } from "react"

const TURN_TIME = 30

export function useGameTimer(onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIME)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [onTimeout])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    setTimeLeft(TURN_TIME)
  }, [])

  return {
    timeLeft,
    startTimer,
    stopTimer,
    resetTimer,
    TURN_TIME,
  }
}
