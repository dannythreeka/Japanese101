import { describe, it, expect } from 'vitest'
import {
  buildWritePool, pickRound, computeWritingScore, scoreToStars,
  ROUND_SIZE, KANA_EMOJI,
} from './kanaWriteEngine'
import type { Kana } from '../../types'

function makeKana(id: string, type: Kana['type'], difficulty: 1 | 2 | 3 = 1): Kana {
  return { id, hiragana: id, katakana: id, romaji: id, row: 'test', type, difficulty }
}

const SEION = Array.from({ length: 6 }, (_, i) => makeKana(`s${i}`, 'seion', 1))
const DAKUON = Array.from({ length: 3 }, (_, i) => makeKana(`d${i}`, 'dakuon', 2))
const ALL = [...SEION, ...DAKUON]

function makeImageData(width: number, height: number, alpha = 0): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 3; i < data.length; i += 4) data[i] = alpha
  return { data, width, height } as unknown as ImageData
}

// ── buildWritePool ─────────────────────────────────────────────────────────────

describe('buildWritePool', () => {
  it('young + difficulty 1 returns only seion', () => {
    const pool = buildWritePool(ALL, 'young', 1)
    expect(pool.every(k => k.type === 'seion')).toBe(true)
  })

  it('young + all returns only seion', () => {
    const pool = buildWritePool(ALL, 'young', 'all')
    expect(pool.every(k => k.type === 'seion')).toBe(true)
  })

  it('advanced + all includes every kana', () => {
    const pool = buildWritePool(ALL, 'advanced', 'all')
    expect(pool.length).toBe(ALL.length)
  })

  it('advanced + difficulty 1 filters by difficulty', () => {
    const pool = buildWritePool(ALL, 'advanced', 1)
    expect(pool.every(k => k.difficulty <= 1)).toBe(true)
  })

  it('falls back to seion when filtered pool has < 4 items', () => {
    // only 1 difficulty-3 kana, which is < 4 → fallback to seion
    // difficulty <= 3 gives 6 seion + 1 dakuon = 7, which is >= 4, so no fallback needed
    // Let's test with a pool where difficulty filter leaves < 4
    const tinyDiff3 = [makeKana('a', 'dakuon', 3), makeKana('b', 'dakuon', 3), makeKana('c', 'dakuon', 3)]
    const p2 = buildWritePool(tinyDiff3, 'advanced', 3)
    // < 4 items → falls back to seion — but tinyDiff3 has no seion, so fallback returns []
    // The function returns seion-filtered array; if empty, returns [] (min pool responsibility is caller's)
    expect(p2.every(k => k.type === 'seion')).toBe(true)
  })
})

// ── pickRound ──────────────────────────────────────────────────────────────────

describe('pickRound', () => {
  it('returns exactly count items when pool is large enough', () => {
    expect(pickRound(SEION, 3)).toHaveLength(3)
  })

  it('returns all items when pool is smaller than count', () => {
    expect(pickRound(SEION.slice(0, 2), 5)).toHaveLength(2)
  })

  it('no duplicate kana in a round', () => {
    const picked = pickRound(SEION, SEION.length)
    const ids = picked.map(k => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── ROUND_SIZE ─────────────────────────────────────────────────────────────────

describe('ROUND_SIZE', () => {
  it('equals 5', () => {
    expect(ROUND_SIZE).toBe(5)
  })
})

// ── KANA_EMOJI ─────────────────────────────────────────────────────────────────

describe('KANA_EMOJI', () => {
  const SEION_IDS = [
    'a','i','u','e','o',
    'ka','ki','ku','ke','ko',
    'sa','shi','su','se','so',
    'ta','chi','tsu','te','to',
    'na','ni','nu','ne','no',
    'ha','hi','fu','he','ho',
    'ma','mi','mu','me','mo',
    'ya','yu','yo',
    'ra','ri','ru','re','ro',
    'wa','wo','n',
  ]

  it('has an entry for every seion kana id', () => {
    for (const id of SEION_IDS) {
      expect(KANA_EMOJI[id], `missing emoji for kana id "${id}"`).toBeDefined()
    }
  })

  it('has exactly 46 entries', () => {
    expect(Object.keys(KANA_EMOJI)).toHaveLength(46)
  })
})

// ── computeWritingScore ────────────────────────────────────────────────────────

describe('computeWritingScore', () => {
  it('returns 0 when user canvas is empty', () => {
    const user = makeImageData(100, 100, 0)
    const ref = makeImageData(100, 100, 255)
    expect(computeWritingScore(user, ref, 5)).toBe(0)
  })

  it('returns 1 when single user pixel is within dilation radius of ref pixel', () => {
    const user = makeImageData(10, 10, 0)
    const ref = makeImageData(10, 10, 0)
    user.data[4 * (5 * 10 + 5) + 3] = 255 // pixel at (5,5)
    ref.data[4 * (5 * 10 + 5) + 3] = 255  // same pixel
    expect(computeWritingScore(user, ref, 2)).toBe(1)
  })

  it('returns 0 when user and ref are far apart with small radius', () => {
    const user = makeImageData(100, 100, 0)
    const ref = makeImageData(100, 100, 0)
    user.data[4 * (0 * 100 + 0) + 3] = 255   // top-left
    ref.data[4 * (99 * 100 + 99) + 3] = 255  // bottom-right
    expect(computeWritingScore(user, ref, 2)).toBe(0)
  })

  it('returns 0 for mismatched image dimensions', () => {
    const user = makeImageData(100, 100, 255)
    const ref = makeImageData(200, 200, 255)
    expect(computeWritingScore(user, ref, 5)).toBe(0)
  })

  it('partial overlap gives value between 0 and 1', () => {
    const size = 20
    const user = makeImageData(size, size, 0)
    const ref = makeImageData(size, size, 0)
    // User draws left half, ref draws right half, with radius 3 bridging the gap
    for (let y = 0; y < size; y++) {
      user.data[4 * (y * size + 5) + 3] = 255 // column 5
      ref.data[4 * (y * size + 7) + 3] = 255  // column 7 (2px apart, radius=3 covers it)
    }
    const score = computeWritingScore(user, ref, 3)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

// ── scoreToStars ───────────────────────────────────────────────────────────────

describe('scoreToStars', () => {
  it('returns 0 stars below 35%', () => {
    expect(scoreToStars(0)).toBe(0)
    expect(scoreToStars(0.34)).toBe(0)
  })

  it('returns 1 star for 35-59%', () => {
    expect(scoreToStars(0.35)).toBe(1)
    expect(scoreToStars(0.59)).toBe(1)
  })

  it('returns 2 stars for 60-79%', () => {
    expect(scoreToStars(0.60)).toBe(2)
    expect(scoreToStars(0.79)).toBe(2)
  })

  it('returns 3 stars for 80%+', () => {
    expect(scoreToStars(0.80)).toBe(3)
    expect(scoreToStars(1.0)).toBe(3)
  })
})
