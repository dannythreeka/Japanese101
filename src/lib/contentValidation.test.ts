import { describe, it, expect } from 'vitest'
import { validateContent, type ContentInput } from './contentValidation'
import { kanaData, vocabData, lessonData, levelsData } from '../data/loaders'
import { SCENE_REGISTRY } from '../features/kotodama/scenes'
const valid=():ContentInput=>({kana:structuredClone(kanaData()),words:structuredClone(vocabData()),lessons:structuredClone(lessonData()),levels:structuredClone(levelsData()),assets:new Set([...kanaData().map(k=>`assets/audio/kana_${k.id}.wav`),...vocabData().flatMap(w=>[w.audio.src.slice(1),w.image.src.slice(1)])]),scenes:new Set(Object.keys(SCENE_REGISTRY)),skills:new Set(['S01']),questions:[{id:'q1',itemId:'a',skillIds:['S01'],options:[{id:'a',correct:true},{id:'i',correct:false}]}]})
describe('relation validator rejects malformed fixtures',()=>{
  it('accepts the current supported content',()=>expect(validateContent(valid())).toEqual([]))
  it.each(['unit','item','skill','scene','duplicate','noAnswer','twoAnswers','emptyGroup','missingImage','missingAudio','unknownMode'])("rejects %s",kind=>{
    const data=valid()
    switch(kind){
      case 'unit':data.levels.levels[1].unit_id='missing';break
      case 'item':data.lessons[0].concept_words[0].id='missing';break
      case 'skill':data.questions![0].skillIds=['missing'];break
      case 'scene':data.scenes.clear();break
      case 'duplicate':data.words.push(data.words[0]);break
      case 'noAnswer':data.questions![0].options[0].correct=false;break
      case 'twoAnswers':data.questions![0].options[1].correct=true;break
      case 'emptyGroup':data.lessons[0].target_kana_pairs=[[]];break
      case 'missingImage':data.words[0].image.src='';break
      case 'missingAudio':data.assets.delete('assets/audio/kana_a.wav');break
      case 'unknownMode':Object.assign(data.levels.levels[0].challenges[0],{game_mode:'unknown'});break
    }
    expect(validateContent(data).length).toBeGreaterThan(0)
  })
})
