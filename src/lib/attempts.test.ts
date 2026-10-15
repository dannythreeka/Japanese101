import { describe, it, expect } from 'vitest'
import { recordAnswer, skipQuestion, summarizeAttempts } from './attempts'

describe('first independent answers and completion', () => {
  it('counts five questions, three first answers and two retries as 60% / 100%', () => {
    const attempts = Array.from({ length: 5 }, (_, i) => {
      const first = recordAnswer(undefined, `q${i}`, 'same-item', i < 3)
      return i < 3 ? first : recordAnswer(first, `q${i}`, 'same-item', true)
    })
    expect(summarizeAttempts(attempts, 5)).toMatchObject({ correct: 3, total: 5, completed: 5, firstAccuracy: .6, completionRate: 1 })
    const done = attempts[0]
    for (let n = 0; n < 10; n++) expect(recordAnswer(done, 'q0', 'same-item', true)).toBe(done)
  })
  it('excludes an unsubmitted interruption; includes hints and skips without credit', () => {
    const hinted = recordAnswer(undefined, 'hint', 'x', true, true)
    const skipped = skipQuestion(undefined, 'skip', 'y')
    expect(summarizeAttempts([hinted, skipped], 3)).toMatchObject({ correct: 0, total: 2, completed: 2 })
    expect(summarizeAttempts([], 5).firstAccuracy).toBeNull()
  })
})
