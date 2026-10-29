import {expect,it} from 'vitest'
import {auditReviews} from './review-audit'
const target={id:'TEST-Q01',kind:'questions',sha256:'current-content-hash'}
const signed={...target,status:'APPROVED',reviewer:'fixture-independent-reviewer',reviewedAt:'2026-10-01T00:00:00Z'}
it('requires an exact ID, kind, current hash, non-author reviewer and valid date',()=>{
  expect(auditReviews([target],[signed],{author:'Codex'})[0].metadataValid).toBe(true)
  const result=auditReviews([target],[{...signed,sha256:'old',reviewer:'Codex',reviewedAt:'bad-date'}],{author:'Codex'})[0]
  expect(result.problems).toEqual(['STALE_HASH','AUTHOR_REVIEW','INVALID_REVIEW_DATE'])
  expect(auditReviews([target],[{...signed,kind:'audio'}])[0].problems).toEqual(['MISSING_RECORD'])
})
it('rejects duplicate review rows instead of choosing a convenient approval',()=>{
  const result=auditReviews([target],[signed,{...signed,status:'NOT_RUN'}])[0]
  expect(result.metadataValid).toBe(false);expect(result.problems).toContain('DUPLICATE_RECORD')
})
it('honors the original U01 PASS/version protocol without rewriting its ledger',()=>{
  const expected={...target,kind:'question',version:'unit-v2'},record={...signed,kind:'question',version:'unit-v2',result:'PASS'}
  expect(auditReviews([expected],[record],{legacy:true})[0].metadataValid).toBe(true)
  expect(auditReviews([expected],[{...record,version:'unit-v1'}],{legacy:true})[0].problems).toContain('STALE_VERSION')
  expect(auditReviews([expected],[{...record,result:'NOT_RUN'}],{legacy:true})[0].problems).toContain('NOT_APPROVED')
})
