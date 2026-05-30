import { describe, it, expect } from 'vitest'
import { formatTime, last7DayCounts, featureAccuracy } from './dashboardUtils'
import type { ProgressRecord, SessionRecord } from '../../types'

describe('formatTime', () => {
  it('formats zero ms as 0分', () => {
    expect(formatTime(0)).toBe('0分')
  })

  it('formats minutes only', () => {
    expect(formatTime(5 * 60000)).toBe('5分')
    expect(formatTime(59 * 60000)).toBe('59分')
  })

  it('formats hours and minutes', () => {
    expect(formatTime(90 * 60000)).toBe('1時間30分')
    expect(formatTime(120 * 60000)).toBe('2時間0分')
  })

  it('ignores sub-minute remainder', () => {
    expect(formatTime(5 * 60000 + 59999)).toBe('5分')
  })
})

describe('last7DayCounts', () => {
  it('returns exactly 7 entries', () => {
    expect(last7DayCounts([])).toHaveLength(7)
  })

  it('returns 0 counts for all days when no sessions', () => {
    const result = last7DayCounts([])
    expect(result.every(d => d.count === 0)).toBe(true)
  })

  it('counts today\'s sessions in the last entry', () => {
    const todaySession: SessionRecord = {
      id: 's1', date: Date.now(), durationMs: 1000,
      feature: 'kana', correct: 5, total: 10,
    }
    const result = last7DayCounts([todaySession])
    expect(result[6].count).toBe(1)
  })

  it('counts multiple sessions on the same day', () => {
    const now = Date.now()
    const sessions: SessionRecord[] = [
      { id: 's1', date: now, durationMs: 1000, feature: 'kana', correct: 5, total: 10 },
      { id: 's2', date: now + 1000, durationMs: 1000, feature: 'quiz', correct: 3, total: 5 },
    ]
    const result = last7DayCounts(sessions)
    expect(result[6].count).toBe(2)
  })

  it('ignores sessions older than 7 days', () => {
    const old: SessionRecord = {
      id: 's1', date: Date.now() - 8 * 86_400_000, durationMs: 1000,
      feature: 'kana', correct: 5, total: 10,
    }
    const result = last7DayCounts([old])
    expect(result.every(d => d.count === 0)).toBe(true)
  })
})

describe('featureAccuracy', () => {
  const kanaRecord: ProgressRecord = {
    id: 'a_a', type: 'kana', correct: 8, incorrect: 2, lastSeen: 0, nextReview: 0, streak: 3,
  }
  const vocabRecord: ProgressRecord = {
    id: 'w_kasa', type: 'vocab', correct: 5, incorrect: 5, lastSeen: 0, nextReview: 0, streak: 0,
  }

  it('returns 0 when no records of that type', () => {
    expect(featureAccuracy([], 'kana')).toBe(0)
    expect(featureAccuracy([vocabRecord], 'kana')).toBe(0)
  })

  it('calculates average accuracy across records', () => {
    expect(featureAccuracy([kanaRecord], 'kana')).toBe(80)
    expect(featureAccuracy([vocabRecord], 'vocab')).toBe(50)
  })

  it('averages multiple records', () => {
    const second: ProgressRecord = {
      id: 'a_i', type: 'kana', correct: 6, incorrect: 4, lastSeen: 0, nextReview: 0, streak: 1,
    }
    expect(featureAccuracy([kanaRecord, second], 'kana')).toBe(70)
  })
})
