import type { ProgressRecord } from '../types'

const ONE_DAY = 86_400_000
const INTERVALS = [1, 3, 7, 14, 30, 60] // days

export function getNextReview(record: ProgressRecord): number {
  const streakIdx = Math.min(record.streak, INTERVALS.length - 1)
  return Date.now() + INTERVALS[streakIdx] * ONE_DAY
}

export function updateAfterCorrect(record: ProgressRecord): ProgressRecord {
  const updated = { ...record, correct: record.correct + 1, streak: record.streak + 1, lastSeen: Date.now() }
  updated.nextReview = getNextReview(updated)
  return updated
}

export function updateAfterIncorrect(record: ProgressRecord): ProgressRecord {
  return {
    ...record,
    incorrect: record.incorrect + 1,
    streak: 0,
    lastSeen: Date.now(),
    nextReview: Date.now() + ONE_DAY,
  }
}

export function createRecord(id: string, type: ProgressRecord['type']): ProgressRecord {
  return { id, type, correct: 0, incorrect: 0, lastSeen: 0, nextReview: 0, streak: 0 }
}

export function isDue(record: ProgressRecord): boolean {
  return record.nextReview <= Date.now()
}

export function accuracy(record: ProgressRecord): number {
  const total = record.correct + record.incorrect
  return total === 0 ? 0 : Math.round((record.correct / total) * 100)
}
