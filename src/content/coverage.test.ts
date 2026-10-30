import {describe,expect,it} from 'vitest'
import {curriculumCoverage} from './coverage'
import {u03} from './packs/u03'
const spec={id:'G07',canDo:'Read time',prerequisites:[],minFamilies:5}
describe('global skill coverage without artificial family inflation',()=>{
  it('counts authored primary checks while keeping human approval separate',()=>{
    const report=curriculumCoverage([u03],[spec])
    expect(report.errors).toEqual([])
    expect(report.skills[0].eligibleFamilies).toHaveLength(5)
    expect(report.skills[0].declaredApprovedFamilies).toEqual([])
    expect(report.skills[0].engineeringCoverage).toBe('CANDIDATES_PRESENT')
  })
  it('does not count secondary tags or future blueprint rows as measured abilities',()=>{
    const pack=structuredClone(u03);for(const q of pack.questions)q.skillIds.push('G60')
    const report=curriculumCoverage([pack],[{...spec,id:'G60'}])
    expect(report.skills[0].practiceIds).toEqual([])
    expect(report.skills[0].eligibleFamilies).toEqual([])
    expect(report.skills[0].missing).toContain('primary independent check')
  })
  it('detects reordered options and punctuation-only edits disguised as new check families',()=>{
    const pack=structuredClone(u03),first=pack.questions.find(q=>q.partition==='check'&&q.primarySkillId==='G07')!
    const duplicate={...structuredClone(first),id:'U03-extra-check',itemId:'U03-extra-check',itemFamilyId:'invented-new-family',prompt:first.prompt+' !',choices:[...first.choices].reverse()}
    pack.questions.push(duplicate)
    const report=curriculumCoverage([pack],[spec])
    expect(report.duplicates[0].itemIds).toContain(duplicate.id)
    expect(report.errors.join(' ')).toContain('same item content split into different families')
    expect(report.skills[0].candidateFamilies).toHaveLength(6)
    expect(report.skills[0].eligibleFamilies).toHaveLength(5)
  })
  it('preserves meaningful decimal punctuation when checking duplicate content',()=>{
    const pack=structuredClone(u03),first=pack.questions.find(q=>q.partition==='check')!
    first.prompt='數字1.5';first.promptJa='1.5'
    pack.questions.push({...structuredClone(first),id:'different-number',itemId:'different-number',itemFamilyId:'different-number-family',prompt:'數字15',promptJa:'15'})
    expect(curriculumCoverage([pack],[spec]).duplicates).toEqual([])
  })
  it('does not let practice copies or conflicting answers count as independent checks',()=>{
    const pack=structuredClone(u03),first=pack.questions.find(q=>q.partition==='check'&&q.primarySkillId==='G07')!
    pack.questions.push({...structuredClone(first),id:'practice-copy',itemId:'practice-copy',partition:'practice',itemFamilyId:'new-practice-family'})
    let report=curriculumCoverage([pack],[spec])
    expect(report.skills[0].eligibleFamilies).toHaveLength(4)
    expect(report.duplicates[0].crossesPartition).toBe(true)
    pack.questions.pop()
    pack.questions.push({...structuredClone(first),id:'wrong-answer-copy',itemId:'wrong-answer-copy',answer:[first.choices.find(c=>!first.answer.includes(c.id))!.id]})
    report=curriculumCoverage([pack],[spec])
    expect(report.duplicates[0].conflictingAnswers).toBe(true)
    expect(report.skills[0].eligibleFamilies).toHaveLength(4)
  })
  it('checks family partition leakage across units, not just within one pack',()=>{
    const second=structuredClone(u03);second.id='U99'
    second.questions=second.questions.slice(0,1).map(q=>({...q,id:'U99-P01',itemId:'U99-P01',unitId:'U99',itemFamilyId:u03.questions.find(q=>q.partition==='check')!.itemFamilyId}))
    expect(curriculumCoverage([u03,second],[spec]).errors.join(' ')).toContain('family crosses partitions')
  })
})
