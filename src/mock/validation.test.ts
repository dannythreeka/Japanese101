import {describe,it,expect} from 'vitest'
import {u01} from '../content/packs/u01'
import {MOCK_SECTIONS} from './blueprint'
import {fixture} from './__tests__/fixture'
import {mockInventoryErrors} from './validation'

describe('custom mock blueprint and isolation',()=>{
  it('fixes product quotas and official section times independently of generated fixtures',()=>{
    expect(MOCK_SECTIONS.map(s=>s.count)).toEqual([25,30,25])
    expect(MOCK_SECTIONS.map(s=>s.minutes)).toEqual([20,40,30])
    const papers=(['MA','MB','MC'] as const).map(fixture)
    expect(mockInventoryErrors(papers,[u01],true)).toEqual([])
    expect(mockInventoryErrors([],[u01],true)).toEqual(['MA: missing authored paper','MB: missing authored paper','MC: missing authored paper'])
  })
  it('rejects wrong assignment, missing quota, wrong item category and untaught skills',()=>{
    const paper=fixture('MA');paper.sections[0].questionIds[0]=paper.sections[1].questionIds[0];paper.questions[1].typeId='T14';paper.questions[2].skillIds=['not-taught'];paper.questions.pop()
    const errors=mockInventoryErrors([paper],[u01]).join('\n')
    expect(errors).toContain('needs 80');expect(errors).toContain('duplicate section assignment');expect(errors).toContain('incorrect section type');expect(errors).toContain('untaught skill')
  })
  it('rejects daily family reuse and renamed copies even when choice order changes',()=>{
    const paper=fixture('MA');paper.questions[0].itemFamilyId=u01.questions[0].itemFamilyId
    expect(mockInventoryErrors([paper],[u01]).join(' ')).toContain('item family shared with daily')
    const copy=structuredClone(u01.questions[0]);Object.assign(copy,{id:'MA-copy',itemId:'MA-copy',unitId:'MA',partition:'mock',hintPolicy:'none',itemFamilyId:'MA-fake-new-family',choices:[...copy.choices].reverse()})
    paper.questions[0]=copy;paper.sections[0].questionIds[0]=copy.id
    expect(mockInventoryErrors([paper],[u01]).join(' ')).toContain('question content shared with daily')
  })
  it('rejects A/B/C cross-form families, source recordings and reading material',()=>{
    const a=fixture('MA'),b=fixture('MB');b.questions[0].itemFamilyId=a.questions[0].itemFamilyId;b.audio[0].script=a.audio[0].script
    b.questions.find(q=>q.material)!.material=a.questions.find(q=>q.material)!.material
    const errors=mockInventoryErrors([a,b],[u01]).join(' ')
    expect(errors).toContain('item family shared with MA');expect(errors).toContain('audio script shared with MA');expect(errors).toContain('reading material shared with MA')
  })
  it('rejects identical questions inside one form even if IDs/families were changed',()=>{
    const paper=fixture('MA'),q=structuredClone(paper.questions[0]);q.id=paper.questions[1].id;q.itemId=q.id;q.itemFamilyId='new-but-duplicate';paper.questions[1]=q
    expect(mockInventoryErrors([paper],[u01]).join(' ')).toContain('question content shared with MA/')
  })
  it('rejects missing recordings, fake provenance and hint-enabled assessment',()=>{
    const paper=fixture('MA');paper.audio[0].durationSeconds=0;paper.audio[1].sha256='';paper.audio.pop();paper.questions[0].hintPolicy='practice-only';paper.questions[1].teachingIds=['invented-teaching']
    const errors=mockInventoryErrors([paper],[u01]).join(' ')
    expect(errors).toContain('incomplete audio provenance');expect(errors).toContain('missing audio source');expect(errors).toContain('hint policy');expect(errors).toContain('unknown teaching prerequisite')
  })
})
