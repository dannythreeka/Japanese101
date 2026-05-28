export interface AudioHint {
  ipa: string
  english_equivalent: string
}

export interface KanaItem {
  id: string
  hiragana: string
  katakana: string
  romaji: string
  row: string
  difficulty_level: 'level_1' | 'level_2' | 'level_3'
  audio_hint: AudioHint
}

export interface KanaData {
  difficulty_levels: Record<string, string>
  kana_list: KanaItem[]
}

export interface ImageMetadata {
  keyword: string
  license_type: string
  source_url: string
  creator_attribution: string
}

export interface VocabWord {
  id: string
  kana: string
  romaji: string
  meaning_zh: string
  category: string
  emoji: string
  image_metadata?: ImageMetadata
}

export interface VocabUnit {
  unit_id: string
  unit_title: string
  unit_zh: string
  words: VocabWord[]
}

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

export type KanaMode = 'hiragana' | 'katakana' | 'both'
export type KanaDifficulty = 'level_1' | 'level_2' | 'level_3' | 'all'
export type AppScreen = 'home' | 'kana' | 'flashcard' | 'quiz' | 'parent'
