export interface QuestionAttempt {
  questionInstanceId: string
  itemId: string
  firstAnswerCorrect: boolean | null
  hintUsed: boolean
  retryCount: number
  completed: boolean
  skipped: boolean
}

/** A submission identifies a question instance, never a shared item or URL. */
export function recordAnswer(
  previous: QuestionAttempt | undefined,
  questionInstanceId: string,
  itemId: string,
  correct: boolean,
  hintUsed = false,
): QuestionAttempt {
  if (previous?.completed) return previous
  return {
    questionInstanceId, itemId,
    firstAnswerCorrect: previous ? previous.firstAnswerCorrect : correct,
    hintUsed: hintUsed || (previous?.hintUsed ?? false),
    retryCount: previous ? previous.retryCount + 1 : 0,
    completed: correct,
    skipped: false,
  }
}

export function skipQuestion(previous: QuestionAttempt | undefined, questionInstanceId: string, itemId: string): QuestionAttempt {
  if (previous?.completed) return previous
  return { questionInstanceId, itemId, firstAnswerCorrect: previous?.firstAnswerCorrect ?? null, hintUsed: previous?.hintUsed ?? false, retryCount: previous?.retryCount ?? 0, completed: true, skipped: true }
}

export function summarizeAttempts(attempts: QuestionAttempt[], planned: number) {
  const unique = [...new Map(attempts.map(a => [a.questionInstanceId, a])).values()]
  const submitted = unique.filter(a => a.completed || a.firstAnswerCorrect !== null)
  const correct = submitted.filter(a => a.firstAnswerCorrect === true && !a.hintUsed).length
  const completed = unique.filter(a => a.completed).length
  return { correct, total: submitted.length, completed, firstAccuracy: submitted.length ? correct / submitted.length : null, completionRate: planned > 0 ? completed / planned : 0 }
}
