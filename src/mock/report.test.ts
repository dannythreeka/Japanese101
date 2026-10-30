import {it,expect} from 'vitest'
import {fixture} from './__tests__/fixture'
import {createMockSession,transitionMockSession} from './session'
import {mockReadiness,scoreMock} from './report'
import type {MockPaperId} from './blueprint'
const epoch=1800000000000,week=7*24*60*60*1000
function result(id:MockPaperId,at:number,correct:[number,number,number],profileId='test'){
  const paper={...fixture(id),reviewStatus:'APPROVED' as const,reviewer:'Synthetic test reviewer',reviewedAt:'2026-10-30'}
  paper.questions=paper.questions.map(q=>({...q,reviewStatus:'APPROVED'}));paper.audio=paper.audio.map(a=>({...a,reviewStatus:'APPROVED'}))
  let session=createMockSession(`${id}-${at}`,profileId,paper,at),now=at
  for(let index=0;index<3;index++){
    session=transitionMockSession(session,paper,{type:'start'},now++).session
    for(const qid of paper.sections[index].questionIds.slice(0,correct[index])){
      const q=paper.questions.find(q=>q.id===qid)!
      if(q.audioSrc){session=transitionMockSession(session,paper,{type:'audio-start',questionId:qid},now++).session;now+=1000;session=transitionMockSession(session,paper,{type:'audio-complete',questionId:qid},now++).session}
      session=transitionMockSession(session,paper,{type:'answer',questionId:qid,choiceIds:q.answer},now++).session
    }
    session=transitionMockSession(session,paper,{type:'submit-section'},now++).session
  }
  return {paper,session}
}
it('reports fixed denominators and unanswered counts without scaled scores',()=>{
  const {paper,session}=result('MA',epoch,[20,24,20]),report=scoreMock(session,paper)
  expect(report.total).toEqual({correct:64,incorrect:0,unanswered:16,total:80})
  expect(report.languageReading).toEqual({correct:44,incorrect:0,unanswered:11,total:55})
  expect(report.listening).toEqual({correct:20,incorrect:0,unanswered:5,total:25})
  expect(report.weakSkills).toEqual(['G01']);expect(report).not.toHaveProperty('scaledScore')
})
it('requires both first standard forms, exact thresholds, and seven full days',()=>{
  const b=result('MB',epoch,[20,26,18]),c=result('MC',epoch+week,[20,26,18])
  expect(mockReadiness('test',[b.session,c.session],[b.paper,c.paper]).status).toBe('MET')
  const early=result('MC',epoch+week-1,[20,26,18])
  expect(mockReadiness('test',[b.session,early.session],[b.paper,early.paper]).reasons).toContain('B-C:less-than-seven-days')
  const languageLow=result('MC',epoch+week,[20,18,25])
  const languageBoundary=result('MC',epoch+week,[20,19,25])
  expect(mockReadiness('test',[b.session,languageBoundary.session],[b.paper,languageBoundary.paper]).status).toBe('MET')
  const low=mockReadiness('test',[b.session,languageLow.session],[b.paper,languageLow.paper])
  expect(low.reasons).toContain('MC:total-below-64-of-80');expect(low.reasons).toContain('MC:language-reading-below-39-of-55')
  const listeningLow=result('MC',epoch+week,[25,30,17])
  expect(mockReadiness('test',[b.session,listeningLow.session],[b.paper,listeningLow.paper]).reasons).toContain('MC:listening-below-18-of-25')
})
it('uses the first started form, not a favorable repeat or another player',()=>{
  const first=result('MB',epoch,[0,0,0]),retry=result('MB',epoch+week,[25,30,25]),c=result('MC',epoch+2*week,[25,30,25]),other=result('MB',epoch-1000,[25,30,25],'other')
  const report=mockReadiness('test',[retry.session,c.session,other.session,first.session],[first.paper,c.paper])
  expect(report.status).toBe('NOT_MET');expect(report.reasons).toContain('MB:total-below-64-of-80')
  first.session.mode='practice'
  expect(mockReadiness('test',[first.session,retry.session,c.session],[first.paper,c.paper]).reasons).toContain('MB:first-attempt-not-standard')
})
it('does not consume an unstarted form, but an interrupted first exposure cannot be discarded',()=>{
  const b=result('MB',epoch,[25,30,25]),c=result('MC',epoch+week,[25,30,25]),unstarted=createMockSession('not-started','test',b.paper,epoch-10000)
  expect(mockReadiness('test',[unstarted,b.session,c.session],[b.paper,c.paper]).status).toBe('MET')
  const interrupted=transitionMockSession(unstarted,b.paper,{type:'start'},epoch-5000).session;interrupted.status='interrupted'
  expect(mockReadiness('test',[interrupted,b.session,c.session],[b.paper,c.paper]).reasons).toContain('MB:first-attempt-incomplete')
})
it('rejects unsaved, version-mismatched, or tampered results and identifies missing evidence',()=>{
  const {session,paper}=result('MB',epoch,[25,30,25])
  expect(()=>scoreMock({...session,receiptId:undefined},paper)).toThrow('committed')
  expect(()=>scoreMock(session,{...paper,version:'different'})).toThrow('version')
  const copy=structuredClone(session),answer=Object.values(copy.sections[0].answers)[0];answer.savedAt=copy.sections[0].completedAt!+1
  expect(()=>scoreMock(copy,paper)).toThrow('saved mock answer')
  const missingTime=structuredClone(session);delete missingTime.sections[0].startedAt
  expect(()=>scoreMock(missingTime,paper)).toThrow('Incomplete mock section')
  expect(mockReadiness('test',[],[paper]).reasons).toEqual(['MB:missing-first-attempt','MC:missing-first-attempt'])
  expect(mockReadiness('other',[session],[paper]).reasons).toContain('MB:missing-first-attempt')
})
