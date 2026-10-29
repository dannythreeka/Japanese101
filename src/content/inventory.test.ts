import {describe,expect,it} from 'vitest'
import {curriculumErrors} from './inventory'
import {u01} from './packs/u01'
import {u02} from './packs/u02'
import blueprint from '../../docs/content/n5-manifest.json'
describe('actual curriculum inventory',()=>{
  it('accepts two authored drafts without claiming the remaining blueprint units exist',()=>{
    expect(curriculumErrors([u01,u02],blueprint.units)).toEqual([])
    expect(u02.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(u02.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    for(const g of u02.grammar)expect(new Set(u02.questions.filter(q=>q.partition==='check'&&q.primarySkillId===g.id).map(q=>q.itemFamilyId)).size).toBe(5)
    expect(u02.reviewStatus).toBe('DRAFT')
  })
  it('rejects reused new vocabulary, orphan teaching and incomplete counts',()=>{
    const copy=structuredClone(u02);copy.vocabulary[0].reading=u01.vocabulary[0].reading
    copy.teaching[0].vocabularyIds=[];copy.questions.splice(0,1)
    const errors=curriculumErrors([u01,copy],blueprint.units).join('\n')
    expect(errors).toContain('already introduced')
    expect(errors).toContain('missing teaching entry')
    expect(errors).toContain('practice quota 49 != 50')
    expect(errors).toContain('T01 distribution mismatch')
  })
  it('rejects unused listening, wrong skills, unsupported practice types and untranslated instructions',()=>{
    const copy=structuredClone(u02);copy.questions=copy.questions.filter(q=>q.audioId!=='U02-L06')
    copy.questions[0].skillIds=['not-in-blueprint'];copy.questions[0].promptJa='';copy.questions[0].typeId='T99'
    const errors=curriculumErrors([copy],blueprint.units).join('\n')
    expect(errors).toContain('unused listening');expect(errors).toContain('unassigned skill');expect(errors).toContain('missing Japanese text');expect(errors).toContain('unassigned practice type')
  })
})
