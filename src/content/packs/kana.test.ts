/// <reference types="node" />
import {describe, it, expect} from 'vitest'
import {existsSync} from 'node:fs'
import {validateQuestionBank} from '../contracts'
import {hiraganaPack, katakanaPack} from './kana'

describe('P3-01 basic kana inventory',()=>{
  it('covers 46 characters per script with existing offline recordings and valid questions',()=>{
    for(const pack of [hiraganaPack,katakanaPack]){
      expect(pack.teaching).toHaveLength(46)
      expect(new Set(pack.teaching.map(c=>c.example)).size).toBe(46)
      expect(validateQuestionBank(pack.questions)).toEqual([])
      expect(pack.questions.filter(q=>q.partition==='practice')).toHaveLength(46)
      expect(pack.questions.filter(q=>q.partition==='check')).toHaveLength(0)
      for(const c of pack.teaching)expect(existsSync(`public/${c.audioSrc}`), c.id).toBe(true)
      for(const q of pack.questions){expect(q.audioPolicy).toBe('required');expect(q.choices.map(c=>c.text).every(t=>/^[ぁ-んァ-ン]$/.test(t))).toBe(true)}
    }
  })
  it('keeps script skills distinct and does not inflate families by duplicating a sound question',()=>{
    const hira=new Set(hiraganaPack.teaching.flatMap(c=>c.skillIds))
    expect(katakanaPack.teaching.flatMap(c=>c.skillIds).some(id=>hira.has(id))).toBe(false)
    for(const pack of [hiraganaPack,katakanaPack]){
      expect(new Set(pack.questions.map(q=>q.itemFamilyId)).size).toBe(46)
      for(const q of pack.questions){
        const keys=q.choices.map(c=>c.id==='wo'?'o':c.id)
        expect(new Set(keys).size).toBe(keys.length)
      }
      expect(pack.reviewStatus).toBe('DRAFT');expect(pack.reviewer).toBeNull()
    }
  })
})
