/**
 * AI Logic for the Word Game
 * The AI generates valid words based on the current letter and game state
 */

export interface AIWordChoice {
  word: string
  confidence: number
}

export class AIPlayer {
  private usedWords: Set<string>
  private static dictionary: Record<string, string[]> | null = null
  private static dictionaryPromise: Promise<Record<string, string[]>> | null = null

  /**
   * Loads the word dictionary from JSON file
   * Uses caching to avoid multiple fetches
   */
  private static async loadDictionary(): Promise<Record<string, string[]>> {
    // Return cached dictionary if already loaded
    if (this.dictionary) {
      return this.dictionary
    }

    // Return existing promise if already loading
    if (this.dictionaryPromise) {
      return this.dictionaryPromise
    }

    // Start loading the dictionary
    this.dictionaryPromise = fetch('/word-dictionary.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load word dictionary: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        this.dictionary = data
        this.dictionaryPromise = null
        return data
      })
      .catch(error => {
        this.dictionaryPromise = null
        console.error('Error loading word dictionary:', error)
        // Return empty dictionary as fallback
        return {}
      })

    return this.dictionaryPromise
  }

  /**
   * Prefetch the dictionary to improve performance
   * Call this early (e.g., on page load) to avoid delays during gameplay
   */
  static async prefetchDictionary(): Promise<void> {
    await this.loadDictionary()
  }

  constructor() {
    this.usedWords = new Set<string>()
  }

  /**
   * Generate a word for the AI based on the current letter and used words
   * Uses expert-level strategy with minimal mistakes
   */
  async generateWord(
    currentLetter: string,
    usedWords: string[],
    lives: number
  ): Promise<AIWordChoice | null> {
    // Update internal used words list
    usedWords.forEach((word) => this.usedWords.add(word.toLowerCase()))

    const availableWords = await this.getAvailableWords(currentLetter)

    if (availableWords.length === 0) {
      return null // No words available
    }

    // Simulate thinking delay (500ms - 1500ms)
    await this.thinkingDelay()

    // Expert AI: <1% mistake rate
    const expertMistakeRate = Math.random() * 0.01
    if (Math.random() < expertMistakeRate) {
      return this.makeIntentionalMistake(currentLetter)
    }

    // Use strategic word selection
    const selectedWord = this.pickStrategicWord(availableWords, lives)
    const confidence = 0.99

    return {
      word: selectedWord,
      confidence,
    }
  }

  private async getAvailableWords(letter: string): Promise<string[]> {
    const dictionary = await AIPlayer.loadDictionary()
    const letterUpper = letter.toUpperCase()
    const wordList = dictionary[letterUpper] || []

    // Filter out already used words
    return wordList.filter((word: string) => !this.usedWords.has(word.toLowerCase()))
  }

  private pickRandomWord(words: string[]): string {
    const randomIndex = Math.floor(Math.random() * words.length)
    return words[randomIndex]
  }

  private pickStrategicWord(words: string[], lives: number): string {
    if (lives <= 1) {
      const safeWords = words.filter((w) => w.length >= 4 && w.length <= 7)
      return safeWords.length > 0
        ? this.pickRandomWord(safeWords)
        : this.pickRandomWord(words)
    }

    const longWords = words.filter((w) => w.length >= 7)
    return longWords.length > 0 ? this.pickRandomWord(longWords) : this.pickRandomWord(words)
  }

  private async thinkingDelay(): Promise<void> {
    // Expert AI thinks fast: 500ms - 1500ms
    const delay = 500 + Math.random() * 1000
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  private makeIntentionalMistake(currentLetter: string): AIWordChoice | null {
    const mistakes = [
      { word: "mistake", confidence: 0.3 },
      { word: "xyz", confidence: 0.2 },
      null,
    ]

    const randomMistake = mistakes[Math.floor(Math.random() * mistakes.length)]
    return randomMistake
  }

  reset(): void {
    this.usedWords.clear()
  }
}
