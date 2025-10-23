import type { Room, WordValidationResult } from "@/types/game"

export async function validateWord(
  roomCode: string,
  word: string,
  playerId: string,
  room: Room
): Promise<WordValidationResult> {
  const normalizedWord = word.toLowerCase().trim()
  const currentPlayer = room.players[room.currentPlayerIndex]

  if (currentPlayer.id !== playerId) {
    return { valid: false, word, reason: "Not your turn" }
  }

  if (!normalizedWord.startsWith(room.currentLetter.toLowerCase())) {
    return {
      valid: false,
      word,
      reason: `Word must start with "${room.currentLetter}"`,
    }
  }

  if (room.usedWords.includes(normalizedWord)) {
    return {
      valid: false,
      word,
      reason: "This word has already been used",
    }
  }

  try {
    const datamuseResponse = await fetch(
      `https://api.datamuse.com/words?sp=${normalizedWord}&md=d&max=1`,
      { signal: AbortSignal.timeout(3000) }
    )

    if (datamuseResponse.ok) {
      const datamuseData = await datamuseResponse.json()

      if (datamuseData.length > 0 && datamuseData[0].word.toLowerCase() === normalizedWord) {
        const meaning = datamuseData[0].defs?.[0]?.replace(/^\w+\t/, "") || "Valid English word"

        return {
          valid: true,
          word: normalizedWord,
          meaning,
          phonetic: "",
        }
      }
    }

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`,
      { signal: AbortSignal.timeout(3000) }
    )

    if (!response.ok) {
      return {
        valid: false,
        word,
        reason: "Word not found in dictionary",
      }
    }

    const data = await response.json()
    const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "No definition available"
    const phonetic = data[0]?.phonetic || ""

    return {
      valid: true,
      word: normalizedWord,
      meaning,
      phonetic,
    }
  } catch (error) {
    return {
      valid: false,
      word,
      reason: "Failed to validate word (timeout or network error)",
    }
  }
}
