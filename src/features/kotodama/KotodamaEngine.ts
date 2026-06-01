import type { ConceptWord, KotodamaScene, UnitLesson } from '../../types'
import { lessonData } from '../../data/loaders'

export type KotodamaWord = ConceptWord & { kotodama_scene: KotodamaScene }

function hasScene(w: ConceptWord): w is KotodamaWord {
  return w.kotodama_scene != null
}

/** Fisher-Yates in-place shuffle */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Build a randomized round of ことだま words.
 * Returns up to `count` words that have a kotodama_scene defined.
 */
export function buildKotodamaRound(
  lessons: UnitLesson[] = lessonData(),
  count = 3,
): KotodamaWord[] {
  const all = lessons.flatMap(l => l.concept_words).filter(hasScene)
  return shuffle([...all]).slice(0, Math.min(count, all.length))
}
