// Engine pure-logic tests — now lives in questionGenerators.test.ts
// This file kept for backwards-compat test count; verifies re-exported helpers still work.
import { describe, it, expect } from 'vitest'
import { buildPool, buildParams } from './questionGenerators'
import type { Kana } from '../../types'

function makeKana(id: string, type: Kana['type'] = 'seion', difficulty: 1 | 2 | 3 = 1): Kana {
  return { id, hiragana: id, katakana: id, romaji: id, row: 'test', type, difficulty }
}
const SEION = ['a','i','u','e','o','ka','ki','ku'].map(id => makeKana(id))
const ALL = [...SEION, ...['ga','gi'].map(id => makeKana(id, 'dakuon', 2))]

describe('buildPool (smoke)', () => {
  it('returns non-empty array for all valid input combinations', () => {
    const modes: Array<Kana['type'] extends never ? never : Parameters<typeof buildPool>[1]> =
      ['young', 'advanced']
    const diffs: Parameters<typeof buildPool>[2][] = [1, 2, 3, 'all']
    for (const m of modes) {
      for (const d of diffs) {
        const p = buildPool(ALL, m, d)
        expect(p.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('buildParams (smoke)', () => {
  it('young and advanced return different speeds', () => {
    expect(buildParams('young').fallSpeed).toBeLessThan(buildParams('advanced').fallSpeed)
  })
  it('roundLength is 10 for both modes', () => {
    expect(buildParams('young').roundLength).toBe(10)
    expect(buildParams('advanced').roundLength).toBe(10)
  })
})
