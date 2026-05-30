import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTodayTasks, computeProgress, filterTodaySessions,
  getCompletedToday, markCompleted, todayKey, ALL_TASKS,
} from './dailyTasks'
import type { SessionRecord } from '../types'

function makeSession(feature: SessionRecord['feature'], correct = 5, msBefore = 0): SessionRecord {
  return { id: `s-${Math.random()}`, date: Date.now() - msBefore, durationMs: 60000, feature, correct, total: 10 }
}

describe('todayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('is stable within the same day', () => {
    expect(todayKey()).toBe(todayKey())
  })
})

describe('getTodayTasks', () => {
  it('returns exactly 2 tasks', () => {
    const tasks = getTodayTasks()
    expect(tasks).toHaveLength(2)
  })

  it('both tasks are from ALL_TASKS', () => {
    const [a, b] = getTodayTasks()
    expect(ALL_TASKS.find(t => t.id === a.id)).toBeDefined()
    expect(ALL_TASKS.find(t => t.id === b.id)).toBeDefined()
  })

  it('returns different tasks each time (no duplicates)', () => {
    const [a, b] = getTodayTasks()
    expect(a.id).not.toBe(b.id)
  })
})

describe('filterTodaySessions', () => {
  it('keeps sessions from today', () => {
    const sessions = [makeSession('kana', 5, 0)]
    expect(filterTodaySessions(sessions)).toHaveLength(1)
  })

  it('excludes sessions older than today midnight', () => {
    const oldSession = makeSession('kana', 5, 25 * 3600 * 1000)
    expect(filterTodaySessions([oldSession])).toHaveLength(0)
  })
})

describe('computeProgress', () => {
  const todaySessions = [
    makeSession('kana', 6),
    makeSession('quiz', 4),
    makeSession('kana_catch', 3),
  ]

  it('total_correct sums correct across all sessions', () => {
    const task = ALL_TASKS.find(t => t.measure === 'total_correct')!
    expect(computeProgress(task, todaySessions)).toBe(13)
  })

  it('distinct_features counts unique feature types', () => {
    const task = ALL_TASKS.find(t => t.measure === 'distinct_features')!
    expect(computeProgress(task, todaySessions)).toBe(3)
  })

  it('feature_played returns 1 if feature was played today', () => {
    const task = ALL_TASKS.find(t => t.measure === 'feature_played' && t.feature === 'kana')!
    expect(computeProgress(task, todaySessions)).toBe(1)
  })

  it('feature_played returns 0 if feature was not played today', () => {
    const task = ALL_TASKS.find(t => t.measure === 'feature_played' && t.feature === 'dakuten_drag')!
    expect(computeProgress(task, todaySessions)).toBe(0)
  })

  it('returns 0 for empty sessions', () => {
    const task = ALL_TASKS.find(t => t.measure === 'total_correct')!
    expect(computeProgress(task, [])).toBe(0)
  })
})

describe('getCompletedToday / markCompleted', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns empty array when nothing completed', () => {
    expect(getCompletedToday()).toEqual([])
  })

  it('marks a task as completed', () => {
    markCompleted('correct_10')
    expect(getCompletedToday()).toContain('correct_10')
  })

  it('does not duplicate already-completed tasks', () => {
    markCompleted('correct_10')
    markCompleted('correct_10')
    expect(getCompletedToday().filter(id => id === 'correct_10')).toHaveLength(1)
  })
})
