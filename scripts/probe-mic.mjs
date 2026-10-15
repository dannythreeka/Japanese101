// Baseline diagnostic, not a passing regression test or a real microphone check.
import { createMicSession, DEFAULT_CONFIG } from '../src/lib/mic.ts'
import { writeFileSync } from 'node:fs'
const observed = { mode: 'offline', target: 'ねこ', constructed: 0, started: 0, stopped: 0, trackStopped: 0 }
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop: () => observed.trackStopped++ }] }) } } })
globalThis.window = { SpeechRecognition: class {
  constructor() { observed.constructed++ }
  start() { observed.started++ }
  stop() { observed.stopped++ }
} }
globalThis.AudioContext = class {
  createMediaStreamSource() { return { connect() {} } }
  createAnalyser() { return { fftSize: 512, getByteTimeDomainData() {} } }
  async close() {}
}
globalThis.requestAnimationFrame = () => 1
globalThis.cancelAnimationFrame = () => {}
const session = await createMicSession(DEFAULT_CONFIG, 'offline', 'ねこ')
session.stop()
writeFileSync('docs/verification/evidence/P0/F04-mic-spy.json', JSON.stringify({ method: 'source module with mocked APIs; no actual device or cloud speech service', expectedAfterP1: { constructed: 0, started: 0 }, observed }, null, 2) + '\n')
console.log(JSON.stringify(observed))
