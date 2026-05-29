// ── Shared data layer (kana.json / vocabulary.json) ──────────────────────────

export interface KanaItem {
  id: string
  hiragana: string
  katakana: string
  romaji: string
  row: string
  type: 'seion' | 'dakuon' | 'handakuon' | 'youon'
  difficulty: 1 | 2 | 3
}

export interface VocabImage {
  src: string
  license: string
  source_url: string
}

export interface VocabAudio {
  src: string
  origin: 'tts_generated' | 'recorded'
}

export interface VocabWord {
  id: string
  kana: string
  romaji: string
  meaning_zh: string
  category: string
  unit: string
  emoji?: string
  image: VocabImage
  audio: VocabAudio
}

// ── Pet app types (IndexedDB only, not in repo) ───────────────────────────────

export interface PetState {
  petId: string
  species: 'fox' | 'cat' | 'dragon'
  level: number
  xp: number
  evolutionStage: number
  unlockedCosmetics: string[]
  collection: string[]
  lastPlayed: string
}

// ── Game module interface ─────────────────────────────────────────────────────

export interface GameConfig {
  mode: 'young' | 'advanced'
}

export interface AnswerInput {
  kanaId: string
  latencyMs: number
}

export interface AnswerResult {
  correct: boolean
  kanaId: string
  latencyMs: number
}

export interface GameResult {
  xpGained: number
  accuracy: number
  items: string[]
}

export interface GameModule {
  id: string
  start(config: GameConfig): void
  onAnswer(input: AnswerInput): AnswerResult
  onComplete(): GameResult
  destroy(): void
}

// ── Kana Catch game config ────────────────────────────────────────────────────

export interface KanaCatchConfig {
  fallSpeed: number
  maxBubbles: number
  showRomajiHint: boolean
  showImageHint: boolean
  includeDakuon: boolean
  includeYouon: boolean
  comboEnabled: boolean
  roundLength: number
}

// ── Progress & session (IndexedDB) ────────────────────────────────────────────

export interface ProgressRecord {
  id: string
  type: 'kana' | 'vocab'
  correct: number
  incorrect: number
  lastSeen: number
  nextReview: number
  streak: number
}

export interface SessionRecord {
  id: string
  date: number
  durationMs: number
  feature: 'kana' | 'flashcard' | 'quiz'
  correct: number
  total: number
}

// ── App settings ──────────────────────────────────────────────────────────────

export type KanaMode = 'hiragana' | 'katakana' | 'both'
export type KanaDifficulty = 1 | 2 | 3 | 'all'
export type AgeMode = 'young' | 'advanced'
