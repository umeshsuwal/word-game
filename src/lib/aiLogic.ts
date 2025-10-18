/**
 * AI Logic for the Word Game
 * The AI generates valid words based on the current letter and game state
 */

// Common word lists organized by starting letter
const WORD_DICTIONARY: Record<string, string[]> = {
  A: ["apple", "animal", "artist", "anchor", "ability", "action", "address", "afraid", "airport", "amazing", "ancient", "another", "answer", "anybody", "appear", "arrange", "arrival", "article", "athlete"],
  B: ["banana", "butter", "basket", "bottle", "bridge", "brother", "building", "business", "balance", "beautiful", "believe", "benefit", "birthday", "blanket", "boundary", "breakfast", "brilliant", "broadcast"],
  C: ["castle", "camera", "candle", "carpet", "center", "change", "chapter", "chicken", "children", "chocolate", "choice", "circle", "citizen", "classic", "climate", "clothes", "collect", "community", "complete", "computer", "concert", "control", "correct", "country", "courage", "creative", "culture", "current"],
  D: ["dragon", "danger", "daughter", "decision", "deliver", "describe", "develop", "diamond", "different", "difficult", "digital", "dinner", "direction", "discover", "distance", "district", "document", "domestic"],
  E: ["elephant", "energy", "engine", "evening", "example", "extreme", "educate", "effective", "efficient", "electric", "element", "elevator", "emergency", "emotion", "employee", "encourage", "engineer", "entertainment", "entrance", "envelope", "environment", "equipment", "escape", "estimate", "evidence", "excellent", "exchange", "exercise", "expensive", "experience", "experiment", "explain", "explore", "express", "extension"],
  F: ["flower", "forest", "friend", "frozen", "future", "factory", "failure", "familiar", "family", "fantasy", "fashion", "feature", "federal", "feeling", "festival", "fiction", "finally", "finance", "finding", "finish", "flexible", "flight", "football", "foreign", "forever", "formal", "forward", "foundation", "freedom", "frequent", "friendly", "function"],
  G: ["garden", "gentle", "giraffe", "global", "golden", "gallery", "garbage", "general", "generate", "generous", "genuine", "gesture", "gigantic", "glacier", "glamour", "glitter", "goddess", "government", "graduate", "grammar", "grateful", "gravity", "grocery", "guarantee", "guardian", "guidance"],
  H: ["happy", "honest", "house", "human", "hundred", "habitat", "hallway", "handful", "handsome", "happen", "hardware", "harmony", "harvest", "headline", "healthy", "hearing", "heaven", "helpful", "heritage", "herself", "highway", "historic", "history", "holiday", "homeless", "honest", "hospital", "however", "hundred", "hungry"],
  I: ["island", "inside", "income", "indeed", "identify", "illegal", "illness", "imagine", "immediate", "immigrant", "impact", "implement", "important", "impossible", "improve", "incident", "include", "increase", "incredible", "independent", "indicate", "individual", "industrial", "industry", "infant", "influence", "information", "ingredient", "initial", "initiative", "innocent", "inquiry", "insight", "inspire", "install", "instance", "instead", "institute", "instrument", "insurance", "intelligent", "intend", "intense", "intention", "interest", "internal", "international", "internet", "interpret", "interview", "introduce", "invasion", "invest", "investigate", "invisible", "involve", "island"],
  J: ["jungle", "jacket", "journey", "justice", "jealous", "jewelry", "joyful", "judgment", "junction", "justify"],
  K: ["kitchen", "kingdom", "knowledge", "keyboard"],
  L: ["ladder", "language", "laughter", "leader", "leather", "lecture", "legend", "leisure", "length", "lesson", "letter", "liberty", "library", "license", "lifestyle", "lifetime", "lightning", "likely", "limitation", "liquid", "listen", "literature", "little", "living", "location", "logical", "lonely", "lovely"],
  M: ["mountain", "monkey", "mother", "machine", "magazine", "magical", "maintain", "majority", "manager", "manner", "manual", "manufacture", "margin", "marine", "market", "marriage", "massive", "master", "material", "matter", "maximum", "meadow", "meaning", "measure", "medical", "medicine", "medium", "meeting", "melody", "member", "memory", "mental", "mention", "merchant", "message", "metal", "method", "middle", "midnight", "military", "million", "mineral", "minimum", "minister", "minute", "miracle", "mirror", "mission", "mistake", "mixture", "mobile", "modern", "modest", "modify", "moment", "monitor", "monster", "monthly", "monument", "morning", "mortgage", "motion", "motivate", "motor", "mountain", "movement", "multiple", "muscle", "museum", "music", "mystery"],
  N: ["nature", "nation", "native", "natural", "navigate", "nearby", "nearly", "necessary", "negative", "neighbor", "neither", "nervous", "network", "neutral", "never", "newspaper", "nobody", "noise", "normal", "northern", "notable", "nothing", "notice", "novel", "nowhere", "nuclear", "number", "numerous", "nursery", "nurture"],
  O: ["ocean", "office", "orange", "object", "objective", "obligation", "observation", "observe", "obstacle", "obtain", "obvious", "occasion", "occupy", "occur", "offer", "officer", "official", "often", "ongoing", "opening", "operate", "operation", "operator", "opinion", "opponent", "opportunity", "opposite", "option", "ordinary", "organic", "organize", "origin", "original", "outcome", "outdoor", "outline", "output", "outside", "overall", "overcome", "overflow", "overnight", "overseas", "overview", "oxygen"],
  P: ["purple", "planet", "practice", "package", "painful", "painting", "palace", "panel", "paper", "parade", "parent", "parking", "partner", "passage", "passenger", "passion", "passive", "password", "pattern", "payment", "peaceful", "penalty", "people", "pepper", "percent", "perfect", "perform", "perhaps", "period", "permanent", "permission", "permit", "person", "personal", "persuade", "phase", "phenomenon", "philosophy", "phone", "photo", "phrase", "physical", "piano", "picture", "piece", "pioneer", "pipeline", "planet", "planning", "plant", "plastic", "platform", "player", "pleasant", "please", "pleasure", "plenty", "pocket", "poem", "poetry", "point", "police", "policy", "political", "pollution", "popular", "population", "portrait", "position", "positive", "possess", "possible", "potential", "poverty", "powder", "power", "practical", "practice", "praise", "predict", "prefer", "pregnant", "premium", "prepare", "presence", "present", "preserve", "president", "pressure", "pretend", "pretty", "prevent", "previous", "price", "pride", "primary", "prime", "prince", "princess", "principal", "principle", "print", "prior", "priority", "prison", "private", "prize", "probably", "problem", "procedure", "proceed", "process", "produce", "product", "profession", "professor", "profile", "profit", "program", "progress", "project", "promise", "promote", "prompt", "proof", "proper", "property", "proportion", "proposal", "propose", "prospect", "protect", "protein", "protest", "proud", "prove", "provide", "province", "provision", "public", "publish", "pull", "pump", "punch", "purchase", "pure", "purple", "purpose", "pursue", "push", "puzzle"],
  Q: ["queen", "question", "quick", "quiet", "qualify", "quality", "quantity", "quarter", "quest", "quote"],
  R: ["rainbow", "rocket", "rabbit", "radical", "radio", "railway", "rainfall", "random", "range", "rapid", "rarely", "rather", "rating", "rational", "reaction", "reading", "realistic", "reality", "realize", "really", "reason", "recall", "receipt", "receive", "recent", "recipe", "recognize", "recommend", "record", "recover", "recruit", "reduce", "refer", "reflect", "reform", "refresh", "refugee", "refuse", "regard", "region", "register", "regular", "regulate", "reinforce", "reject", "relate", "relation", "relative", "relax", "release", "relevant", "reliable", "relief", "religion", "rely", "remain", "remark", "remember", "remind", "remote", "removal", "remove", "render", "renew", "rental", "repair", "repeat", "replace", "reply", "report", "represent", "republic", "reputation", "request", "require", "rescue", "research", "resemble", "reserve", "resident", "resist", "resolve", "resort", "resource", "respect", "respond", "response", "responsible", "restaurant", "restore", "restrict", "result", "resume", "retail", "retain", "retire", "retreat", "return", "reveal", "revenue", "review", "revise", "revolution", "reward", "rhythm", "ribbon", "rich", "ridge", "ridiculous", "right", "rigid", "ring", "rise", "risk", "ritual", "river", "road", "robot", "robust", "rocket", "role", "romantic", "roof", "room", "root", "rope", "rose", "rotate", "rough", "round", "route", "routine", "royal", "rub", "rubber", "rude", "ruin", "rule", "rumor", "rural", "rush"],
  S: ["sunset", "super", "strong", "smile", "sacred", "sadness", "safety", "sailing", "sailor", "salary", "salmon", "salon", "sample", "sandwich", "satellite", "satisfy", "sauce", "savage", "saving", "scale", "scandal", "scary", "scatter", "scenario", "scene", "schedule", "scheme", "scholar", "school", "science", "score", "scream", "screen", "script", "sculpture", "search", "season", "second", "secret", "section", "sector", "secure", "security", "segment", "seldom", "select", "senior", "sense", "sentence", "separate", "sequence", "series", "serious", "servant", "serve", "service", "session", "settle", "settlement", "setup", "several", "severe", "shadow", "shake", "shall", "shallow", "shame", "shape", "share", "sharp", "shelter", "shift", "shine", "ship", "shirt", "shock", "shoot", "shopping", "shore", "short", "should", "shoulder", "shout", "shower", "shrine", "shut", "sibling", "sickness", "sidewalk", "sight", "signal", "signature", "significance", "significant", "silence", "silent", "silicon", "silver", "similar", "simple", "simulate", "simultaneous", "since", "sincere", "single", "sister", "situation", "skeleton", "sketch", "skill", "skin", "skirt", "skull", "slight", "smart", "smell", "smile", "smoke", "smooth", "snake", "snapshot", "snow", "social", "society", "software", "soil", "solar", "soldier", "solid", "solution", "solve", "somebody", "somehow", "someone", "something", "sometimes", "somewhere", "sophisticated", "sorry", "sort", "soul", "sound", "soup", "source", "south", "southern", "space", "spare", "spatial", "speak", "special", "species", "specific", "speech", "speed", "spell", "spend", "sphere", "spider", "spirit", "spiritual", "split", "sponsor", "sport", "spot", "spread", "spring", "square", "squeeze", "stable", "stadium", "staff", "stage", "stair", "stake", "stamp", "stand", "standard", "standing", "star", "stare", "start", "state", "statement", "station", "statue", "status", "stay", "steady", "steal", "steam", "steel", "steep", "steer", "stem", "step", "stick", "still", "stimulate", "stock", "stomach", "stone", "stop", "storage", "store", "storm", "story", "straight", "strange", "stranger", "strategic", "strategy", "stream", "street", "strength", "stress", "stretch", "strict", "strike", "string", "strip", "stroke", "strong", "structure", "struggle", "student", "studio", "study", "stuff", "stupid", "style", "subject", "submit", "subsequent", "substance", "substantial", "substitute", "subtle", "succeed", "success", "successful", "such", "sudden", "suffer", "sufficient", "sugar", "suggest", "suicide", "suit", "suitable", "summary", "summer", "summit", "summon", "sunset", "super", "superior", "supervise", "supplement", "supply", "support", "suppose", "supreme", "sure", "surface", "surgery", "surplus", "surprise", "surround", "survey", "survival", "survive", "survivor", "suspect", "sustain", "swallow", "swear", "sweep", "sweet", "swell", "swift", "swim", "swing", "switch", "symbol", "symptom", "system"],
  T: ["thunder", "treasure", "tropical", "table", "tablet", "tackle", "tactics", "talent", "talking", "target", "task", "taste", "taught", "teach", "teacher", "teaching", "team", "tear", "technical", "technique", "technology", "teenager", "telephone", "telescope", "television", "temple", "temporary", "tempt", "tenant", "tend", "tendency", "tender", "tennis", "tension", "tent", "term", "terminal", "terrible", "territory", "terror", "test", "text", "texture", "thank", "theater", "theatre", "theft", "theme", "theory", "therapy", "there", "therefore", "thick", "thin", "thing", "think", "third", "thirst", "thirteen", "thirty", "this", "thorn", "those", "though", "thought", "thousand", "threat", "threaten", "three", "threshold", "thrill", "throat", "throne", "through", "throughout", "throw", "thrust", "thumb", "thunder", "thus", "ticket", "tide", "tidy", "tight", "timber", "time", "timeline", "timer", "timing", "tiny", "tissue", "title", "toast", "tobacco", "today", "toddler", "together", "toilet", "token", "tolerate", "tomato", "tomorrow", "tone", "tongue", "tonight", "tool", "tooth", "topic", "torch", "tornado", "torture", "total", "touch", "tough", "tour", "tourist", "tournament", "toward", "towards", "tower", "town", "toxic", "trace", "track", "trade", "tradition", "traditional", "traffic", "tragedy", "trail", "train", "training", "trait", "transfer", "transform", "transit", "transition", "translate", "transmission", "transmit", "transparent", "transport", "trap", "trash", "travel", "tray", "treasure", "treat", "treatment", "treaty", "tree", "tremble", "tremendous", "trend", "trial", "triangle", "tribe", "tribunal", "tribute", "trick", "trigger", "trillion", "trim", "trip", "triumph", "troop", "trophy", "tropical", "trouble", "truck", "true", "truly", "trumpet", "trunk", "trust", "truth", "tube", "tunnel", "turkey", "turn", "turtle", "twelve", "twenty", "twice", "twin", "twist", "type", "typical"],
  U: ["umbrella", "uncle", "under", "undergo", "understand", "undertake", "undo", "unemployed", "unexpected", "unfair", "unfold", "unfortunate", "unhappy", "uniform", "union", "unique", "unit", "unite", "unity", "universal", "universe", "university", "unknown", "unless", "unlike", "unlikely", "unlock", "unpleasant", "until", "unusual", "unwilling", "update", "upgrade", "uphold", "upload", "upon", "upper", "upright", "upset", "upstairs", "upward", "urban", "urge", "urgent", "usage", "useful", "useless", "user", "usual", "utility", "utilize", "utmost", "utter"],
  V: ["valley", "value", "vampire", "vanilla", "vanish", "variable", "variation", "variety", "various", "vast", "vegetable", "vehicle", "venture", "venue", "verbal", "verdict", "verify", "version", "versus", "vertical", "very", "vessel", "veteran", "viable", "vibrant", "victim", "victory", "video", "view", "village", "violate", "violence", "violent", "virtual", "virtue", "virus", "visible", "vision", "visit", "visitor", "visual", "vital", "vitamin", "vivid", "vocabulary", "vocal", "voice", "volcano", "volleyball", "voltage", "volume", "volunteer", "vote", "voyage"],
  W: ["water", "window", "winter", "wonderful", "wagon", "waist", "wait", "wake", "walk", "wall", "wander", "want", "war", "warm", "warn", "warrant", "warrior", "wash", "waste", "watch", "wave", "weak", "wealth", "weapon", "wear", "weather", "weave", "wedding", "weekend", "weigh", "weight", "weird", "welcome", "welfare", "well", "west", "western", "whatever", "wheat", "wheel", "when", "whenever", "where", "whereas", "wherever", "whether", "which", "while", "whisper", "white", "whole", "whom", "whose", "wide", "widespread", "width", "wild", "wildlife", "will", "willing", "win", "wind", "window", "wine", "wing", "winner", "winter", "wipe", "wire", "wisdom", "wise", "wish", "with", "withdraw", "within", "without", "witness", "wolf", "woman", "wonder", "wonderful", "wood", "wooden", "word", "work", "worker", "working", "workshop", "world", "worldwide", "worm", "worried", "worry", "worse", "worship", "worst", "worth", "would", "wound", "wrap", "wrath", "wreck", "wrestle", "wrist", "write", "writer", "writing", "written", "wrong"],
  X: ["xylophone"],
  Y: ["yellow", "yield", "yacht", "yard", "yarn", "yawn", "year", "yell", "yes", "yesterday", "yet", "young", "younger", "yourself", "youth"],
  Z: ["zebra", "zero", "zone", "zombie", "zoom"],
}

export interface AIWordChoice {
  word: string
  confidence: number
}

export class AIPlayer {
  private usedWords: Set<string>

  constructor() {
    this.usedWords = new Set()
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

    const availableWords = this.getAvailableWords(currentLetter)

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

  private getAvailableWords(letter: string): string[] {
    const letterUpper = letter.toUpperCase()
    const wordList = WORD_DICTIONARY[letterUpper] || []

    // Filter out already used words
    return wordList.filter((word) => !this.usedWords.has(word.toLowerCase()))
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
