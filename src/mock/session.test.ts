import {describe,it,expect} from 'vitest'
import {fixture} from './__tests__/fixture'
import {createMockSession,transitionMockSession,type MockSession,type MockCommand} from './session'
const paper=fixture('MA'),epoch=1800000000000
const initial=()=>createMockSession('exam-test','anonymous-test',paper,epoch)
const step=(s:MockSession,c:MockCommand,now=epoch)=>transitionMockSession(s,paper,c,now)
const start=()=>step(initial(),{type:'start'}).session
describe('fixed-clock mock section transitions',()=>{
  it('uses exact 20/40/30 minute deadlines and keeps breaks outside the next section',()=>{
    let s=start();expect(s.sections[0].deadlineAt).toBe(epoch+20*60000)
    s=step(s,{type:'submit-section'},epoch+1000).session;expect(s.status).toBe('ready');expect(s.sections[1].startedAt).toBeUndefined()
    s=step(s,{type:'start'},epoch+3600000).session;expect(s.sections[1].deadlineAt).toBe(epoch+3600000+40*60000)
    s=step(s,{type:'submit-section'},epoch+3601000).session
    s=step(s,{type:'start'},epoch+7200000).session;expect(s.sections[2].deadlineAt).toBe(epoch+7200000+30*60000)
  })
  it('accepts before deadline, freezes at the exact deadline and preserves unanswered items',()=>{
    const q=paper.questions[0],s=start(),deadline=s.sections[0].deadlineAt!
    const accepted=step(s,{type:'answer',questionId:q.id,choiceIds:q.answer},deadline-1)
    expect(accepted.accepted).toBe(true);expect(s.sections[0].answers).toEqual({})
    const q2=paper.questions[1],expired=step(accepted.session,{type:'answer',questionId:q2.id,choiceIds:q2.answer},deadline)
    expect(expired.accepted).toBe(false);expect(expired.reason).toBe('deadline-reached')
    expect(expired.session.sections[0].completedAt).toBe(deadline)
    expect(Object.keys(expired.session.sections[0].answers)).toEqual([q.id])
    expect(expired.session.sectionIndex).toBe(1)
    expect(step(expired.session,{type:'answer',questionId:q2.id,choiceIds:q2.answer},deadline+1).accepted).toBe(false)
  })
  it('does not stop time for offline, reload, background, or suspended intervals',()=>{
    let s=start();s=step(s,{type:'background'},epoch+10).session;s=step(s,{type:'offline'},epoch+20).session
    s=step(s,{type:'reload'},epoch+30).session
    const deadline=s.sections[0].deadlineAt!
    s=step(s,{type:'foreground'},deadline+10000).session
    expect(s.sections[0].completedAt).toBe(deadline);expect(s.sections[0].answers).toEqual({});expect(s.status).toBe('ready')
  })
  it('irreversibly downgrades paused or revealed sessions to practice',()=>{
    const approved={...paper,reviewStatus:'APPROVED' as const,reviewer:'Synthetic test reviewer',reviewedAt:'2026-10-30'}
    approved.questions=approved.questions.map(q=>({...q,reviewStatus:'APPROVED'}));approved.audio=approved.audio.map(a=>({...a,reviewStatus:'APPROVED'}))
    let s=createMockSession('approved-fixture','test',approved,epoch)
    expect(s.mode).toBe('standard')
    s=transitionMockSession(s,approved,{type:'start'},epoch).session
    s=transitionMockSession(s,approved,{type:'pause'},epoch+60000).session
    expect(s.mode).toBe('practice');expect(s.sections[0].remainingMs).toBe(19*60000)
    s=transitionMockSession(s,approved,{type:'resume'},epoch+3600000).session
    expect(s.sections[0].deadlineAt).toBe(epoch+3600000+19*60000);expect(s.exclusions).toContain('paused')
    expect(step(start(),{type:'reveal'}).session.exclusions).toContain('answers-revealed')
    expect(initial().mode).toBe('preview');expect(initial().exclusions).toContain('draft-content')
  })
  it('detects clock regression and content version changes without rewriting the original version',()=>{
    const s=step(start(),{type:'tick'},epoch+1000).session
    const regressed=step(s,{type:'tick'},epoch+500).session
    expect(regressed.status).toBe('interrupted');expect(regressed.lastObservedAt).toBe(epoch+1000)
    expect(step(regressed,{type:'resume'},epoch+2000).session.mode).toBe('practice')
    const changed=transitionMockSession(s,{...paper,version:'revised'}, {type:'tick'},epoch+2000).session
    expect(changed.status).toBe('interrupted');expect(changed.paperVersion).toBe(paper.version)
    expect(transitionMockSession(changed,{...paper,version:'revised'},{type:'resume'},epoch+3000).accepted).toBe(false)
  })
  it('requires completed audio, rejects fabricated early completion, and marks replay as practice',()=>{
    let s=start();s=step(s,{type:'submit-section'},epoch+1).session;s=step(s,{type:'start'},epoch+2).session;s=step(s,{type:'submit-section'},epoch+3).session;s=step(s,{type:'start'},epoch+4).session
    const q=paper.questions.find(q=>q.audioSrc)!
    expect(step(s,{type:'answer',questionId:q.id,choiceIds:q.answer},epoch+5).reason).toBe('audio-incomplete')
    s=step(s,{type:'audio-start',questionId:q.id},epoch+10).session
    expect(step(s,{type:'audio-complete',questionId:q.id},epoch+11).accepted).toBe(false)
    expect(step(s,{type:'audio-start',questionId:q.id},epoch+12).reason).toBe('audio-already-playing')
    s=step(s,{type:'audio-complete',questionId:q.id},epoch+1010).session
    expect(step(s,{type:'answer',questionId:q.id,choiceIds:q.answer},epoch+1011).accepted).toBe(true)
    s=step(s,{type:'audio-start',questionId:q.id},epoch+1012).session
    expect(s.mode).toBe('practice');expect(s.exclusions).toContain('audio-replayed');expect(s.sections[2].audio[q.id].plays).toBe(2)
  })
  it('distinguishes a load failure before playback from an interrupted playing clip',()=>{
    let s=start();s=step(s,{type:'submit-section'},epoch+1).session;s=step(s,{type:'start'},epoch+2).session;s=step(s,{type:'submit-section'},epoch+3).session;s=step(s,{type:'start'},epoch+4).session
    s=step(s,{type:'audio-failed'},epoch+5).session;expect(s.status).toBe('active')
    const q=paper.questions.find(q=>q.audioSrc)!
    s=step(s,{type:'audio-start',questionId:q.id},epoch+6).session
    const interrupted=step(s,{type:'reload'},epoch+10).session
    expect(interrupted.status).toBe('interrupted')
    const resumed=step(interrupted,{type:'resume'},epoch+20).session
    expect(resumed.mode).toBe('practice');expect(resumed.sections[2].audio[q.id]).toBeUndefined()
    expect(Object.values(resumed.sections[2].answers)).toHaveLength(0)
  })
  it('keeps one stable submission receipt and never allows post-submit edits or a repeated section submit',()=>{
    let s=initial(),now=epoch
    for(let i=0;i<3;i++){s=step(s,{type:'start'},now++).session;s=step(s,{type:'submit-section'},now++).session}
    expect(s.status).toBe('submitted');expect(s.receiptId).toBe('mock-submit:exam-test')
    for(const command of [{type:'submit-section'},{type:'start'},{type:'reveal'}] as MockCommand[])expect(step(s,command,now++).session).toBe(s)
    expect(s.sections.every(x=>x.status==='complete')).toBe(true)
  })
  it('rejects invalid clocks, wrong-section answers and arbitrary option IDs',()=>{
    expect(()=>createMockSession('x','y',paper,NaN)).toThrow('clock')
    expect(()=>step(start(),{type:'tick'},Infinity)).toThrow('clock')
    const s=start(),q=paper.questions[0],other=paper.questions.find(q=>q.audioSrc)!
    expect(step(s,{type:'answer',questionId:q.id,choiceIds:['invented']}).accepted).toBe(false)
    expect(step(s,{type:'answer',questionId:other.id,choiceIds:other.answer}).accepted).toBe(false)
    expect(step(s,{type:'start'}).reason).toBe('not-ready')
  })
})
