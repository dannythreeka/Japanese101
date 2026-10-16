import { kanaData, vocabData } from '../data/loaders'
import { duckBgm } from './audio'

const VOICE_PRIORITY = ['Kyoko', 'Otoya', 'Haruka', 'Hayashi', 'Sayaka']
function japaneseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? []
  return VOICE_PRIORITY.map(name=>voices.find(v=>v.name===name)).find(Boolean) ?? voices.find(v=>v.lang.startsWith('ja'))
}
export function loadVoices(): Promise<void> {
  if (!window.speechSynthesis || window.speechSynthesis.getVoices().length) return Promise.resolve()
  return new Promise(resolve=>{
    const done=()=>{clearTimeout(timer);window.speechSynthesis.removeEventListener('voiceschanged',done);resolve()}
    const timer=setTimeout(done,2000)
    window.speechSynthesis.addEventListener('voiceschanged',done,{once:true})
  })
}
const audioMap = new Map<string,string>([
  ...kanaData().map(k=>[k.hiragana,`kana_${k.id}`] as [string,string]),
  ...vocabData().map(w=>[w.kana,`word_${w.id}`] as [string,string]),
  ['やった！','phrase_yatta'],['もういちど！','phrase_mouichido'],['すごい！','phrase_sugoi'],['いいね！','phrase_niceone'],['がんばれ！','phrase_gambare'],
])
let cancelCurrent: (()=>void) | null=null
let generation=0
export function stopSpeaking(): void {
  generation++
  const cancel=cancelCurrent;cancelCurrent=null;cancel?.()
  window.speechSynthesis?.cancel()
  duckBgm(false)
}

/** Resolves only after successful playback; cancellation never runs a stale completion callback. */
export function playSpeech(text: string, rate=.85, explicitId?: string): Promise<void> {
  stopSpeaking()
  const token=generation
  duckBgm(true)
  return new Promise((resolve,reject)=>{
    let finished=false
    let audio: HTMLAudioElement | null=null
    let utterance: SpeechSynthesisUtterance | null=null
    const timer=setTimeout(()=>done(new Error('Audio playback timed out')),12000)
    const cleanup=()=>{
      clearTimeout(timer)
      if(audio){audio.onended=null;audio.onerror=null;audio.oncanplaythrough=null;audio.pause();audio.removeAttribute('src');audio.load()}
      if(utterance){utterance.onend=null;utterance.onerror=null}
    }
    const done=(error?: Error)=>{
      if(finished)return
      finished=true;cleanup()
      if(token===generation){cancelCurrent=null;duckBgm(false)}
      if(error)reject(error);else resolve()
    }
    cancelCurrent=()=>done(new DOMException('Playback cancelled','AbortError'))
    const fallback=()=>{
      if(finished || token!==generation)return
      if(audio){audio.onended=null;audio.onerror=null;audio.pause()}
      const voice=japaneseVoice()
      if(!window.speechSynthesis || !voice){done(new Error('Japanese audio is unavailable'));return}
      utterance=new SpeechSynthesisUtterance(text);utterance.lang='ja-JP';utterance.rate=rate;utterance.voice=voice
      utterance.onend=()=>done();utterance.onerror=()=>done(new Error('Speech playback failed'))
      try{window.speechSynthesis.speak(utterance)}catch{done(new Error('Speech playback failed'))}
    }
    const id=explicitId ?? audioMap.get(text)
    if(!id){fallback();return}
    audio=new Audio(`${import.meta.env.BASE_URL}assets/audio/${id}.wav`)
    audio.onended=()=>done();audio.onerror=fallback
    try {
      void audio.play().catch((error: unknown)=>{
        if (finished || token !== generation) return
        if(error instanceof DOMException && error.name==='NotAllowedError')done(new Error('Tap play to enable audio'))
        else fallback()
      })
    } catch { fallback() }
  })
}
function reportFailure(error: unknown): void {
  if(error instanceof DOMException && error.name==='AbortError')return
  window.dispatchEvent(new CustomEvent('speechfailure'))
}
export function speak(text: string, rate=.85): void { void playSpeech(text,rate).catch(reportFailure) }
export function speakWithCallback(text: string, onEnd: ()=>void, rate=.85): void { void playSpeech(text,rate).then(onEnd).catch(reportFailure) }
export function speakById(text: string,id: string,rate=.85): void {void playSpeech(text,rate,id).catch(reportFailure)}
export function isTTSAvailable(): boolean {return !!window.speechSynthesis}
