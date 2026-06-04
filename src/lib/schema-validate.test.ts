import { describe, it, expect } from 'vitest'
import {
  loadKana, loadVocabulary, loadUnitLessons,
  getLessonById, getWordById, getKanaByHiragana,
  kanaData, vocabData,
} from '../data/loaders'

describe('kana data', () => {
  it('loadKana resolves non-empty array', async () => {
    const list = await loadKana()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('kanaData() returns same sync result', () => {
    const list = kanaData()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('every kana has required fields with correct types', () => {
    for (const item of kanaData()) {
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
    const ids = kanaData().map((k) => k.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all 5 vowels', () => {
    const ids = new Set(kanaData().map((k) => k.id))
    for (const v of ['a', 'i', 'u', 'e', 'o']) {
      expect(ids.has(v)).toBe(true)
    }
  })

  it('difficulty 2 items are all dakuon or handakuon', () => {
    for (const item of kanaData().filter((k) => k.difficulty === 2)) {
      expect(['dakuon', 'handakuon']).toContain(item.type)
    }
  })

  it('difficulty 3 items are all youon', () => {
    for (const item of kanaData().filter((k) => k.difficulty === 3)) {
      expect(item.type).toBe('youon')
    }
  })

  it('getKanaByHiragana("か") returns the ka entry', () => {
    const ka = getKanaByHiragana('か')
    expect(ka).not.toBeNull()
    expect(ka?.romaji).toBe('ka')
  })

  it('getKanaByHiragana("X") returns null', () => {
    expect(getKanaByHiragana('X')).toBeNull()
  })
})

describe('vocabulary data', () => {
  it('loadVocabulary resolves non-empty array', async () => {
    const list = await loadVocabulary()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('vocabData() returns same sync result', () => {
    const list = vocabData()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('every word has required fields', () => {
    for (const word of vocabData()) {
      expect(typeof word.id).toBe('string')
      expect(typeof word.kana).toBe('string')
      expect(typeof word.romaji).toBe('string')
      expect(typeof word.meaning_zh).toBe('string')
      expect(typeof word.image).toBe('object')
      expect(typeof word.image.license).toBe('string')
      expect(typeof word.audio).toBe('object')
      expect(typeof word.audio.license).toBe('string')
    }
  })

  it('has no duplicate ids', () => {
    const ids = vocabData().map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getWordById returns word with correct kana', () => {
    const word = getWordById('w_ajisai')
    expect(word).not.toBeNull()
    expect(word?.kana).toBe('あじさい')
  })

  it('getWordById returns null for unknown id', () => {
    expect(getWordById('w_does_not_exist')).toBeNull()
  })
})

describe('unit_lessons data', () => {
  it('loadUnitLessons resolves non-empty array', async () => {
    const list = await loadUnitLessons()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })

  it('every lesson has required fields', async () => {
    const list = await loadUnitLessons()
    for (const lesson of list) {
      expect(typeof lesson.unit_id).toBe('string')
      expect(typeof lesson.unit_name_zh).toBe('string')
      expect(typeof lesson.learning_concept).toBe('string')
      expect(Array.isArray(lesson.sub_goals)).toBe(true)
      expect(Array.isArray(lesson.concept_words)).toBe(true)
    }
  })

  it('getLessonById returns correct lesson', () => {
    const lesson = getLessonById('mitsumura_g1_u4_dakuten')
    expect(lesson).not.toBeNull()
    expect(lesson?.unit_id).toBe('mitsumura_g1_u4_dakuten')
  })

  it('getLessonById returns null for unknown id', () => {
    expect(getLessonById('does_not_exist')).toBeNull()
  })
})
