import type { Kana, Word, UnitLesson, GameModeId } from '../types'
import type { LevelsData } from '../types/adventure'
import { GAME_ROUTES } from './gameModes'

export interface QuestionFixture { id: string; itemId: string; skillIds?: string[]; options: {id: string; correct: boolean}[] }
export interface ContentInput {
  kana: Kana[]; words: Word[]; lessons: UnitLesson[]; levels: LevelsData
  assets: Set<string>; scenes: Set<string>; skills: Set<string>; questions?: QuestionFixture[]
}
/** Reports precise IDs; schema checks precede this relation/asset validation in CI. */
export function validateContent(input: ContentInput): string[] {
  const errors: string[] = []
  const check = (ok: unknown, message: string) => { if (!ok) errors.push(message) }
  const unique = (ids: string[], label: string) => { const seen = new Set<string>(); for (const id of ids) { check(id && !seen.has(id), `${label}: duplicate/empty ID ${id}`); seen.add(id) }; return seen }
  const kana = unique(input.kana.map(k=>k.id),'kana'), words = unique(input.words.map(w=>w.id),'word')
  const lessons = unique(input.lessons.map(l=>l.unit_id),'unit'), levels = unique(input.levels.levels.map(l=>l.level_id),'level')
  const regions = unique(input.levels.regions.map(r=>r.region_id),'region')
  const symbols = new Set([...input.kana.flatMap(k=>[k.hiragana,k.katakana]), ...input.words.map(w=>w.kana)])
  const asset = (path: string, label: string) => check(path && input.assets.has(path.replace(/^\//,'')), `${label}: missing asset ${path || '(empty)'}`)
  for (const k of input.kana) asset(`/assets/audio/kana_${k.id}.wav`, k.id)
  for (const w of input.words) { asset(w.image.src,`${w.id} image`); asset(w.audio.src,`${w.id} audio`) }
  const skillRefs = (value: unknown, label: string) => {
    const fields = value as {skillIds?: string[]; skillId?: string}
    for (const id of [...fields.skillIds??[], ...fields.skillId?[fields.skillId]:[]]) check(input.skills.has(id), `${label}: missing skill ${id}`)
  }
  for (const l of input.lessons) {
    skillRefs(l,l.unit_id)
    check(l.target_kana_pairs.length && l.target_kana_pairs.every(p=>p.length), `${l.unit_id}: empty question group`)
    for (const pair of l.target_kana_pairs) for (const symbol of pair) check(symbols.has(symbol),`${l.unit_id}: missing item ${symbol}`)
    const ids=unique(l.concept_words.map(w=>w.id),l.unit_id)
    for (const w of l.concept_words) {
      check(words.has(w.id),`${l.unit_id}: missing item ${w.id}`)
      if(w.pair_with) check(ids.has(w.pair_with),`${l.unit_id}: missing contrast ${w.pair_with}`)
      if(w.kotodama_scene) check(input.scenes.has(w.kotodama_scene.scene_id),`${w.id}: missing scene ${w.kotodama_scene.scene_id}`)
      skillRefs(w,w.id)
    }
  }
  for (const r of input.levels.regions) for(const id of r.level_ids) check(levels.has(id),`${r.region_id}: missing level ${id}`)
  for (const l of input.levels.levels) {
    check(regions.has(l.region_id),`${l.level_id}: missing region ${l.region_id}`)
    for(const id of l.boss_review_units??[])check(lessons.has(id),`${l.level_id}: missing unit ${id}`)
    if(l.unit_id)check(lessons.has(l.unit_id),`${l.level_id}: missing unit ${l.unit_id}`)
    unique(l.challenges.map(c=>c.challenge_id),l.level_id)
    check(l.challenges.some(c=>c.required_for_completion!==false),`${l.level_id}: no required challenge`)
    for (const c of l.challenges) {
      const label=`${l.level_id}/${c.challenge_id}`, config=c.config_overrides??{}
      check(GAME_ROUTES[c.game_mode as GameModeId],`${label}: unsupported game_mode ${c.game_mode}`)
      const refs=[...typeof config.unitId==='string'?[config.unitId]:[],...Array.isArray(config.unitPool)?config.unitPool:[]]
      for(const id of refs)check(lessons.has(String(id)),`${label}: missing unit ${id}`)
      if(Array.isArray(config.kanaPool)) { check(config.kanaPool.length>=2,`${label}: empty/single question group`); for(const symbol of config.kanaPool)check(symbols.has(String(symbol)),`${label}: missing item ${symbol}`) }
      if(Array.isArray(config.targetWords))for(const id of config.targetWords)check(words.has(String(id)),`${label}: missing item ${id}`)
      if(c.game_mode==='kana_catch_minimal_pair')for(const id of refs){ const unit=input.lessons.find(l=>l.unit_id===id); check(unit?.target_kana_pairs.some(p=>new Set(p).size>=2),`${label}: empty contrast group`) }
      if(config.roundLength!==undefined)check(Number.isInteger(config.roundLength)&&Number(config.roundLength)>0,`${label}: invalid roundLength`)
      skillRefs(c,label)
    }
  }
  unique((input.questions??[]).map(q=>q.id),'question')
  for(const q of input.questions??[]) {
    check(kana.has(q.itemId)||words.has(q.itemId),`${q.id}: missing item ${q.itemId}`)
    check(q.options.length>=2,`${q.id}: empty/single options`)
    unique(q.options.map(o=>o.id),q.id)
    check(q.options.filter(o=>o.correct).length===1,`${q.id}: expected exactly one correct answer`)
    skillRefs(q,q.id)
  }
  return errors
}
