import { Howl } from 'howler'

export type SfxKey = 'correct' | 'wrong' | 'star' | 'pop' | 'levelup' | 'tap' | 'combo'

const SFX_PATHS: Record<SfxKey, string> = {
  correct: '/sfx/correct.mp3',
  wrong: '/sfx/wrong.mp3',
  star: '/sfx/star.mp3',
  pop: '/sfx/pop.mp3',
  levelup: '/sfx/levelup.mp3',
  tap: '/sfx/tap.mp3',
  combo: '/sfx/combo.mp3',
}

const cache: Partial<Record<SfxKey, Howl>> = {}

function getHowl(key: SfxKey): Howl {
  if (cache[key]) return cache[key]!
  const h = new Howl({
    src: [SFX_PATHS[key]],
    volume: 0.7,
    preload: false,
    onloaderror: () => { /* silently skip missing sfx assets */ },
  })
  cache[key] = h
  return h
}

const _storedVol = parseFloat(localStorage.getItem('sfxVolume') ?? '1')
let globalVolume = isNaN(_storedVol) ? 1 : Math.max(0, Math.min(1, _storedVol))
let sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false'

export function playSfx(key: SfxKey): void {
  if (!sfxEnabled) return
  try {
    const h = getHowl(key)
    h.volume(globalVolume * 0.7)
    h.play()
  } catch {
    // silently ignore on unsupported platforms
  }
}

export function preloadSfx(keys: SfxKey[]): void {
  keys.forEach((k) => {
    const h = getHowl(k)
    h.load()
  })
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled
  localStorage.setItem('sfxEnabled', String(enabled))
  if (!enabled) Howler.stop()
}

export function setGlobalVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume))
  localStorage.setItem('sfxVolume', String(globalVolume))
  Howler.volume(globalVolume)
}

export function isSfxEnabled(): boolean {
  return sfxEnabled
}

export function getGlobalVolume(): number {
  return globalVolume
}

// ── BGM layer ──────────────────────────────────────────────────────────────

let bgmHowl: Howl | null = null
let bgmEnabled = true

export function playBgm(src: string, volume = 0.3): void {
  if (!bgmEnabled) return
  if (bgmHowl) {
    bgmHowl.stop()
    bgmHowl.unload()
  }
  bgmHowl = new Howl({
    src: [src],
    loop: true,
    volume: volume * globalVolume,
    html5: true,
    onloaderror: () => { bgmHowl = null },
  })
  bgmHowl.play()
}

export function stopBgm(): void {
  if (bgmHowl) {
    bgmHowl.stop()
    bgmHowl.unload()
    bgmHowl = null
  }
}

export function setBgmEnabled(enabled: boolean): void {
  bgmEnabled = enabled
  if (!enabled) stopBgm()
}

export function isBgmEnabled(): boolean {
  return bgmEnabled
}
