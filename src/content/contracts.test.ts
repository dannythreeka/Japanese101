import { describe, expect, it } from 'vitest'
import raw from './packs/u01.json'
import { parseUnitPack, unitPackErrors } from './contracts'
describe('U01 runtime content safety',()=>{
  it('counts 50 practice questions separately from check candidates and preserves draft review',()=>{
    const unit=parseUnitPack(raw)
    expect(unit.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(unit.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    expect(unit.reviewStatus).toBe('DRAFT')
    expect(unit.reviewer).toBeNull()
  })
  it('rejects missing resources, broken teaching references and cycles',()=>{
    const ref=structuredClone(raw);ref.questions[0].teachingIds=['missing']
    expect(unitPackErrors(ref).join(';')).toContain('unknown teaching')
    const cycle=structuredClone(raw);cycle.teaching[0].prerequisites=['teach-G01']
    expect(unitPackErrors(cycle).join(';')).toContain('cycle')
    const audio=structuredClone(raw);audio.listening[0].audioSrc='/different.wav'
    expect(unitPackErrors(audio).join(';')).toContain('audio reference')
  })
  it('cannot promote the unit or silently reduce its practice quota',()=>{
    const fake={...raw,reviewStatus:'APPROVED'}
    expect(()=>parseUnitPack(fake)).toThrow('reviewer')
    const fewer=structuredClone(raw);fewer.questions.pop();fewer.questions.splice(0,1)
    expect(unitPackErrors(fewer)).toContain('U01: requires 50 practice questions')
  })
  it('rejects an unteachable vocabulary ID and duplicate item revision under a different question ID',()=>{
    const orphan=structuredClone(raw);orphan.teaching[0].vocabularyIds=[]
    expect(unitPackErrors(orphan).join(' ')).toContain('U01-V01: missing teaching entry')
    const duplicate=structuredClone(raw);duplicate.questions[1].itemId=duplicate.questions[0].itemId
    expect(unitPackErrors(duplicate)).toContain('bank: duplicate item revision')
  })
})
