const JAPANESE_VOICE_KEYWORDS = ['japanese', 'japan', 'ja-jp', 'ja_jp', 'kyoko', 'otoya']

let cachedVoice: SpeechSynthesisVoice | null = null
let voiceLoaded = false

function findJapaneseVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  // prefer a voice explicitly labelled Japanese
  const match = voices.find(v =>
    JAPANESE_VOICE_KEYWORDS.some(kw => v.lang.toLowerCase().includes(kw) || v.name.toLowerCase().includes(kw))
  )
  return match ?? voices.find(v => v.lang.startsWith('ja')) ?? null
}

export function loadVoices(): Promise<void> {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return }
    if (voiceLoaded) { resolve(); return }
    // voices may already be loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      cachedVoice = findJapaneseVoice()
      voiceLoaded = true
      resolve()
      return
    }
    // wait for voiceschanged event (required in Chrome)
    const handler = () => {
      cachedVoice = findJapaneseVoice()
      voiceLoaded = true
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve()
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    // fallback timeout in case event never fires
    setTimeout(() => { voiceLoaded = true; resolve() }, 2000)
  })
}

export function speak(text: string, rate = 0.85): void {
  if (!window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'ja-JP'
    utt.rate = rate
    utt.pitch = 1.1
    if (cachedVoice) utt.voice = cachedVoice
    window.speechSynthesis.speak(utt)
  } catch {
    // silently fail — child should not see TTS errors
  }
}

export function speakWithCallback(text: string, onEnd: () => void, rate = 0.85): void {
  if (!window.speechSynthesis) { onEnd(); return }
  try {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'ja-JP'
    utt.rate = rate
    utt.pitch = 1.1
    if (cachedVoice) utt.voice = cachedVoice
    utt.onend = onEnd
    utt.onerror = onEnd
    window.speechSynthesis.speak(utt)
  } catch {
    onEnd()
  }
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
