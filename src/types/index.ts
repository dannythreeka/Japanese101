// ── §4.1 Kana ─────────────────────────────────────────────────────────────────

export type KanaType = 'seion' | 'dakuon' | 'handakuon' | 'youon'

export interface Kana {
  id: string
  hiragana: string
  katakana: string
  romaji: string
  row: string
  type: KanaType
  difficulty: 1 | 2 | 3
}

/** @deprecated use Kana */
export type KanaItem = Kana

// ── §4.2 Vocabulary ───────────────────────────────────────────────────────────

export interface Asset {
  src: string
  license: string
  source_url?: string
  origin?: string
}

export interface Word {
  id: string
  kana: string
  romaji: string
  meaning_zh: string
  category: string
  unit?: string
  emoji?: string
  source?: 'mitsumura_content' | 'mitsumura_qr' | 'extended'
  image: Asset
  audio: Asset
}

/** @deprecated use Word */
export type VocabWord = Word

// ── §4.3 PetState (IndexedDB only) ───────────────────────────────────────────

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

// ── §4.4 UnitLesson ───────────────────────────────────────────────────────────

export type TeachingStep = 'recognize' | 'minimal_pair' | 'produce' | 'listen_pick' | 'write'

export type GameModeId =
  | 'kana_catch_listen'
  | 'kana_catch_minimal_pair'
  | 'kana_catch_word_to_image'
  | 'dakuten_drag'
  | 'kotodama_summon'
  | 'karaoke_rhythm'
  | 'echo_record'
  | 'write_canvas'

export interface KotodamaScene {
  scene_id: string
  initial_state: string
  success_state: string
  asset_hint: string
  anim_hint: string
}

export interface ConceptWord {
  id: string
  word: string
  meaning_zh: string
  pair_with?: string
  kotodama_scene?: KotodamaScene
}

export interface DakutenDragItem {
  base: string
  target: string
  meaning_zh: string
  mark_at: number[]
  mark: 'dakuten' | 'handakuten'
}

export interface UnitLesson {
  unit_id: string
  source_ref: { publisher: string; grade: string; page_hint?: string }
  unit_name_zh: string
  learning_concept: string
  sub_goals: string[]
  target_kana_pairs: string[][]
  teaching_structure: TeachingStep[]
  suggested_game_modes: GameModeId[]
  concept_words: ConceptWord[]
  dakuten_drag_items?: DakutenDragItem[]
}

// ── §5 Game interfaces ────────────────────────────────────────────────────────

export interface AnswerResult {
  correct: boolean
  itemId: string
  latencyMs: number
}

export interface GameResult {
  xpGained: number
  accuracy: number
  items: string[]
}

export interface GameModule<TConfig = unknown, TAnswer = unknown> {
  id: GameModeId | 'kana_catch_listen'
  start(config: TConfig): void
  onAnswer(input: TAnswer): AnswerResult
  onComplete(): GameResult
  destroy(): void
}

// ── §5.1 Kana Catch config ────────────────────────────────────────────────────

export type KanaCatchSubMode = 'listen' | 'listen_katakana' | 'minimal_pair' | 'word_to_image'

export interface KanaCatchConfig {
  subMode: KanaCatchSubMode
  unitId?: string
  fallSpeed: number
  maxBubbles: number
  showRomajiHint: boolean
  showImageHint: boolean
  includeDakuon: boolean
  includeHandakuon: boolean
  includeYouon: boolean
  comboEnabled: boolean
  roundLength: number
}

// ── §5.2 Dakuten Drag config ──────────────────────────────────────────────────

export interface DakutenDragConfig {
  unitId: string
  showImageHint: boolean
  showRomajiHint: boolean
  autoPlayAudioOnLoad: boolean
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
  feature: 'kana' | 'flashcard' | 'quiz' | 'kana_catch' | 'dakuten_drag' | 'kana_write' | 'kotodama'
  correct: number
  total: number
}

// ── App settings ──────────────────────────────────────────────────────────────

export type KanaMode = 'hiragana' | 'katakana' | 'both'
export type KanaDifficulty = 1 | 2 | 3 | 'all'
export type AgeMode = 'young' | 'advanced'
export type MicMode = 'off' | 'offline' | 'enhanced'
