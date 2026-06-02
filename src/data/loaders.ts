import type { Kana, Word, UnitLesson } from '../types'
import type { LevelsData } from '../types/adventure'
import rawKana from './kana.json'
import rawVocab from './vocabulary.json'
import rawLessons from './unit_lessons.json'
import rawLevels from '../../data/levels.json'

// Eagerly unwrap bundled JSON (synchronous; wrapped in async for future dynamic-load compat)
const _kana: Kana[] = (rawKana as { kana: Kana[] }).kana
const _vocab: Word[] = (rawVocab as { words: Word[] }).words
const _lessons: UnitLesson[] = (rawLessons as { lessons: UnitLesson[] }).lessons
const _levelsRaw = rawLevels as unknown as LevelsData & { $schema?: string; _meta?: unknown; _review?: unknown }
const _levels: LevelsData = { regions: _levelsRaw.regions, levels: _levelsRaw.levels }

export async function loadKana(): Promise<Kana[]> {
  try {
    return _kana
  } catch (e) {
    throw new Error(`loadKana failed: ${String(e)}`)
  }
}

export async function loadVocabulary(): Promise<Word[]> {
  try {
    return _vocab
  } catch (e) {
    throw new Error(`loadVocabulary failed: ${String(e)}`)
  }
}

export async function loadUnitLessons(): Promise<UnitLesson[]> {
  try {
    return _lessons
  } catch (e) {
    throw new Error(`loadUnitLessons failed: ${String(e)}`)
  }
}

export function getLessonById(id: string): UnitLesson | null {
  return _lessons.find((l) => l.unit_id === id) ?? null
}

export function getWordById(id: string): Word | null {
  return _vocab.find((w) => w.id === id) ?? null
}

export function getKanaByHiragana(char: string): Kana | null {
  return _kana.find((k) => k.hiragana === char) ?? null
}

// Sync accessors for component initialization (safe since data is bundled)
export function kanaData(): Kana[] { return _kana }
export function vocabData(): Word[] { return _vocab }
export function lessonData(): UnitLesson[] { return _lessons }
export function levelsData(): LevelsData { return _levels }
