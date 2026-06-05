import { kanaData, vocabData } from '../data/loaders'

// Natural voice priority: Kyoko (macOS/iOS female) > Otoya (macOS male) >
// Haruka/Hayashi/Sayaka (Windows) > any ja-JP > any ja
const VOICE_PRIORITY = ['Kyoko', 'Otoya', 'Haruka', 'Hayashi', 'Sayaka']

let cachedVoice: SpeechSynthesisVoice | null = null
let voiceLoaded = false

function findJapaneseVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  for (const name of VOICE_PRIORITY) {
    const v = voices.find(v => v.name === name)
    if (v) return v
  }
  return voices.find(v => v.lang === 'ja-JP') ?? voices.find(v => v.lang.startsWith('ja')) ?? null
}

export function loadVoices(): Promise<void> {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return }
    if (voiceLoaded) { resolve(); return }
    if (window.speechSynthesis.getVoices().length > 0) {
      cachedVoice = findJapaneseVoice()
      voiceLoaded = true
      resolve()
      return
    }
    const handler = () => {
      cachedVoice = findJapaneseVoice()
      voiceLoaded = true
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve()
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => { voiceLoaded = true; resolve() }, 2000)
  })
}

function buildUtterance(text: string, rate: number): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'ja-JP'
  utt.rate = rate
  utt.pitch = 1.1
  if (cachedVoice) utt.voice = cachedVoice
  return utt
}

// ── VOICEVOX audio map ────────────────────────────────────────────────────────

const PHRASE_MAP: Record<string, string> = {
  'やった！':     'phrase_yatta',
  'もういちど！': 'phrase_mouichido',
  'すごい！':     'phrase_sugoi',
  'いいね！':     'phrase_niceone',
  'がんばれ！':   'phrase_gambare',
}

let audioMap: Map<string, string> | null = null

function getAudioMap(): Map<string, string> {
  if (audioMap) return audioMap
  audioMap = new Map()
  for (const [text, id] of Object.entries(PHRASE_MAP)) audioMap.set(text, id)
  for (const k of kanaData()) audioMap.set(k.hiragana, `kana_${k.id}`)
  for (const w of vocabData()) audioMap.set(w.kana, `word_${w.id}`)
  return audioMap
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const audioCache: Record<string, HTMLAudioElement> = {}

function speakWS(text: string, rate: number, onEnd?: () => void): void {
  if (!window.speechSynthesis) { onEnd?.(); return }
  try {
    window.speechSynthesis.cancel()
    const utt = buildUtterance(text, rate)
    if (onEnd) { utt.onend = onEnd; utt.onerror = onEnd }
    window.speechSynthesis.speak(utt)
  } catch { onEnd?.() }
}

function playAudio(id: string, text: string, rate: number, onEnd?: () => void): void {
  const fallback = () => speakWS(text, rate, onEnd)

  if (audioCache[id]) {
    const el = audioCache[id]
    el.currentTime = 0
    if (onEnd) {
      el.addEventListener('ended', onEnd, { once: true })
      el.play().catch(() => { el.removeEventListener('ended', onEnd); fallback() })
    } else {
      el.play().catch(fallback)
    }
    return
  }

  const path = `/assets/audio/${id}.wav`
  const el = new Audio(path)
  el.addEventListener('error', fallback, { once: true })
  el.addEventListener('canplaythrough', () => {
    audioCache[id] = el
    if (onEnd) {
      el.addEventListener('ended', onEnd, { once: true })
      el.play().catch(() => { el.removeEventListener('ended', onEnd); fallback() })
    } else {
      el.play().catch(fallback)
    }
  }, { once: true })
  el.load()
}

// ── Public API ────────────────────────────────────────────────────────────────

export function speak(text: string, rate = 0.85): void {
  if (typeof window === 'undefined') return
  const id = getAudioMap().get(text)
  if (id) { playAudio(id, text, rate); return }
  speakWS(text, rate)
}

export function speakWithCallback(text: string, onEnd: () => void, rate = 0.85): void {
  if (typeof window === 'undefined') { onEnd(); return }
  const id = getAudioMap().get(text)
  if (id) { playAudio(id, text, rate, onEnd); return }
  speakWS(text, rate, onEnd)
}

// Prefer a pre-generated audio file at /assets/audio/<id>.wav; fall back to TTS.
// id = kana_<kana.id>  or  word_<vocab.id>
export function speakById(text: string, id: string, rate = 0.85): void {
  playAudio(id, text, rate)
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
