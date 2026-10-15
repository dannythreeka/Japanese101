import { describe, it, expect } from 'vitest'
import { calcRms, determineOutcome, DEFAULT_CONFIG, EASY_CONFIG } from './mic'

describe('calcRms', () => {
  it('returns ~0 for flat silence (all 128)', () => {
    const data = new Uint8Array(512).fill(128)
    expect(calcRms(data)).toBeCloseTo(0)
  })

  it('returns > 0 for a square wave (64 / 192 alternating)', () => {
    const data = new Uint8Array(512)
    for (let i = 0; i < 512; i++) data[i] = i % 2 === 0 ? 192 : 64
    expect(calcRms(data)).toBeGreaterThan(0)
  })

  it('stays ≤ 1 for max amplitude (all 255)', () => {
    const data = new Uint8Array(512).fill(255)
    expect(calcRms(data)).toBeLessThanOrEqual(1)
  })

  it('returns a higher value for louder signal', () => {
    const soft = new Uint8Array(512)
    const loud = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      soft[i] = i % 2 === 0 ? 140 : 116  // small swing around 128
      loud[i] = i % 2 === 0 ? 200 : 56   // large swing
    }
    expect(calcRms(loud)).toBeGreaterThan(calcRms(soft))
  })
})

describe('determineOutcome', () => {
  it('returns silent for < 50 ms voiced', () => {
    expect(determineOutcome(10, DEFAULT_CONFIG, false)).toBe('silent')
    expect(determineOutcome(49, DEFAULT_CONFIG, false)).toBe('silent')
  })

  it('returns weak when voiced but below minVoicedDurationMs', () => {
    expect(determineOutcome(100, DEFAULT_CONFIG, false)).toBe('weak')
    expect(determineOutcome(299, DEFAULT_CONFIG, false)).toBe('weak')
  })

  it('returns good when voiced sufficiently without speech match', () => {
    expect(determineOutcome(300, DEFAULT_CONFIG, false)).toBe('good')
    expect(determineOutcome(2000, DEFAULT_CONFIG, false)).toBe('good')
  })

  it('returns perfect when speechMatch is true', () => {
    expect(determineOutcome(300, DEFAULT_CONFIG, true)).toBe('perfect')
    expect(determineOutcome(2000, DEFAULT_CONFIG, true)).toBe('perfect')
  })

  it('EASY_CONFIG has lower threshold so 200 ms is good', () => {
    expect(determineOutcome(200, EASY_CONFIG, false)).toBe('good')
    expect(determineOutcome(200, DEFAULT_CONFIG, false)).toBe('weak')
  })
})

import { afterEach, vi } from 'vitest'
import { createMicSession } from './mic'
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

function mockMic() {
  const track = { stop: vi.fn(), addEventListener: vi.fn() }
  const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [track] })
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  const close = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('AudioContext', class { createMediaStreamSource() { return { connect() {} } } createAnalyser() { return { fftSize: 512, getByteTimeDomainData() {} } } close = close })
  vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  const start = vi.fn(), stop = vi.fn(), construct = vi.fn()
  const SR = class { constructor() { construct() } start = start; stop = stop }
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SR })
  return { track, getUserMedia, close, start, stop, construct }
}

it('off and enhanced without parent consent never request a microphone', async () => {
  const mock = mockMic()
  await expect(createMicSession(DEFAULT_CONFIG, 'off', 'ねこ')).rejects.toMatchObject({ name: 'NotAllowedError' })
  await expect(createMicSession(DEFAULT_CONFIG, 'enhanced', 'ねこ')).rejects.toMatchObject({ name: 'NotAllowedError' })
  expect(mock.getUserMedia).not.toHaveBeenCalled()
})
it('offline never constructs SR; enhanced stops SR, audio context and tracks exactly once', async () => {
  const mock = mockMic()
  const offline = await createMicSession(DEFAULT_CONFIG, 'offline', 'ねこ')
  offline.stop(); offline.stop()
  expect(mock.construct).not.toHaveBeenCalled()
  expect(mock.track.stop).toHaveBeenCalledTimes(1)
  const enhanced = await createMicSession(DEFAULT_CONFIG, 'enhanced', 'ねこ', { enhancedConsent: true })
  enhanced.stop(); enhanced.stop()
  expect(mock.construct).toHaveBeenCalledTimes(1); expect(mock.start).toHaveBeenCalledTimes(1); expect(mock.stop).toHaveBeenCalledTimes(1)
})
it('releases a stream whose permission request resolves after unmount', async () => {
  const mock = mockMic(); const controller = new AbortController()
  const pending = createMicSession(DEFAULT_CONFIG, 'offline', 'ねこ', { signal: controller.signal })
  controller.abort()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  expect(mock.track.stop).toHaveBeenCalledTimes(1)
})

it('enhanced does not silently fall back when recognition is unsupported or start fails',async()=>{
  const mock=mockMic()
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:undefined})
  await expect(createMicSession(DEFAULT_CONFIG,'enhanced','ねこ',{enhancedConsent:true})).rejects.toMatchObject({name:'NotSupportedError'})
  expect(mock.getUserMedia).not.toHaveBeenCalled()
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:class {start(){throw new DOMException('revoked','NotAllowedError')}stop(){}}})
  await expect(createMicSession(DEFAULT_CONFIG,'enhanced','ねこ',{enhancedConsent:true})).rejects.toMatchObject({name:'NotAllowedError'})
  expect(mock.track.stop).toHaveBeenCalledOnce()
})
