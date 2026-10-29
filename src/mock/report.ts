import {answerIsCorrect} from '../content/contracts'
import {MOCK_SECTIONS} from './blueprint'
import {hasApprovedMockMetadata,type MockPaper} from './contracts'
import type {MockSession} from './session'
export interface RawCount {correct:number;incorrect:number;unanswered:number;total:number}
const sum=(a:RawCount,b:RawCount):RawCount=>({correct:a.correct+b.correct,incorrect:a.incorrect+b.incorrect,unanswered:a.unanswered+b.unanswered,total:a.total+b.total})
/** Raw product scores only. A completed durable session is required; this is never a JLPT scaled score. */
export function scoreMock(session:MockSession,paper:MockPaper){
  if(session.status!=='submitted'||session.receiptId!==`mock-submit:${session.id}`||session.submittedAt===undefined)throw new Error('Mock has not been committed as submitted')
  if(session.paperId!==paper.id||session.paperVersion!==paper.version)throw new Error('Original mock version unavailable')
  const assigned=paper.sections.flatMap(s=>s.questionIds)
  if(assigned.length!==80||new Set(assigned).size!==80)throw new Error('Invalid mock item assignment')
  const sections=MOCK_SECTIONS.map((spec,index)=>{
    const state=session.sections[index],source=paper.sections[index]
    if(!state||state.id!==spec.id||state.status!=='complete'||!Number.isSafeInteger(state.startedAt)||!Number.isSafeInteger(state.completedAt)||state.completedAt!<state.startedAt!||!source||source.id!==spec.id||source.questionIds.length!==spec.count||new Set(source.questionIds).size!==spec.count)throw new Error('Incomplete mock section')
    if(Object.keys(state.answers).some(id=>!source.questionIds.includes(id)))throw new Error('Answer belongs to another section')
    const items=source.questionIds.map(id=>{
      const q=paper.questions.find(q=>q.id===id),answer=state.answers[id]
      if(!q)throw new Error('Original mock item unavailable')
      if(answer&&(!Number.isSafeInteger(answer.savedAt)||answer.savedAt>state.completedAt!||answer.savedAt<state.startedAt!||answer.questionId!==id||new Set(answer.choiceIds).size!==answer.choiceIds.length||answer.choiceIds.some(c=>!q.choices.some(x=>x.id===c))||(q.kind==='order'?answer.choiceIds.length!==q.choices.length:answer.choiceIds.length!==1)))throw new Error('Invalid saved mock answer')
      return {questionId:id,skillId:q.primarySkillId,typeId:q.typeId,outcome:!answer?'unanswered':answerIsCorrect(q,answer.choiceIds)?'correct':'incorrect'} as const
    })
    const raw:RawCount={correct:items.filter(i=>i.outcome==='correct').length,incorrect:items.filter(i=>i.outcome==='incorrect').length,unanswered:items.filter(i=>i.outcome==='unanswered').length,total:spec.count}
    return {id:spec.id,raw,items}
  })
  const languageReading=sum(sections[0].raw,sections[1].raw),listening=sections[2].raw,total=sum(languageReading,listening)
  const weakSkills=[...new Set(sections.flatMap(s=>s.items.filter(i=>i.outcome!=='correct').map(i=>i.skillId)))].sort()
  return {sessionId:session.id,paperId:paper.id,paperVersion:paper.version,mode:session.mode,sections,languageReading,listening,total,weakSkills,scoring:'raw-custom-80' as const}
}

/** First exposure to B/C is determined per player and paper ID, not selected after seeing a favorable score. */
export function mockReadiness(profileId:string,sessions:readonly MockSession[],papers:readonly MockPaper[]){
  const reasons:string[]=[],results:ReturnType<typeof scoreMock>[]=[]
  const firsts:MockSession[]=[]
  for(const id of ['MB','MC']){
    const first=sessions.filter(s=>s.profileId===profileId&&s.paperId===id&&s.sections[0]?.startedAt!==undefined).sort((a,b)=>a.sections[0].startedAt!-b.sections[0].startedAt!||a.id.localeCompare(b.id))[0]
    if(!first){reasons.push(`${id}:missing-first-attempt`);continue}
    firsts.push(first)
    if(first.status!=='submitted'){reasons.push(`${id}:first-attempt-incomplete`);continue}
    if(first.mode!=='standard'||first.exclusions.length){reasons.push(`${id}:first-attempt-not-standard`);continue}
    const paper=papers.find(p=>p.id===id&&p.version===first.paperVersion)
    if(!paper||!hasApprovedMockMetadata(paper)){reasons.push(`${id}:reviewed-version-unavailable`);continue}
    try{
      const report=scoreMock(first,paper);results.push(report)
      if(report.total.correct<64)reasons.push(`${id}:total-below-64-of-80`)
      if(report.languageReading.correct<39)reasons.push(`${id}:language-reading-below-39-of-55`)
      if(report.listening.correct<18)reasons.push(`${id}:listening-below-18-of-25`)
    }catch{reasons.push(`${id}:invalid-saved-result`)}
  }
  if(firsts.length===2&&Math.abs(firsts[0].sections[0].startedAt!-firsts[1].sections[0].startedAt!)<7*24*60*60*1000)reasons.push('B-C:less-than-seven-days')
  return {status:reasons.length?'NOT_MET':'MET',indicator:'internal-readiness-not-jlpt-prediction',reasons,results} as const
}
