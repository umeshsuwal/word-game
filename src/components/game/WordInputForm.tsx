"use client"

import type React from "react"
import { motion } from "framer-motion"
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
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            placeholder={`Type a word starting with "${currentLetter}"...`}
            value={wordInput}
            onChange={(e) => onWordInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="text-lg"
            autoFocus
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onSubmit} size="lg">
              Submit
            </Button>
          </motion.div>
        </motion.div>
        <motion.p 
          className="text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Word must start with <span className="font-bold text-foreground">{currentLetter}</span>. Press Enter to
          submit.
        </motion.p>
      </CardContent>
    </Card>
  )
}
