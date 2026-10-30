import {describe,expect,it} from 'vitest'
import {curriculumErrors} from './inventory'
import {u01} from './packs/u01'
import {u02} from './packs/u02'
import {u03} from './packs/u03'
import {availablePacks} from './packs/registry'
import blueprint from '../../docs/content/n5-manifest.json'
import {curriculumCoverage} from './coverage'
describe('actual curriculum inventory',()=>{
  it('accepts two authored drafts without claiming the remaining blueprint units exist',()=>{
    expect(curriculumErrors([u01,u02],blueprint.units)).toEqual([])
    expect(u02.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(u02.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    for(const g of u02.grammar)expect(new Set(u02.questions.filter(q=>q.partition==='check'&&q.primarySkillId===g.id).map(q=>q.itemFamilyId)).size).toBe(5)
    expect(u02.reviewStatus).toBe('DRAFT')
  })
  it('keeps U03 original counts, prerequisites, check families and listening families consistent',()=>{
    expect(curriculumErrors([u01,u02,u03],blueprint.units)).toEqual([])
    expect(u03.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(u03.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    for(const g of u03.grammar){
      const checks=u03.questions.filter(q=>q.partition==='check'&&q.primarySkillId===g.id)
      expect(new Set(checks.map(q=>q.itemFamilyId)).size).toBe(5)
      expect(checks.every(q=>q.teachingIds.includes(`U03-teach-${g.id}`))).toBe(true)
    }
    for(const audio of u03.listening)expect(new Set(u03.questions.filter(q=>q.audioId===audio.id).map(q=>q.itemFamilyId)).size).toBe(1)
    expect(u03.reviewStatus).toBe('DRAFT')
  })
  it('satisfies the first-four-unit engineering quotas with actual distinct authored content',()=>{
    const ids=['U01','U02','U03','U04'],packs=availablePacks.filter(p=>ids.includes(p.id))
    expect(packs.map(p=>p.id)).toEqual(ids)
    expect(curriculumErrors(packs,blueprint.units)).toEqual([])
    expect(new Set(packs.flatMap(p=>p.vocabulary.map(v=>v.reading.normalize('NFKC')))).size).toBe(100)
    expect(new Set(packs.flatMap(p=>p.kanji.map(k=>k.text))).size).toBe(20)
    expect(new Set(packs.flatMap(p=>p.grammar.map(g=>g.id))).size).toBeGreaterThanOrEqual(10)
    expect(packs.flatMap(p=>p.readings)).toHaveLength(16)
    expect(packs.flatMap(p=>p.listening)).toHaveLength(24)
    expect(packs.flatMap(p=>p.questions.filter(q=>q.partition==='practice'))).toHaveLength(200)
    const u04=packs.find(p=>p.id==='U04')!
    for(const grammar of u04.grammar)expect(new Set(u04.questions.filter(q=>q.partition==='check'&&q.primarySkillId===grammar.id).map(q=>q.itemFamilyId)).size).toBe(5)
    for(const audio of u04.listening)expect(new Set(u04.questions.filter(q=>q.audioId===audio.id).map(q=>q.itemFamilyId)).size).toBe(1)
    expect(u04.reviewStatus).toBe('DRAFT')
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
  it('adds a real U05 family unit without reusing first-four vocabulary or inflating delayed check families',()=>{
    const packs=availablePacks.filter(p=>/^U0[1-5]$/.test(p.id)),pack=packs.find(p=>p.id==='U05')!
    expect(packs).toHaveLength(5)
    expect(curriculumErrors(packs,blueprint.units)).toEqual([])
    expect(pack.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(pack.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    const coverage=curriculumCoverage(packs,blueprint.skills)
    expect(coverage.errors).toEqual([])
    for(const id of ['G13','G14','G15'])expect(coverage.skills.find(s=>s.id===id)?.eligibleFamilies).toHaveLength(5)
    for(const clip of pack.listening)expect(new Set(pack.questions.filter(q=>q.audioId===clip.id).map(q=>q.itemFamilyId)).size).toBe(1)
    expect(pack.questions.filter(q=>q.typeId==='T13').map(q=>q.image?.cell)).toEqual([0,1,2,3])
    expect(pack.reviewStatus).toBe('DRAFT')
  })
  it('adds a real U06 food unit without reusing first-five vocabulary or inflating delayed check families',()=>{
    const packs=availablePacks.filter(p=>/^U0[1-6]$/.test(p.id)),pack=packs.find(p=>p.id==='U06')!
    expect(packs).toHaveLength(6)
    expect(curriculumErrors(packs,blueprint.units)).toEqual([])
    expect(pack.questions.filter(q=>q.partition==='practice')).toHaveLength(50)
    expect(pack.questions.filter(q=>q.partition==='check')).toHaveLength(15)
    const coverage=curriculumCoverage(packs,blueprint.skills)
    expect(coverage.errors).toEqual([])
    for(const id of ['G16','G17','G18'])expect(coverage.skills.find(s=>s.id===id)?.eligibleFamilies).toHaveLength(5)
    for(const clip of pack.listening)expect(new Set(pack.questions.filter(q=>q.audioId===clip.id).map(q=>q.itemFamilyId)).size).toBe(1)
    expect(pack.questions.filter(q=>q.typeId==='T13').map(q=>q.image?.cell)).toEqual([0,1,2,3])
    expect(pack.reviewStatus).toBe('DRAFT')
  })
  it('rejects unused listening, wrong skills, unsupported practice types and untranslated instructions',()=>{
    const copy=structuredClone(u02);copy.questions=copy.questions.filter(q=>q.audioId!=='U02-L06')
    copy.questions[0].skillIds=['not-in-blueprint'];copy.questions[0].promptJa='';copy.questions[0].typeId='T99'
    const errors=curriculumErrors([copy],blueprint.units).join('\n')
    expect(errors).toContain('unused listening');expect(errors).toContain('unassigned skill');expect(errors).toContain('missing Japanese text');expect(errors).toContain('unassigned practice type')
  })
})
