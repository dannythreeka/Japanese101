import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRecord, updateAfterCorrect, updateAfterIncorrect, isDue, accuracy } from './srs'
import type { ProgressRecord } from '../types'

describe('SRS', () => {
  let record: ProgressRecord

  beforeEach(() => {
    record = createRecord('test', 'kana')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
  })

  it('creates a fresh record with zeros', () => {
    expect(record.correct).toBe(0)
    expect(record.streak).toBe(0)
  })

  it('increments streak on correct answer', () => {
    const updated = updateAfterCorrect(record)
    expect(updated.correct).toBe(1)
    expect(updated.streak).toBe(1)
  })

  it('resets streak on incorrect answer', () => {
    const withStreak = { ...record, streak: 5 }
    const updated = updateAfterIncorrect(withStreak)
    expect(updated.streak).toBe(0)
    expect(updated.incorrect).toBe(1)
  })

  it('pushes next review further for higher streaks', () => {
    const streak0 = updateAfterCorrect(record)
    const streak1 = updateAfterCorrect(streak0)
    expect(streak1.nextReview).toBeGreaterThan(streak0.nextReview)
  })

  it('isDue returns true when nextReview is in the past', () => {
    const pastRecord = { ...record, nextReview: Date.now() - 1000 }
    expect(isDue(pastRecord)).toBe(true)
  })

  it('accuracy returns 0 for unseen items', () => {
    expect(accuracy(record)).toBe(0)
  })

  it('accuracy calculates correctly', () => {
    const r = { ...record, correct: 3, incorrect: 1 }
    expect(accuracy(r)).toBe(75)
  })
})
