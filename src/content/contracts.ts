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
  typeId?: string
  materialId?: string
  audioId?: string
  promptJa?: string
  explanationJa?: string
  hintJa?: string
  difficulty?:1|2|3
  image?: {src:string;cell:0|1|2|3;alt:{zh:string;ja:string}}
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
  titleJa?:string;bodyJa?:string;translationJa?:string
  vocabularyIds?:string[];kanjiIds?:string[];grammarIds?:string[]
  prerequisites?: string[]
  audioScript?: string
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
  // Explicit supported revisions; old Attempt.itemVersion remains unchanged.
  if (!['1','2'].includes(String(input.version))) errors.push(`${label}: unsupported version`)
  if(input.difficulty!==undefined && (typeof input.difficulty!=='number' || ![1,2,3].includes(input.difficulty)))errors.push(`${label}: invalid difficulty`)
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
  if(input.image!==undefined && (!record(input.image) || !nonempty(input.image.src) || !input.image.src.startsWith('/assets/img/') || typeof input.image.cell!=='number' || ![0,1,2,3].includes(input.image.cell) || !record(input.image.alt) || !nonempty(input.image.alt.zh) || !nonempty(input.image.alt.ja))) errors.push(`${label}: invalid context image`)
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
  const revisions=input.filter(record).map(q=>`${q.unitId}:${q.itemId}:${q.version}`)
  if(!unique(revisions))errors.push('bank: duplicate item revision')
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

export function unitPackErrors(input:unknown):string[] {
  if(!record(input))return ['unit: expected object']
  const errors:string[]=[]
  for(const field of ['id','version','title'])if(!nonempty(input[field]))errors.push(`unit: missing ${field}`)
  if(!['DRAFT','APPROVED'].includes(String(input.reviewStatus)))errors.push('unit: invalid review status')
  if(input.reviewStatus==='APPROVED' && (!nonempty(input.reviewer) || !nonempty(input.reviewedAt) || !Number.isFinite(Date.parse(input.reviewedAt))))errors.push('unit: approval requires real reviewer and date')
  const lists:Record<string,Record<string,unknown>[]>={}
  for(const field of ['vocabulary','kanji','grammar','readings','listening','teaching','questions']) {
    if(!Array.isArray(input[field]) || !input[field].every(record)){errors.push(`unit: invalid ${field}`);lists[field]=[]}
    else lists[field]=input[field]
    const ids=lists[field].map(item=>String(item.id))
    if(ids.some(id=>!id || id==='undefined') || !unique(ids))errors.push(`unit: duplicate or missing ${field} IDs`)
  }
  errors.push(...validateQuestionBank(input.questions))
  for(const field of ['vocabulary','kanji'])for(const item of lists[field])for(const key of ['text','reading','meaning'])if(!nonempty(item[key]))errors.push(`${item.id}: missing ${key}`)
  for(const item of lists.readings)for(const key of ['text','skillId'])if(!nonempty(item[key]))errors.push(`${item.id}: missing ${key}`)
  for(const item of lists.listening){
    for(const key of ['script','audioSrc','skillId'])if(!nonempty(item[key]))errors.push(`${item.id}: missing ${key}`)
    if(!['DRAFT','APPROVED'].includes(String(item.reviewStatus)))errors.push(`${item.id}: invalid audio review`)
    if(input.reviewStatus==='APPROVED' && item.reviewStatus!=='APPROVED')errors.push(`${item.id}: unreviewed listening material`)
  }
  const teachingIds=new Set(lists.teaching.map(t=>String(t.id)))
  const graph=new Map(lists.teaching.map(t=>[String(t.id),strings(t.prerequisites) ? t.prerequisites:[]]))
  const visited=new Set<string>()
  function visit(id:string,stack:string[]){
    if(stack.includes(id)){errors.push(`${id}: teaching cycle`);return}
    if(visited.has(id))return
    visited.add(id)
    for(const dep of graph.get(id) ?? []) {
      if(!teachingIds.has(dep))errors.push(`${id}: unknown teaching prerequisite ${dep}`)
      else visit(dep,[...stack,id])
    }
  }
  for(const card of lists.teaching) {
    for(const key of ['title','body','example','translation'])if(!nonempty(card[key]))errors.push(`${card.id}: missing ${key}`)
    if(!strings(card.skillIds) || !card.skillIds.length)errors.push(`${card.id}: missing teaching skills`)
    visit(String(card.id),[])
  }
  const readingIds=new Set(lists.readings.map(item=>String(item.id)))
  const audioIds=new Set(lists.listening.map(item=>String(item.id)))
  for(const q of lists.questions) {
    if(q.unitId!==input.id)errors.push(`${q.id}: wrong unit`)
    if(!strings(q.teachingIds) || q.teachingIds.some(id=>!teachingIds.has(id)))errors.push(`${q.id}: unknown teaching reference`)
    if(q.materialId && (!readingIds.has(String(q.materialId)) || lists.readings.find(r=>r.id===q.materialId)?.text!==q.material))errors.push(`${q.id}: invalid reading reference`)
    if(q.audioId && (!audioIds.has(String(q.audioId)) || lists.listening.find(a=>a.id===q.audioId)?.audioSrc!==q.audioSrc))errors.push(`${q.id}: invalid audio reference`)
    if(input.reviewStatus==='APPROVED' && q.reviewStatus!=='APPROVED')errors.push(`${q.id}: unreviewed question in approved unit`)
  }
  if(input.id==='U01') {
    for(const [field,ref] of [['vocabulary','vocabularyIds'],['kanji','kanjiIds'],['grammar','grammarIds']] as const){
      const known=new Set(lists[field].map(item=>String(item.id)))
      for(const card of lists.teaching)if(card[ref]!==undefined && (!strings(card[ref]) || !unique(card[ref]) || card[ref].some(id=>!known.has(id))))errors.push(`${card.id}: invalid ${ref}`)
      for(const id of known)if(!lists.teaching.some(c=>strings(c[ref]) && c[ref].includes(id)))errors.push(`${id}: missing teaching entry`)
    }
    for(const q of lists.questions)if(typeof q.difficulty!=='number' || ![1,2,3].includes(q.difficulty))errors.push(`${q.id}: missing difficulty`)
    for(const [field,count] of [['vocabulary',25],['kanji',5],['grammar',3],['readings',4],['listening',6]] as const)if(lists[field].length!==count)errors.push(`U01: requires ${count} ${field}`)
    if(lists.questions.filter(q=>q.partition==='practice').length!==50)errors.push('U01: requires 50 practice questions')
    for(const material of lists.readings)if(!lists.questions.some(q=>q.materialId===material.id))errors.push(`${material.id}: unused reading`)
    for(const audio of lists.listening)if(!lists.questions.some(q=>q.audioId===audio.id))errors.push(`${audio.id}: unused audio`)
  }
  return errors
}
export function parseUnitPack(input:unknown):UnitPack {
  const errors=unitPackErrors(input)
  if(errors.length)throw new Error(errors.join('; '))
  return structuredClone(input) as UnitPack
}
