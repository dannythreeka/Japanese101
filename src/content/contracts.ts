/** P2 content contracts. These never contain player progress or game rewards. */
export type LearningMode = 'practice' | 'check' | 'mock'
export type QuestionKind = 'choice' | 'order' | 'reading' | 'audio'
export interface Choice { id: string; text: string }
export interface Question {
  id: string
  version: string
  unitId: string
  itemId: string
  itemFamilyId: string
  primarySkillId: string
  skillIds: string[]
  teachingIds: string[]
  partition: LearningMode
  kind: QuestionKind
  prompt: string
  material?: string
  audioSrc?: string
  choices: Choice[]
  answer: string[]
  explanation: string
  distractorReasons: Record<string, string>
  hint: string
  hintPolicy: 'practice-only' | 'none'
  audioPolicy: 'optional' | 'required'
  source: string
  reviewStatus: 'DRAFT' | 'APPROVED'
}
export interface Attempt {
  id: string
  profileId: string
  sessionId: string
  questionInstanceId: string
  itemId: string
  itemVersion: string
  itemFamilyId: string
  skillIds: string[]
  primarySkillId: string
  mode: LearningMode
  firstAnswerCorrect: boolean | null
  outcome: 'correct' | 'incorrect' | 'skipped'
  hintUsed: boolean
  retryCount: number
  audioPlayCount: number
  responseMs: number
  submittedAt: string
  answerIds: string[]
}
export interface TeachingCard {
  id: string; skillIds: string[]; title: string; body: string; example: string; translation: string; audioSrc?: string
}
export interface UnitPack {
  id: string; version: string; title: string; reviewStatus: 'DRAFT' | 'APPROVED'
  reviewer: string | null; reviewedAt: string | null
  vocabulary: { id: string; text: string; reading: string; meaning: string }[]
  kanji: { id: string; text: string; reading: string; meaning: string }[]
  grammar: { id: string; title: string; prerequisites: string[] }[]
  readings: { id: string; text: string; skillId: string }[]
  listening: { id: string; script: string; audioSrc: string; skillId: string; reviewStatus: 'DRAFT' | 'APPROVED' }[]
  teaching: TeachingCard[]
  questions: Question[]
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(nonempty)
const unique = (values: string[]) => new Set(values).size === values.length
export function questionErrors(input: unknown): string[] {
  if (!record(input)) return ['question: expected object']
  const errors: string[] = []
  const label = typeof input.id === 'string' ? input.id : 'question'
  for (const key of ['id','version','unitId','itemId','itemFamilyId','primarySkillId','prompt','explanation','hint','source']) {
    if (!nonempty(input[key])) errors.push(`${label}: missing ${key}`)
  }
  if (input.version !== '1') errors.push(`${label}: unsupported version`)
  if (!['practice','check','mock'].includes(String(input.partition))) errors.push(`${label}: invalid partition`)
  if (!['choice','order','reading','audio'].includes(String(input.kind))) errors.push(`${label}: invalid kind`)
  if (!strings(input.skillIds) || !unique(input.skillIds) || !input.skillIds.includes(String(input.primarySkillId))) errors.push(`${label}: invalid skillIds`)
  if (!strings(input.teachingIds) || !input.teachingIds.length || !unique(input.teachingIds)) errors.push(`${label}: missing teaching prerequisites`)
  const choices = Array.isArray(input.choices) ? input.choices : []
  if (choices.length < 2 || choices.some(c => !record(c) || !nonempty(c.id) || !nonempty(c.text))) errors.push(`${label}: invalid choices`)
  const ids = choices.filter(record).map(c => String(c.id))
  if (!unique(ids)) errors.push(`${label}: duplicate choice ID`)
  if (!strings(input.answer) || !input.answer.length || !unique(input.answer) || input.answer.some(id => !ids.includes(id))) errors.push(`${label}: invalid answer`)
  else if (input.kind === 'order' ? input.answer.length !== choices.length : input.answer.length !== 1) errors.push(`${label}: answer cardinality`)
  if (input.kind === 'reading' && !nonempty(input.material)) errors.push(`${label}: missing reading material`)
  if (!['optional','required'].includes(String(input.audioPolicy))) errors.push(`${label}: invalid audio policy`)
  if (input.kind === 'audio' && input.audioPolicy !== 'required') errors.push(`${label}: audio must be required`)
  if (input.audioPolicy === 'required' && (!nonempty(input.audioSrc) || !input.audioSrc.startsWith('/assets/audio/'))) errors.push(`${label}: missing local audio`)
  if (!['practice-only','none'].includes(String(input.hintPolicy)) || input.partition !== 'practice' && input.hintPolicy !== 'none') errors.push(`${label}: hint leaks assessment`)
  if (!['DRAFT','APPROVED'].includes(String(input.reviewStatus))) errors.push(`${label}: missing review status`)
  if (!record(input.distractorReasons) || ids.some(id => !Array.isArray(input.answer) || !input.answer.includes(id) ? !record(input.distractorReasons) || !nonempty(input.distractorReasons[id]) : false)) errors.push(`${label}: missing distractor reasons`)
  return errors
}
export function parseQuestion(input: unknown): Question {
  const errors = questionErrors(input)
  if (errors.length) throw new Error(errors.join('; '))
  return structuredClone(input) as Question
}
export function validateQuestionBank(input: unknown): string[] {
  if (!Array.isArray(input)) return ['bank: expected array']
  const errors = input.flatMap(questionErrors)
  const ids = input.filter(record).map(q => String(q.id))
  if (!unique(ids)) errors.push('bank: duplicate question ID')
  const partitions = new Map<string, string>()
  for (const q of input.filter(record)) {
    const family = String(q.itemFamilyId)
    const previous = partitions.get(family)
    if (previous && previous !== q.partition) errors.push(`${q.id}: family crosses partitions`)
    partitions.set(family, String(q.partition))
  }
  return errors
}
export function answerIsCorrect(question: Question, answer: readonly string[]): boolean {
  return answer.length === question.answer.length && answer.every((id, index) => id === question.answer[index])
}
export function attemptErrors(input: unknown): string[] {
  if (!record(input)) return ['attempt: expected object']
  const errors: string[] = []
  for (const key of ['id','profileId','sessionId','questionInstanceId','itemId','itemVersion','itemFamilyId','primarySkillId','submittedAt']) if (!nonempty(input[key])) errors.push(`attempt: missing ${key}`)
  if (!strings(input.skillIds) || !input.skillIds.includes(String(input.primarySkillId))) errors.push('attempt: invalid skills')
  if (!['practice','check','mock'].includes(String(input.mode))) errors.push('attempt: invalid mode')
  if (!['correct','incorrect','skipped'].includes(String(input.outcome))) errors.push('attempt: invalid outcome')
  if (!(input.firstAnswerCorrect === null || typeof input.firstAnswerCorrect === 'boolean') || typeof input.hintUsed !== 'boolean') errors.push('attempt: invalid first answer/hint')
  if (input.outcome === 'skipped' && input.retryCount === 0 && input.firstAnswerCorrect !== null) errors.push('attempt: first skip must have null first answer')
  for (const key of ['retryCount','audioPlayCount','responseMs']) if (typeof input[key] !== 'number' || !Number.isSafeInteger(input[key]) || input[key] < 0) errors.push(`attempt: invalid ${key}`)
  if (!Number.isFinite(Date.parse(String(input.submittedAt)))) errors.push('attempt: invalid date')
  if (!strings(input.answerIds)) errors.push('attempt: invalid answer IDs')
  return errors
}
