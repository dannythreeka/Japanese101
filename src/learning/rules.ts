import type { Attempt, Question } from '../content/contracts'
import { answerIsCorrect, attemptErrors } from '../content/contracts'

export interface Clock { now: number; timeZone: string }
export type MasteryState = 'not-started' | 'practicing' | 'stable' | 'due'
export const LEARNING_RULES_VERSION='learning-v1.1-spaced'
export interface ReviewSchedule { level: number; dueDate: string; lastAttemptId: string; learningVersion?:string }
const intervals = [1, 3, 7, 14, 30] as const
export function localDay(time: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(time)
  const part = (type: string) => parts.find(p => p.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
function plusDays(day: string, count: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0,10)
}
export function summarize(attempts: readonly Attempt[]) {
  const unique = new Map(attempts.map(a => [a.id,a]))
  const values = [...unique.values()]
  const independent = values.filter(a => a.firstAnswerCorrect === true && !a.hintUsed).length
  return { total: values.length, independent, accuracy: values.length ? independent / values.length : null, hinted: values.filter(a => a.hintUsed).length, skipped: values.filter(a => a.outcome === 'skipped').length, completedSections: Math.floor(values.length / 5), partialSection: values.length % 5 }
}
export function nextReview(previous: ReviewSchedule | undefined, attempt: Attempt, timeZone: string): ReviewSchedule {
  if (previous?.lastAttemptId === attempt.id) return previous
  const success = attempt.firstAnswerCorrect === true && !attempt.hintUsed
  const day=localDay(Date.parse(attempt.submittedAt),timeZone)
  if(success && previous && day<previous.dueDate)return {...previous,lastAttemptId:attempt.id,learningVersion:LEARNING_RULES_VERSION}
  const level = success ? Math.min((previous?.level ?? -1)+1,intervals.length-1) : 0
  return { level, dueDate: plusDays(day,intervals[level]), lastAttemptId:attempt.id,learningVersion:LEARNING_RULES_VERSION }
}
export function mastery(attempts: readonly Attempt[], skillId: string, taughtAt: number | undefined, clock: Clock, schedule?: ReviewSchedule): MasteryState {
  const values = attempts.filter(a => a.primarySkillId === skillId && Date.parse(a.submittedAt) <= clock.now)
  if (!values.length) return 'not-started'
  const checks = values.filter(a => a.mode === 'check').sort((a,b) => Date.parse(b.submittedAt)-Date.parse(a.submittedAt) || a.id.localeCompare(b.id))
  if (schedule && schedule.dueDate <= localDay(clock.now,clock.timeZone) || checks[0] && (!checks[0].firstAnswerCorrect || checks[0].hintUsed)) return 'due'
  const families = new Map<string,Attempt>()
  for (const a of checks) if (!families.has(a.itemFamilyId)) families.set(a.itemFamilyId,a)
  const sample = [...families.values()].slice(0,5)
  const twoDays = new Set(sample.map(a => localDay(Date.parse(a.submittedAt),clock.timeZone))).size >= 2
  const delayed = taughtAt !== undefined && sample.some(a => Date.parse(a.submittedAt)-taughtAt >= 48*60*60*1000)
  return sample.length === 5 && sample.filter(a => a.firstAnswerCorrect && !a.hintUsed).length >= 4 && twoDays && delayed ? 'stable' : 'practicing'
}
export function createAttempt(question: Question, context: { profileId:string; sessionId:string; questionInstanceId:string; submittedAt:number; responseMs:number; answerIds:string[] | null; hintUsed:boolean; audioPlayCount:number }): Attempt {
  if (question.audioPolicy === 'required' && context.audioPlayCount < 1) throw new Error('Audio has not completed successfully')
  if (context.hintUsed && (question.partition !== 'practice' || question.hintPolicy === 'none')) throw new Error('Hints are unavailable in this assessment')
  if (context.answerIds && (new Set(context.answerIds).size !== context.answerIds.length || context.answerIds.some(id => !question.choices.some(c => c.id === id)) || (question.kind === 'order' ? context.answerIds.length !== question.choices.length : context.answerIds.length !== 1))) throw new Error('Incomplete or unknown answer')
  const correct = context.answerIds === null ? null : answerIsCorrect(question,context.answerIds)
  const attempt: Attempt = {
    id: `${context.sessionId}:${context.questionInstanceId}`, profileId:context.profileId, sessionId:context.sessionId, questionInstanceId:context.questionInstanceId,
    itemId:question.itemId,itemVersion:question.version,itemFamilyId:question.itemFamilyId,skillIds:[...question.skillIds],primarySkillId:question.primarySkillId,mode:question.partition,
    firstAnswerCorrect:correct,outcome:correct === null ? 'skipped' : correct ? 'correct' : 'incorrect',hintUsed:context.hintUsed,retryCount:0,audioPlayCount:context.audioPlayCount,responseMs:context.responseMs,
    submittedAt:new Date(context.submittedAt).toISOString(),answerIds:context.answerIds ?? [],
  }
  const errors = attemptErrors(attempt)
  if (errors.length) throw new Error(errors.join('; '))
  return attempt
}
/** Deterministic selection is persisted by the caller; opening a page does not replan. */
export function planQuestions(questions: readonly Question[], dueSkills: readonly string[], taughtSkills: readonly string[], previous: readonly Attempt[], limit = 5): string[] {
  const available = questions.filter(q => q.partition === 'practice' && q.skillIds.every(skill => taughtSkills.includes(skill)))
  const last = previous.slice(-3).map(a => a.itemFamilyId)
  const pending = previous.slice(-3).filter(a => !a.firstAnswerCorrect || a.hintUsed).map(a => a.itemFamilyId)
  // No immediate remedial repeat; if fewer than three intervening answers exist, leave it for the next section.
  return [...available].sort((a,b) => Number(dueSkills.includes(b.primarySkillId))-Number(dueSkills.includes(a.primarySkillId)) || a.id.localeCompare(b.id)).filter(q => !(pending.includes(q.itemFamilyId) && last.includes(q.itemFamilyId))).slice(0,Math.max(0,limit)).map(q => q.id)
}
