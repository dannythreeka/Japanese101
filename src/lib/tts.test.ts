import { afterEach, beforeEach, it, expect, vi } from 'vitest'
vi.mock('./audio',()=>({duckBgm:vi.fn()}))
import { playSpeech, speakWithCallback, stopSpeaking } from './tts'
class FakeAudio {
  static instances: FakeAudio[]=[]
  onended: (()=>void)|null=null
  onerror: (()=>void)|null=null
  oncanplaythrough: (()=>void)|null=null
  pause=vi.fn(); load=vi.fn(); removeAttribute=vi.fn(); play=vi.fn().mockResolvedValue(undefined)
  src: string
  constructor(src: string){this.src=src;FakeAudio.instances.push(this)}
}
beforeEach(()=>{
  FakeAudio.instances=[];vi.stubGlobal('Audio',FakeAudio)
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel:vi.fn(),getVoices:()=>[]}})
})
afterEach(()=>{stopSpeaking();vi.unstubAllGlobals();vi.restoreAllMocks()})
it('keeps one speech and cancels old callbacks after replay or leaving',async()=>{
  const callback=vi.fn();speakWithCallback('あ',callback)
  const first=FakeAudio.instances[0], stale=first.onended
  const next=playSpeech('い');const second=FakeAudio.instances[1]
  expect(first.pause).toHaveBeenCalled();expect(first.onended).toBeNull()
  stale?.();second.onended?.();await next;await Promise.resolve()
  expect(callback).not.toHaveBeenCalled()
  const leaving=playSpeech('う');stopSpeaking()
  await expect(leaving).rejects.toMatchObject({name:'AbortError'})
})
it('reports missing/unsupported audio without a false completion and can retry',async()=>{
  const failure=playSpeech('あ');FakeAudio.instances[0].onerror?.()
  await expect(failure).rejects.toThrow('unavailable')
  const retry=playSpeech('あ');FakeAudio.instances[1].onended?.();await expect(retry).resolves.toBeUndefined()
})
it('starts in the user gesture and reports blocked autoplay',async()=>{
  const promise=playSpeech('あ');const audio=FakeAudio.instances[0]
  expect(audio.play).toHaveBeenCalledTimes(1)
  stopSpeaking();await expect(promise).rejects.toMatchObject({name:'AbortError'})
  // Each instance owns its play mock; make a blocking constructor for the next request.
  vi.stubGlobal('Audio',class extends FakeAudio {play=vi.fn().mockRejectedValue(new DOMException('blocked','NotAllowedError'))})
  await expect(playSpeech('あ')).rejects.toThrow('Tap play')
})
