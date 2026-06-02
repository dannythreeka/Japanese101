import { describe, it, expect } from 'vitest'
import { buildKotodamaRound } from './KotodamaEngine'
import type { UnitLesson } from '../../types'

function makeLesson(wordIds: string[], withScene: boolean): UnitLesson {
  return {
    unit_id: 'test',
    source_ref: { publisher: 'test', grade: '小1' },
    unit_name_zh: 'test',
    learning_concept: 'test',
    sub_goals: [],
    target_kana_pairs: [],
    teaching_structure: ['recognize'],
    suggested_game_modes: ['kana_catch_listen'],
    concept_words: wordIds.map(id => ({
      id,
      word: id,
      meaning_zh: id,
      ...(withScene
        ? {
            kotodama_scene: {
              scene_id: `${id}_scene`,
              initial_state: 'init',
              success_state: 'success',
              asset_hint: '',
              anim_hint: '',
            },
          }
        : {}),
    })),
  }
}

describe('buildKotodamaRound', () => {
  it('returns words that all have kotodama_scene', () => {
    const lessons = [makeLesson(['w1', 'w2', 'w3', 'w4', 'w5'], true)]
    const round = buildKotodamaRound(lessons, 3)
    expect(round).toHaveLength(3)
    round.forEach(w => {
      expect(w.kotodama_scene).toBeDefined()
      expect(w.kotodama_scene.scene_id).toBeTruthy()
    })
  })

  it('filters out words without kotodama_scene', () => {
    const lessons = [
      makeLesson(['a', 'b'], true),
      makeLesson(['c', 'd'], false),
    ]
    const round = buildKotodamaRound(lessons, 10)
    expect(round).toHaveLength(2)
    round.forEach(w => expect(w.kotodama_scene).toBeDefined())
  })

  it('returns empty array when no scenes are defined', () => {
    const round = buildKotodamaRound([makeLesson(['x', 'y'], false)], 3)
    expect(round).toHaveLength(0)
  })

  it('returns empty array for empty lesson list', () => {
    expect(buildKotodamaRound([], 3)).toHaveLength(0)
  })

  it('loads real lesson data (at least 3 words with scenes)', () => {
    const round = buildKotodamaRound(undefined, 3)
    expect(round.length).toBeGreaterThanOrEqual(3)
  })
})
