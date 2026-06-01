import { describe, it, expect } from 'vitest'
import { calcRms, determineOutcome, DEFAULT_CONFIG, EASY_CONFIG } from './mic'

describe('calcRms', () => {
  it('returns ~0 for flat silence (all 128)', () => {
    const data = new Uint8Array(512).fill(128)
    expect(calcRms(data)).toBeCloseTo(0)
  })

  it('returns > 0 for a square wave (64 / 192 alternating)', () => {
    const data = new Uint8Array(512)
    for (let i = 0; i < 512; i++) data[i] = i % 2 === 0 ? 192 : 64
    expect(calcRms(data)).toBeGreaterThan(0)
  })

  it('stays ≤ 1 for max amplitude (all 255)', () => {
    const data = new Uint8Array(512).fill(255)
    expect(calcRms(data)).toBeLessThanOrEqual(1)
  })

  it('returns a higher value for louder signal', () => {
    const soft = new Uint8Array(512)
    const loud = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      soft[i] = i % 2 === 0 ? 140 : 116  // small swing around 128
      loud[i] = i % 2 === 0 ? 200 : 56   // large swing
    }
    expect(calcRms(loud)).toBeGreaterThan(calcRms(soft))
  })
})

describe('determineOutcome', () => {
  it('returns silent for < 50 ms voiced', () => {
    expect(determineOutcome(10, DEFAULT_CONFIG, false)).toBe('silent')
    expect(determineOutcome(49, DEFAULT_CONFIG, false)).toBe('silent')
  })

  it('returns weak when voiced but below minVoicedDurationMs', () => {
    expect(determineOutcome(100, DEFAULT_CONFIG, false)).toBe('weak')
    expect(determineOutcome(299, DEFAULT_CONFIG, false)).toBe('weak')
  })

  it('returns good when voiced sufficiently without speech match', () => {
    expect(determineOutcome(300, DEFAULT_CONFIG, false)).toBe('good')
    expect(determineOutcome(2000, DEFAULT_CONFIG, false)).toBe('good')
  })

  it('returns perfect when speechMatch is true', () => {
    expect(determineOutcome(300, DEFAULT_CONFIG, true)).toBe('perfect')
    expect(determineOutcome(2000, DEFAULT_CONFIG, true)).toBe('perfect')
  })

  it('EASY_CONFIG has lower threshold so 200 ms is good', () => {
    expect(determineOutcome(200, EASY_CONFIG, false)).toBe('good')
    expect(determineOutcome(200, DEFAULT_CONFIG, false)).toBe('weak')
  })
})
