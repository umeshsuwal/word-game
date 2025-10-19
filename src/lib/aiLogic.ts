export interface AIWordChoice {
  word: string
  confidence: number
}

export class AIPlayer {
  private usedWords: Set<string>
  private static dictionary: Record<string, string[]> | null = null
  private static dictionaryPromise: Promise<Record<string, string[]>> | null = null

  private static async loadDictionary(): Promise<Record<string, string[]>> {
    if (this.dictionary) {
      return this.dictionary
    }

    if (this.dictionaryPromise) {
      return this.dictionaryPromise
    }

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
        return {}
      })

    return this.dictionaryPromise
  }

  static async prefetchDictionary(): Promise<void> {
    await this.loadDictionary()
  }

  constructor() {
    this.usedWords = new Set<string>()
  }

  async generateWord(
    currentLetter: string,
    usedWords: string[],
    lives: number
  ): Promise<AIWordChoice | null> {
    usedWords.forEach((word) => this.usedWords.add(word.toLowerCase()))

    const availableWords = await this.getAvailableWords(currentLetter)

    if (availableWords.length === 0) {
      return null
    }

    await this.thinkingDelay()

    const mistakeChance = Math.random() * 0.01
    if (Math.random() < mistakeChance) {
      return this.makeIntentionalMistake(currentLetter)
    }

    const selectedWord = this.pickStrategicWord(availableWords, lives)

    return {
      word: selectedWord,
      confidence: 0.99,
    }
  }

  private async getAvailableWords(letter: string): Promise<string[]> {
    const dictionary = await AIPlayer.loadDictionary()
    const letterUpper = letter.toUpperCase()
    const wordList = dictionary[letterUpper] || []

    return wordList.filter((word: string) => !this.usedWords.has(word.toLowerCase()))
  }

  private pickRandomWord(words: string[]): string {
    return words[Math.floor(Math.random() * words.length)]
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
