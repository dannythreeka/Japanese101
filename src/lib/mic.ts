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

/** Pure: map voiced duration + optional ASR result to an outcome */
export function determineOutcome(
  voicedMs: number,
  config: MicVolumeConfig,
  speechMatch: boolean,
): MicOutcome {
  if (voicedMs < 50) return 'silent'
  if (voicedMs < config.minVoicedDurationMs) return 'weak'
  if (speechMatch) return 'perfect'
  return 'good'
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
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
  micMode: Exclude<MicMode, 'off'>,
  speechTarget?: string,
): Promise<MicSession> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  source.connect(analyser)

  const buf = new Uint8Array(analyser.fftSize)
  let voicedMs = 0
  let lastTs = performance.now()
  let rafId: number | null = null
  let speechMatch = false
  let stopped = false
  let currentRms = 0

  if (micMode === 'enhanced' && speechTarget) {
    const SR = getSpeechRecognitionCtor()
    if (SR) {
      const rec = new SR()
      rec.lang = 'ja-JP'
      rec.continuous = false
      rec.interimResults = true
      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
        if (transcript.includes(speechTarget)) speechMatch = true
      }
      try { rec.start() } catch { /* permission may already be in use */ }
    }
  }

  const tick = (ts: number) => {
    if (stopped) return
    const dt = ts - lastTs
    lastTs = ts
    analyser.getByteTimeDomainData(buf)
    currentRms = calcRms(buf)
    if (currentRms > config.rmsThreshold) voicedMs += dt
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  return {
    stop(): MicSessionResult {
      if (stopped) return { outcome: determineOutcome(voicedMs, config, speechMatch), voicedMs }
      stopped = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      stream.getTracks().forEach(t => t.stop())
      void ctx.close()
      return { outcome: determineOutcome(voicedMs, config, speechMatch), voicedMs }
    },
    getRms(): number { return stopped ? 0 : currentRms },
  }
}
