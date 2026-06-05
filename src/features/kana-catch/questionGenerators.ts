import type { Kana, Word, ConceptWord, ProgressRecord, AgeMode, KanaDifficulty } from '../../types'
import { getAllProgress } from '../../db'
import type { BubbleItem, QuestionConfig } from './KanaCatchEngine'

// ── SRS helpers ───────────────────────────────────────────────────────────────

export async function loadProgressMap(): Promise<Map<string, ProgressRecord>> {
  const all = await getAllProgress()
  return new Map(all.map(r => [r.id, r]))
}

function srsWeightedPick<T>(items: T[], getId: (t: T) => string, pMap: Map<string, ProgressRecord>): T {
  const due = items.filter(t => {
    const p = pMap.get(getId(t))
    return !p || p.nextReview <= Date.now()
  })
  const pool = due.length > 0 ? due : items
  return pool[Math.floor(Math.random() * pool.length)]
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Pool / param helpers (re-exported for KanaCatchGame) ─────────────────────

export function buildPool(allKana: Kana[], ageMode: AgeMode, kanaDifficulty: KanaDifficulty): Kana[] {
  let base: Kana[]
  if (ageMode === 'young' && (kanaDifficulty === 1 || kanaDifficulty === 'all')) {
    base = allKana.filter(k => k.type === 'seion')
  } else if (kanaDifficulty === 'all') {
    base = allKana
  } else {
    base = allKana.filter(k => k.difficulty <= (kanaDifficulty as number))
  }
  const fallback = allKana.filter(k => k.type === 'seion')
  return base.length >= 4 ? base : fallback
}

export function buildParams(ageMode: AgeMode): { fallSpeed: number; showRomaji: boolean; roundLength: number } {
  return ageMode === 'young'
    ? { fallSpeed: 40, showRomaji: true,  roundLength: 10 }
    : { fallSpeed: 55, showRomaji: false, roundLength: 10 }
}

// ── Submode A: listen ─────────────────────────────────────────────────────────

export function makeListenGenerator(
  kanaPool: Kana[],
  maxBubbles: number,
  pMap: Map<string, ProgressRecord>,
): () => QuestionConfig {
  const queue = [...shuffled(kanaPool)]
  let idx = 0
  let lastId = ''
  return () => {
    if (idx >= queue.length) idx = 0
    const window = queue.slice(idx, idx + Math.min(10, queue.length))
    const available = window.length > 1 ? window.filter(k => k.id !== lastId) : window
    const correct = srsWeightedPick(available, k => k.id, pMap)
    lastId = correct.id
    idx++
    const count = Math.min(maxBubbles - 1, kanaPool.length - 1)
    const others = shuffled(kanaPool.filter(k => k.id !== correct.id)).slice(0, count)
    const items: BubbleItem[] = shuffled([correct, ...others]).map(k => ({
      id: k.id, display: k.hiragana, romaji: k.romaji,
    }))
    return { items, targetId: correct.id, ttsText: correct.hiragana }
  }
}

// ── Submode A2: listen_katakana ───────────────────────────────────────────────

export function makeKatakanaListenGenerator(
  kanaPool: Kana[],
  maxBubbles: number,
  pMap: Map<string, ProgressRecord>,
): () => QuestionConfig {
  const queue = [...shuffled(kanaPool)]
  let idx = 0
  let lastId = ''
  return () => {
    if (idx >= queue.length) idx = 0
    const window = queue.slice(idx, idx + Math.min(10, queue.length))
    const available = window.length > 1 ? window.filter(k => k.id !== lastId) : window
    const correct = srsWeightedPick(available, k => k.id, pMap)
    lastId = correct.id
    idx++
    const count = Math.min(maxBubbles - 1, kanaPool.length - 1)
    const others = shuffled(kanaPool.filter(k => k.id !== correct.id)).slice(0, count)
    const items: BubbleItem[] = shuffled([correct, ...others]).map(k => ({
      id: k.id, display: k.katakana, romaji: k.romaji,
    }))
    return { items, targetId: correct.id, ttsText: correct.hiragana }
  }
}

// ── Submode B: minimal_pair ───────────────────────────────────────────────────

export function makeMinimalPairGenerator(
  pairs: string[][],
  allKana: Kana[],
  maxBubbles: number,
  pMap: Map<string, ProgressRecord>,
): () => QuestionConfig {
  const kanaByHiragana = new Map(allKana.map(k => [k.hiragana, k]))
  // flatten all kana that appear in pairs
  const pairKana: Kana[] = [...new Set(pairs.flat())]
    .map(h => kanaByHiragana.get(h))
    .filter((k): k is Kana => k !== undefined)

  const queue = [...shuffled(pairKana)]
  let idx = 0
  let lastId = ''
  return () => {
    if (idx >= queue.length) idx = 0
    const available = queue.length > 1 ? queue.filter(k => k.id !== lastId) : queue
    const correct = srsWeightedPick(available, k => k.id, pMap)
    lastId = correct.id
    idx++
    const distractors = shuffled(pairKana.filter(k => k.id !== correct.id)).slice(0, maxBubbles - 1)
    const items: BubbleItem[] = shuffled([correct, ...distractors]).map(k => ({
      id: k.id, display: k.hiragana, romaji: k.romaji,
    }))
    return { items, targetId: correct.id, ttsText: correct.hiragana }
  }
}

// ── Submode C: word_to_image ──────────────────────────────────────────────────

export function makeWordToImageGenerator(
  conceptWords: ConceptWord[],
  vocabulary: Word[],
  maxBubbles: number,
  pMap: Map<string, ProgressRecord>,
): () => QuestionConfig {
  const vocabById = new Map(vocabulary.map(w => [w.id, w]))
  // only include concept words that exist in vocabulary
  const validConcepts = conceptWords.filter(cw => vocabById.has(cw.id))

  const queue = [...shuffled(validConcepts)]
  let idx = 0
  let lastId = ''
  return () => {
    if (validConcepts.length === 0) {
      return { items: [], targetId: '', ttsText: '' }
    }
    if (idx >= queue.length) idx = 0
    const available = queue.length > 1 ? queue.filter(cw => cw.id !== lastId) : queue
    const correct = srsWeightedPick(available, cw => cw.id, pMap)
    lastId = correct.id
    idx++
    const distractors = shuffled(validConcepts.filter(cw => cw.id !== correct.id)).slice(0, maxBubbles - 1)
    const items: BubbleItem[] = shuffled([correct, ...distractors]).map(cw => ({
      id: cw.id, display: cw.word,
    }))
    const vocab = vocabById.get(correct.id)
    const centerContent = vocab?.emoji ?? vocab?.meaning_zh ?? correct.word
    return {
      items,
      targetId: correct.id,
      ttsText: correct.word,
      centerContent,
    }
  }
}
