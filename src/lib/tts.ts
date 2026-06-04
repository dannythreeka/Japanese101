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

export function speak(text: string, rate = 0.85): void {
  if (!window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(buildUtterance(text, rate))
  } catch { /* silently fail */ }
}

export function speakWithCallback(text: string, onEnd: () => void, rate = 0.85): void {
  if (!window.speechSynthesis) { onEnd(); return }
  try {
    window.speechSynthesis.cancel()
    const utt = buildUtterance(text, rate)
    utt.onend = onEnd
    utt.onerror = onEnd
    window.speechSynthesis.speak(utt)
  } catch { onEnd() }
}

// Prefer a pre-generated audio file at /assets/audio/<id>.wav; fall back to TTS.
// id = kana_<kana.id>  or  word_<vocab.id>
const audioCache: Record<string, HTMLAudioElement> = {}

export function speakById(text: string, id: string, rate = 0.85): void {
  const path = `/assets/audio/${id}.wav`
  if (audioCache[id]) {
    audioCache[id].play().catch(() => speak(text, rate))
    return
  }
  const audio = new Audio(path)
  audio.addEventListener('error', () => speak(text, rate), { once: true })
  audio.addEventListener('canplaythrough', () => {
    audioCache[id] = audio
    audio.play().catch(() => speak(text, rate))
  }, { once: true })
  audio.load()
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
