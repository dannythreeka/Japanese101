import raw from '../../data/kana.json'
import type { Question, UnitPack } from '../contracts'

export type KanaScript = 'hiragana' | 'katakana'
const basic = raw.kana.filter(k => k.type === 'seion')
const soundKey = (id: string) => id === 'wo' ? 'o' : id

/** Script-specific skills and evidence; shared recordings do not imply shared mastery. */
export function kanaPack(script: KanaScript): UnitPack {
  const unitId = script === 'hiragana' ? 'KANA-HIRA' : 'KANA-KATA'
  const label = script === 'hiragana' ? '平假名' : '片假名'
  const skill = (id: string) => `${unitId}:${id}`
  const questions: Question[] = basic.flatMap((kana, index) => {
    // を/お share a sound in modern usage and must never be competing audio answers.
    const others = basic.filter(k => soundKey(k.id) !== soundKey(kana.id))
    const distractors = [0, 1, 2].map(n => others[(index + n * 11) % others.length])
    const options = [kana, ...distractors]
    const choices = options.map(k => ({id:k.id, text:k[script]}))
    const rotated = [...choices.slice(index % 4), ...choices.slice(0, index % 4)]
    return (['practice'] as const).map(partition => ({
      id:`${unitId}:${partition}:${kana.id}`, version:'1', unitId,
      itemId:`${unitId}:${partition}:${kana.id}`, itemFamilyId:`${unitId}:sound-glyph:${kana.id}`,
      primarySkillId:skill(kana.id), skillIds:[skill(kana.id)], teachingIds:[`${unitId}:teach:${kana.id}`],
      partition, kind:'audio', prompt:`聽聲音，選出對應的${label}。`, promptJa:'おとをきいて、かなをえらびましょう。',
      audioSrc:`/assets/audio/kana_${kana.id}.wav`, choices:rotated, answer:[kana.id],
      explanation:`這個聲音對應「${kana[script]}」。回到教學卡可以再次比較字形與讀音。`,
      explanationJa:`このおとのかなは「${kana[script]}」です。`,
      distractorReasons:Object.fromEntries(distractors.map(k => [k.id, `「${k[script]}」是另一個字音，請重聽後比較。`])),
      hint:`看看教學卡中的「${kana[script]}」。`, hintJa:`「${kana[script]}」のカードをみましょう。`,
      hintPolicy:'practice-only', audioPolicy:'required',
      source:'Existing Japanese101 basic kana inventory and local recordings; P3 review pending', reviewStatus:'DRAFT',
    }))
  })
  return {
    id:unitId, version:'kana-1-draft', title:`${label}入門`, reviewStatus:'DRAFT', reviewer:null, reviewedAt:null,
    vocabulary:[], kanji:[], grammar:[], readings:[], listening:[],
    teaching:basic.map(k => ({
      id:`${unitId}:teach:${k.id}`, skillIds:[skill(k.id)], title:k[script], titleJa:k[script],
      body:`這是${label}「${k[script]}」。先聽讀音，再觀察字形。羅馬字 ${k.romaji} 只作教學輔助。`,
      bodyJa:`「${k[script]}」のおとをきいて、かたちをみましょう。ローマじ：${k.romaji}。`,
      example:k[script], translation:k.romaji, translationJa:k.romaji, audioSrc:`/assets/audio/kana_${k.id}.wav`,
    })), questions,
  }
}
export const hiraganaPack = kanaPack('hiragana')
export const katakanaPack = kanaPack('katakana')
