import { describe, it, expect } from 'vitest'
import kanaList from '../data/kana.json'
import vocabList from '../data/vocabulary.json'
import type { KanaItem, VocabWord } from '../types'

describe('kana.json schema', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(kanaList)).toBe(true)
    expect((kanaList as unknown[]).length).toBeGreaterThan(0)
  })

  it('every item has required fields with correct types', () => {
    const list = kanaList as KanaItem[]
    for (const item of list) {
      expect(typeof item.id).toBe('string')
      expect(typeof item.hiragana).toBe('string')
      expect(typeof item.katakana).toBe('string')
      expect(typeof item.romaji).toBe('string')
      expect(typeof item.row).toBe('string')
      expect(['seion', 'dakuon', 'handakuon', 'youon']).toContain(item.type)
      expect([1, 2, 3]).toContain(item.difficulty)
    }
  })

  it('has no duplicate ids', () => {
    const ids = (kanaList as KanaItem[]).map((k) => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all 5 vowels', () => {
    const ids = new Set((kanaList as KanaItem[]).map((k) => k.id))
    for (const v of ['a', 'i', 'u', 'e', 'o']) {
      expect(ids.has(v)).toBe(true)
    }
  })

  it('difficulty 2 items are all dakuon or handakuon', () => {
    const d2 = (kanaList as KanaItem[]).filter((k) => k.difficulty === 2)
    for (const item of d2) {
      expect(['dakuon', 'handakuon']).toContain(item.type)
    }
  })

  it('difficulty 3 items are all youon', () => {
    const d3 = (kanaList as KanaItem[]).filter((k) => k.difficulty === 3)
    for (const item of d3) {
      expect(item.type).toBe('youon')
    }
  })
})

describe('vocabulary.json schema', () => {
  it('is a non-empty flat array', () => {
    expect(Array.isArray(vocabList)).toBe(true)
    expect((vocabList as unknown[]).length).toBeGreaterThan(0)
  })

  it('every item has required fields', () => {
    const list = vocabList as VocabWord[]
    for (const word of list) {
      expect(typeof word.id).toBe('string')
      expect(typeof word.kana).toBe('string')
      expect(typeof word.romaji).toBe('string')
      expect(typeof word.meaning_zh).toBe('string')
      expect(typeof word.unit).toBe('string')
      expect(typeof word.image).toBe('object')
      expect(typeof word.image.license).toBe('string')
      expect(typeof word.audio).toBe('object')
      expect(['tts_generated', 'recorded']).toContain(word.audio.origin)
    }
  })

  it('has no duplicate ids', () => {
    const ids = (vocabList as VocabWord[]).map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all unit codes are known', () => {
    const known = new Set([
      'topic_animals', 'topic_food', 'topic_colors',
      'topic_numbers', 'topic_body', 'topic_feelings', 'topic_daily',
    ])
    for (const word of vocabList as VocabWord[]) {
      expect(known.has(word.unit)).toBe(true)
    }
  })
})
