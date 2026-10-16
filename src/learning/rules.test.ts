import { describe, expect, it } from 'vitest'
import { attemptErrors, parseQuestion, validateQuestionBank, type Question } from '../content/contracts'
import { createAttempt, localDay, mastery, nextReview, planQuestions, summarize } from './rules'

const question: Question = {id:'q1',version:'1',unitId:'U01',itemId:'v1',itemFamilyId:'family-1',primarySkillId:'G01',skillIds:['G01'],teachingIds:['teach-G01'],partition:'practice',kind:'choice',prompt:'えらぼう',choices:[{id:'a',text:'です'},{id:'b',text:'ます'}],answer:['a'],explanation:'名詞の文です。',distractorReasons:{b:'動詞ではありません。'},hint:'名詞をつなぎます。',hintPolicy:'practice-only',audioPolicy:'optional',source:'original',reviewStatus:'DRAFT'}
const t0 = Date.parse('2026-10-16T02:00:00Z')
function attempt(index:number, correct=true, hintUsed=false) {
  return createAttempt({...question,id:`q${index}`,itemFamilyId:`f${index}`},{profileId:'A',sessionId:'battle',questionInstanceId:`turn-${index}`,submittedAt:t0,responseMs:1000,answerIds:[correct ? 'a':'b'],hintUsed,audioPlayCount:0})
}
describe('P2-01 runtime contracts', () => {
  it('rejects unknown versions, invalid IDs, ambiguous answers and hint leakage', () => {
    expect(parseQuestion(question)).toEqual(question)
    for (const patch of [{version:'999'},{choices:[]},{answer:['a','b']},{skillIds:[]},{partition:'check'},{kind:'reading'},{kind:'audio',audioPolicy:'optional'},{distractorReasons:{}}]) expect(() => parseQuestion({...question,...patch})).toThrow()
    expect(validateQuestionBank([question,{...question,id:'q2',partition:'check',hintPolicy:'none'}])).toContain('q2: family crosses partitions')
  })
  it('validates skip, ownership, dates and audio boundaries', () => {
    const skip=createAttempt(question,{profileId:'A',sessionId:'s',questionInstanceId:'i',submittedAt:t0,responseMs:0,answerIds:null,hintUsed:false,audioPlayCount:0})
    expect(skip.firstAnswerCorrect).toBeNull()
    expect(attemptErrors({...skip,profileId:'',responseMs:-1})).not.toEqual([])
    expect(() => createAttempt({...question,audioPolicy:'required'}, {profileId:'A',sessionId:'s',questionInstanceId:'i',submittedAt:t0,responseMs:0,answerIds:['a'],hintUsed:false,audioPlayCount:0})).toThrow('Audio')
    const retried={...attempt(1,false),outcome:'correct',retryCount:1,answerIds:['a']}
    expect(attemptErrors(retried)).toEqual([])
    expect(summarize([retried as ReturnType<typeof attempt>]).accuracy).toBe(0)
    expect(()=>createAttempt(question,{profileId:'A',sessionId:'s',questionInstanceId:'interrupted',submittedAt:t0,responseMs:1,answerIds:[],hintUsed:false,audioPlayCount:0})).toThrow('Incomplete')
  })
})
describe('P2-02 evidence and calendar rules', () => {
  it('reports 60% for three independent, one wrong and one hinted; deduplicates replays', () => {
    const values=[attempt(1),attempt(2),attempt(3),attempt(4,false),attempt(5,true,true)]
    expect(summarize([...values,values[0]])).toMatchObject({total:5,accuracy:.6,completedSections:1})
    expect(summarize([]).accuracy).toBeNull()
  })
  it('requires five distinct check families, two local days and exact 48h delay', () => {
    const checks=Array.from({length:5},(_,n)=>({...attempt(n,n!==4),mode:'check' as const,submittedAt:new Date(t0+(n===0 ? 0:48*3600000)).toISOString()}))
    const clock={now:t0+49*3600000,timeZone:'Asia/Taipei'}
    expect(mastery(checks,'G01',t0,clock)).toBe('stable')
    expect(mastery(checks,'G01',undefined,clock)).toBe('practicing')
    expect(mastery(checks.map(a=>({...a,itemFamilyId:'same'})),'G01',t0,clock)).toBe('practicing')
    expect(mastery(checks.map(a=>({...a,submittedAt:new Date(t0+47*3600000).toISOString()})),'G01',t0,clock)).toBe('practicing')
    expect(mastery(checks.map(a=>({...a,mode:'practice'})),'G01',t0,clock)).toBe('practicing')
  })
  it('does not let future evidence, one-day checks or hints claim stable', () => {
    const values=Array.from({length:5},(_,n)=>({...attempt(n),mode:'check' as const,submittedAt:new Date(t0+48*3600000).toISOString()}))
    expect(mastery(values,'G01',t0,{now:t0,timeZone:'UTC'})).toBe('not-started')
    expect(mastery(values,'G01',t0,{now:t0+49*3600000,timeZone:'UTC'})).toBe('practicing')
  })
  it('uses calendar days across time zones, DST and idempotent retries', () => {
    const a=attempt(1)
    expect(localDay(Date.parse('2026-10-16T23:30:00Z'),'Asia/Taipei')).toBe('2026-10-17')
    const first=nextReview(undefined,a,'Asia/Taipei')
    expect(first.dueDate).toBe('2026-10-17')
    expect(nextReview(first,a,'Asia/Taipei')).toEqual(first)
    expect(nextReview(first,attempt(2),'Asia/Taipei').dueDate).toBe('2026-10-19')
    expect(nextReview({level:4,dueDate:'2099-01-01',lastAttemptId:'old'},attempt(3,false),'Asia/Taipei').level).toBe(0)
    const dst={...a,submittedAt:'2026-03-08T06:30:00Z'}
    expect(nextReview(undefined,dst,'America/New_York').dueDate).toBe('2026-03-09')
  })
  it('selects taught content and delays immediate remedial families', () => {
    expect(planQuestions([question],[],[],[])).toEqual([])
    expect(planQuestions([question],[],['G01'],[{...attempt(1,false),itemFamilyId:question.itemFamilyId}])).toEqual([])
    expect(planQuestions([question],[],['G01'],[])).toEqual(['q1'])
    expect(planQuestions([question],[],['G01'],[{...attempt(1,false),itemFamilyId:question.itemFamilyId},attempt(2),attempt(3),attempt(4)])).toEqual(['q1'])
  })
})
