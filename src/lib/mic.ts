import type { MicMode } from '../types'

export type MicOutcome = 'silent' | 'weak' | 'good' | 'perfect'

export interface MicVolumeConfig {
  rmsThreshold: number
  minVoicedDurationMs: number
  maxRecordDurationMs: number
}

export const DEFAULT_CONFIG: MicVolumeConfig = {
  rmsThreshold: 0.02,
  minVoicedDurationMs: 300,
  maxRecordDurationMs: 4000,
}

export const EASY_CONFIG: MicVolumeConfig = {
  rmsThreshold: 0.01,
  minVoicedDurationMs: 150,
  maxRecordDurationMs: 4000,
}

export interface MicSessionResult {
  outcome: MicOutcome
  voicedMs: number
}

export interface MicSession {
  stop(): MicSessionResult
  getRms(): number
}

/** Pure: convert Uint8Array (getByteTimeDomainData, 0-255) to 0-1 RMS */
export function calcRms(data: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    const norm = (data[i] - 128) / 128
    sum += norm * norm
  }
  return Math.sqrt(sum / data.length)
}

/** Pure: map voiced duration + optional ASR result to an outcome.
 *  When srWasUsed=true, a word match is required for 'good'/'perfect'. */
export function determineOutcome(
  voicedMs: number,
  config: MicVolumeConfig,
  speechMatch: boolean,
  srWasUsed = false,
): MicOutcome {
  if (voicedMs < 50) return 'silent'
  if (voicedMs < config.minVoicedDurationMs) return 'weak'
  if (speechMatch) return 'perfect'
  if (srWasUsed) return 'weak'  // voice loud enough but wrong word
  return 'good'  // no SR available → volume-based pass
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror?: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

/**
 * Request mic permission. Must be called from parent-side UI only.
 * Returns true if permission granted.
 */
export async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    stream.getTracks().forEach(t => t.stop())
    return true
  } catch {
    return false
  }
}

/**
 * Open a mic session that accumulates voiced duration until stop() is called.
 * The caller is responsible for calling stop() — e.g. on button release or after a timeout.
 */
export async function createMicSession(
  config: MicVolumeConfig,
  micMode: MicMode,
  speechTarget?: string,
  options: { enhancedConsent?: boolean; signal?: AbortSignal; onError?: () => void } = {},
): Promise<MicSession> {
  if (micMode === 'off') throw new DOMException('Microphone is off', 'NotAllowedError')
  if (micMode === 'enhanced' && !options.enhancedConsent) throw new DOMException('Parent consent required', 'NotAllowedError')
  if (options.signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
  const Recognition = micMode === 'enhanced' ? getSpeechRecognitionCtor() : undefined
  if (micMode === 'enhanced' && !Recognition) throw new DOMException('Speech recognition unsupported', 'NotSupportedError')
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  let ctx: AudioContext | null = null
  let rec: SpeechRecognitionLike | null = null
  let rafId: number | null = null
  let voicedMs = 0
  let currentRms = 0
  let speechMatch = false
  let srWasUsed = false
  let stopped = false
  const stop = (): MicSessionResult => {
    if (!stopped) {
      stopped = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (rec) { rec.onresult = null; rec.onerror = null; try { rec.stop() } catch { /* already stopped */ } }
      stream.getTracks().forEach(track => track.stop())
      if (ctx) void ctx.close().catch(() => {})
      options.signal?.removeEventListener('abort', stop)
    }
    return { outcome: determineOutcome(voicedMs, config, speechMatch, srWasUsed), voicedMs }
  }
  try {
    if (options.signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    const buf = new Uint8Array(analyser.fftSize)
    // Offline deliberately never even looks up or constructs SpeechRecognition.
    if (micMode === 'enhanced' && speechTarget) {
      const SR = Recognition
      if (SR) {
        rec = new SR()
        rec.lang = 'ja-JP'; rec.continuous = false; rec.interimResults = true
        rec.onresult = (event) => { if (!stopped) speechMatch = Array.from(event.results).map(r => r[0].transcript).join('').includes(speechTarget) }
        rec.onerror = () => { if (!stopped) { stop(); options.onError?.() } }
        rec.start(); srWasUsed = true
      }
    }
    let lastTs = performance.now()
    const tick = (ts: number) => {
      if (stopped) return
      const dt = ts - lastTs; lastTs = ts
      analyser.getByteTimeDomainData(buf)
      currentRms = calcRms(buf)
      if (currentRms > config.rmsThreshold) voicedMs += dt
      rafId = requestAnimationFrame(tick)
    }
    options.signal?.addEventListener('abort', stop, { once: true })
    stream.getTracks().forEach(track => track.addEventListener?.('ended', () => { if (!stopped) { stop(); options.onError?.() } }, { once: true }))
    rafId = requestAnimationFrame(tick)
    return { stop, getRms: () => stopped ? 0 : currentRms }
  } catch (error) {
    stop()
    throw error
  }
}
