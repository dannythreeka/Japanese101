import { describe, it, expect } from 'vitest'
import { buildQuestions, shuffleQuestions, checkAnswer, getProgressId } from './DakutenDragEngine'
import type { UnitLesson } from '../../types'

const mockLesson: UnitLesson = {
  unit_id: 'test_unit',
  source_ref: { publisher: 'Test', grade: '1' },
  unit_name_zh: 'テスト',
  learning_concept: 'テスト',
  sub_goals: [],
  target_kana_pairs: [],
  teaching_structure: ['produce'],
  suggested_game_modes: ['dakuten_drag'],
  concept_words: [],
  dakuten_drag_items: [
    { base: 'ふた', target: 'ぶた', meaning_zh: '豬', mark_at: [0], mark: 'dakuten' },
    { base: 'はん', target: 'ぱん', meaning_zh: '麵包', mark_at: [0], mark: 'handakuten' },
    { base: 'かど', target: 'かど', meaning_zh: 'テスト', mark_at: [1], mark: 'dakuten' },
  ],
}

describe('buildQuestions', () => {
  it('converts items into DragQuestion objects with split chars', () => {
    const qs = buildQuestions(mockLesson)
    expect(qs).toHaveLength(3)
    expect(qs[0].baseChars).toEqual(['ふ', 'た'])
    expect(qs[0].targetChars).toEqual(['ぶ', 'た'])
    expect(qs[1].baseChars).toEqual(['は', 'ん'])
    expect(qs[1].targetChars).toEqual(['ぱ', 'ん'])
  })

  it('preserves the original item reference', () => {
    const qs = buildQuestions(mockLesson)
    expect(qs[0].item).toBe(mockLesson.dakuten_drag_items![0])
  })

  it('returns empty array when dakuten_drag_items is undefined', () => {
    const lesson: UnitLesson = { ...mockLesson, dakuten_drag_items: undefined }
    expect(buildQuestions(lesson)).toHaveLength(0)
  })

  it('returns empty array when dakuten_drag_items is empty', () => {
    const lesson: UnitLesson = { ...mockLesson, dakuten_drag_items: [] }
    expect(buildQuestions(lesson)).toHaveLength(0)
  })

  it('correctly splits 4-char words', () => {
    const lesson: UnitLesson = {
      ...mockLesson,
      dakuten_drag_items: [
        { base: 'ふうせん', target: 'ぷうせん', meaning_zh: '氣球', mark_at: [0], mark: 'handakuten' },
      ],
    }
    const qs = buildQuestions(lesson)
    expect(qs[0].baseChars).toEqual(['ふ', 'う', 'せ', 'ん'])
    expect(qs[0].targetChars).toEqual(['ぷ', 'う', 'せ', 'ん'])
  })
})

describe('shuffleQuestions', () => {
  it('preserves all items after shuffle', () => {
    const qs = buildQuestions(mockLesson)
    const shuffled = shuffleQuestions(qs)
    expect(shuffled).toHaveLength(qs.length)
    const origBases = qs.map(q => q.item.base).sort()
    const shuffledBases = shuffled.map(q => q.item.base).sort()
    expect(shuffledBases).toEqual(origBases)
  })

  it('does not mutate the original array', () => {
    const qs = buildQuestions(mockLesson)
    const firstBase = qs[0].item.base
    shuffleQuestions(qs)
    expect(qs[0].item.base).toBe(firstBase)
  })

  it('produces a different order over many runs (probabilistic)', () => {
    const qs = buildQuestions(mockLesson)
    const origOrder = qs.map(q => q.item.base).join(',')
    let sawDifferent = false
    for (let i = 0; i < 30; i++) {
      const result = shuffleQuestions(qs).map(q => q.item.base).join(',')
      if (result !== origOrder) { sawDifferent = true; break }
    }
    expect(sawDifferent).toBe(true)
  })

  it('handles single-item array without error', () => {
    const qs = buildQuestions({ ...mockLesson, dakuten_drag_items: [mockLesson.dakuten_drag_items![0]] })
    expect(shuffleQuestions(qs)).toHaveLength(1)
  })
})

describe('checkAnswer', () => {
  const qs = buildQuestions(mockLesson)

  it('returns true when tileIndex is in mark_at', () => {
    expect(checkAnswer(qs[0], 0)).toBe(true)
  })

  it('returns false when tileIndex is not in mark_at', () => {
    expect(checkAnswer(qs[0], 1)).toBe(false)
  })

  it('returns true for second-position mark_at', () => {
    expect(checkAnswer(qs[2], 1)).toBe(true)
    expect(checkAnswer(qs[2], 0)).toBe(false)
  })

  it('supports multiple valid tile positions', () => {
    const q = { ...qs[0], item: { ...qs[0].item, mark_at: [0, 2] } }
    expect(checkAnswer(q, 0)).toBe(true)
    expect(checkAnswer(q, 2)).toBe(true)
    expect(checkAnswer(q, 1)).toBe(false)
  })
})

describe('getProgressId', () => {
  it('creates stable id from item base', () => {
    const item = mockLesson.dakuten_drag_items![0]
    expect(getProgressId(item)).toBe('ddi_ふた')
  })

  it('creates unique ids for different items', () => {
    const ids = mockLesson.dakuten_drag_items!.map(getProgressId)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})
