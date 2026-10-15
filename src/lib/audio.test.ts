import { afterEach, beforeEach, it, expect, vi } from 'vitest'
import { playBgm, playSfx, setGlobalVolume, setSfxEnabled, stopGameAudio, duckBgm } from './audio'
class Sound {
  static instances:Sound[]=[]
  volume=1;currentTime=0;loop=false;preload='';src=''
  pause=vi.fn();play=vi.fn().mockResolvedValue(undefined);load=vi.fn();removeAttribute=vi.fn()
  constructor(src:string){this.src=src;Sound.instances.push(this)}
}
beforeEach(()=>{Sound.instances=[];vi.stubGlobal('Audio',Sound);setSfxEnabled(true);setGlobalVolume(1)})
afterEach(()=>{stopGameAudio();vi.unstubAllGlobals()})
it('settings hydration creates no audio resources; leaving releases every effect and BGM',()=>{
  expect(Sound.instances).toHaveLength(0)
  playSfx('correct');playSfx('correct');playBgm('/bg.mp3',.2)
  expect(Sound.instances).toHaveLength(2)
  duckBgm(true);expect(Sound.instances[1].volume).toBe(.05)
  duckBgm(false);expect(Sound.instances[1].volume).toBe(.2)
  stopGameAudio()
  for(const sound of Sound.instances){expect(sound.pause).toHaveBeenCalled();expect(sound.removeAttribute).toHaveBeenCalledWith('src')}
  playSfx('correct');expect(Sound.instances).toHaveLength(3)
})
