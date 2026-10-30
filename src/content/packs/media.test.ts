import {expect,it} from 'vitest'
import {availablePacks} from './registry'
import {unitAudio,unitArt} from './media'
import {unitIntroduction} from './introductions'
import worldArt from '../../../public/assets/img/journey/manifest.json'
it('every real curriculum pack exposes its own reviewed-source inventory and introduction',()=>{
  for(const pack of availablePacks.filter(p=>p.id.startsWith('U'))){
    const audio=unitAudio(pack.id)
    expect(audio?.version).toBe(pack.version)
    for(const clip of [...pack.listening,...pack.teaching]){
      if(!clip.audioSrc)continue
      const asset=audio?.assets.find(a=>a.src===clip.audioSrc)
      expect(asset,clip.id).toBeDefined()
      const script='script' in clip ? clip.script:clip.audioScript??pack.listening.find(l=>l.audioSrc===clip.audioSrc)?.script
      expect(script,`${clip.id} must have an authored source script`).toBeDefined()
      expect(asset?.script).toBe(script)
    }
    for(const q of pack.questions.filter(q=>q.image))expect([...worldArt.assets,...unitArt(pack.id)].some(a=>a.src===q.image!.src)).toBe(true)
    expect(unitIntroduction(pack.id,'zh')).not.toBe('')
    expect(unitIntroduction(pack.id,'ja')).not.toBe('')
  }
})
it('does not substitute U01 media or a classroom introduction for an unknown unit',()=>{
  expect(unitAudio('unknown')).toBeUndefined()
  expect(unitArt('unknown')).toEqual([])
  expect(unitIntroduction('unknown','zh')).toBe('')
})
