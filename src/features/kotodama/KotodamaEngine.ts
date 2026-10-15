import type { ConceptWord, KotodamaScene, UnitLesson } from '../../types'
import { lessonData, vocabData } from '../../data/loaders'

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

/** Explicit content IDs never silently fall back to unrelated random words. */
export function buildConfiguredKotodamaRound(config:Record<string,unknown> = {}):ConceptWord[] {
  const count=typeof config.roundLength==='number'?config.roundLength:3
  if(!Number.isInteger(count)||count<1)return []
  if(Array.isArray(config.targetWords)){
    const words=config.targetWords.map(id=>{
      const concept=lessonData().flatMap(l=>l.concept_words).find(w=>w.id===id)
      if(concept)return concept
      const word=vocabData().find(w=>w.id===id)
      return word?{id:word.id,word:word.kana,meaning_zh:word.meaning_zh}:undefined
    })
    return words.every((w):w is ConceptWord=>!!w)?words.slice(0,count):[]
  }
  if(Array.isArray(config.unitPool)){
    if(!config.unitPool.length||config.unitPool.some(id=>!lessonData().some(l=>l.unit_id===id)))return []
    return buildKotodamaRound(lessonData().filter(l=>(config.unitPool as string[]).includes(l.unit_id)),count)
  }
  if(typeof config.unitId==='string'){
    const unit=lessonData().find(l=>l.unit_id===config.unitId)
    return unit?buildKotodamaRound([unit],count):[]
  }
  return buildKotodamaRound(undefined,count)
}
