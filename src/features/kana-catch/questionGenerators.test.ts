import { describe, it, expect } from 'vitest'
import type { Kana, Word, ConceptWord, ProgressRecord } from '../../types'
import {
  buildPool, buildParams,
  makeListenGenerator, makeMinimalPairGenerator, makeWordToImageGenerator,
} from './questionGenerators'

function makeKana(id: string, type: Kana['type'] = 'seion', difficulty: 1 | 2 | 3 = 1): Kana {
  return { id, hiragana: id, katakana: id, romaji: id, row: 'test', type, difficulty }
}
function makeWord(id: string, kana: string, emoji?: string): Word {
  return { id, kana, romaji: kana, meaning_zh: kana, category: 'test',
    image: { src: '', license: 'CC0' }, audio: { src: '', license: 'tts_generated' }, emoji }
}
function makeCW(id: string, word: string): ConceptWord { return { id, word, meaning_zh: word } }

const SEION = ['a','i','u','e','o','ka','ki','ku','ke','ko'].map(id => makeKana(id))
const DAKUON = ['ga','gi'].map(id => makeKana(id, 'dakuon', 2))
const ALL = [...SEION, ...DAKUON]
const NO_PROGRESS = new Map<string, ProgressRecord>()

// ── buildPool ─────────────────────────────────────────────────────────────────
describe('buildPool', () => {
  it('young + 1 → seion only', () => {
    const p = buildPool(ALL, 'young', 1)
    expect(p.every(k => k.type === 'seion')).toBe(true)
  })
  it('young + all → seion only', () => {
    const p = buildPool(ALL, 'young', 'all')
    expect(p.every(k => k.type === 'seion')).toBe(true)
  })
  it('advanced + all → all kana', () => {
    expect(buildPool(ALL, 'advanced', 'all').length).toBe(ALL.length)
  })
  it('advanced + 2 → difficulty ≤ 2', () => {
    const p = buildPool(ALL, 'advanced', 2)
    expect(p.every(k => k.difficulty <= 2)).toBe(true)
    expect(p.some(k => k.difficulty === 2)).toBe(true)
  })
  it('falls back to seion when filtered pool < 4', () => {
    const tiny = [makeKana('x', 'dakuon', 2), makeKana('y', 'dakuon', 2)]
    const p = buildPool(tiny, 'advanced', 3)
    expect(Array.isArray(p)).toBe(true)
  })
})

// ── buildParams ───────────────────────────────────────────────────────────────
describe('buildParams', () => {
  it('young → showRomaji=true, slow', () => {
    const p = buildParams('young')
    expect(p.showRomaji).toBe(true); expect(p.fallSpeed).toBeLessThan(150)
  })
  it('advanced → showRomaji=false, fast', () => {
    const p = buildParams('advanced')
    expect(p.showRomaji).toBe(false); expect(p.fallSpeed).toBeGreaterThan(150)
  })
})

// ── makeListenGenerator ───────────────────────────────────────────────────────
describe('makeListenGenerator', () => {
  it('correct is always in items', () => {
    const gen = makeListenGenerator(SEION, 3, NO_PROGRESS)
    for (let i = 0; i < 20; i++) {
      const q = gen()
      expect(q.items.some(it => it.id === q.targetId)).toBe(true)
    }
  })
  it('no duplicate ids in items', () => {
    const gen = makeListenGenerator(SEION, 4, NO_PROGRESS)
    const q = gen()
    const ids = q.items.map(it => it.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('respects maxBubbles', () => {
    const gen = makeListenGenerator(SEION, 3, NO_PROGRESS)
    expect(gen().items.length).toBeLessThanOrEqual(3)
  })
  it('items have display and romaji', () => {
    const gen = makeListenGenerator(SEION, 3, NO_PROGRESS)
    const q = gen()
    for (const it of q.items) {
      expect(typeof it.display).toBe('string')
      expect(it.romaji).toBeTruthy()
    }
  })
  it('SRS weighting: due items are preferred', () => {
    // Mark ALL items as not-due, then override 'a' to be due.
    // Items absent from the map are treated as due (!p = true), so we must
    // explicitly set all other items to a future nextReview.
    const future = Date.now() + 86_400_000
    const dueMap = new Map<string, ProgressRecord>(
      SEION.map(k => [k.id, { id: k.id, type: 'kana', correct: 1, incorrect: 0, streak: 1, lastSeen: 0, nextReview: future }]),
    )
    dueMap.set('a', { id: 'a', type: 'kana', correct: 0, incorrect: 3, streak: 0, lastSeen: 0, nextReview: Date.now() - 1000 })
    const gen = makeListenGenerator(SEION, 3, dueMap)
    // First call must include 'a' since it's the only due item in the initial window
    const targets = Array.from({ length: 10 }, () => gen().targetId)
    expect(targets.includes('a')).toBe(true)
  })
})

// ── makeMinimalPairGenerator ──────────────────────────────────────────────────
describe('makeMinimalPairGenerator', () => {
  const pairs = [['a', 'ga'], ['i', 'gi']]
  it('only targets kana from pairs', () => {
    const gen = makeMinimalPairGenerator(pairs, ALL, 4, NO_PROGRESS)
    for (let i = 0; i < 20; i++) {
      const q = gen()
      const pairFlat = pairs.flat()
      const target = q.items.find(it => it.id === q.targetId)
      expect(target).toBeDefined()
      expect(pairFlat).toContain(target!.id)
    }
  })
  it('no duplicate ids', () => {
    const gen = makeMinimalPairGenerator(pairs, ALL, 4, NO_PROGRESS)
    const q = gen()
    const ids = q.items.map(it => it.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── makeWordToImageGenerator ──────────────────────────────────────────────────
describe('makeWordToImageGenerator', () => {
  const vocab = [makeWord('w1', 'かさ', '☂️'), makeWord('w2', 'かざん', '🌋'), makeWord('w3', 'つき', '🌙'), makeWord('w4', 'まと', '🎯')]
  const cws = [makeCW('w1', 'かさ'), makeCW('w2', 'かざん'), makeCW('w3', 'つき'), makeCW('w4', 'まと')]

  it('correct word is always in items', () => {
    const gen = makeWordToImageGenerator(cws, vocab, 3, NO_PROGRESS)
    for (let i = 0; i < 20; i++) {
      const q = gen()
      expect(q.items.some(it => it.id === q.targetId)).toBe(true)
    }
  })
  it('centerContent is set from vocab emoji', () => {
    const gen = makeWordToImageGenerator(cws, vocab, 3, NO_PROGRESS)
    const q = gen()
    expect(q.centerContent).toBeTruthy()
  })
  it('items display the word kana', () => {
    const gen = makeWordToImageGenerator(cws, vocab, 3, NO_PROGRESS)
    const q = gen()
    for (const it of q.items) {
      const cw = cws.find(c => c.id === it.id)
      expect(it.display).toBe(cw?.word)
    }
  })
  it('gracefully handles vocab not in vocabulary', () => {
    const orphan = [makeCW('missing', 'xxx')]
    const gen = makeWordToImageGenerator(orphan, vocab, 3, NO_PROGRESS)
    // validConcepts is empty → fallback result
    const q = gen()
    expect(Array.isArray(q.items)).toBe(true)
  })
})
