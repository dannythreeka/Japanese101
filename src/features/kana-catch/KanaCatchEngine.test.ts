// Engine pure-logic tests — now lives in questionGenerators.test.ts
// This file kept for backwards-compat test count; verifies re-exported helpers still work.
import { describe, it, expect } from 'vitest'
import { buildPool, buildParams } from './questionGenerators'
import type { Kana } from '../../types'

function makeKana(id: string, type: Kana['type'] = 'seion', difficulty: 1 | 2 | 3 = 1): Kana {
  return { id, hiragana: id, katakana: id, romaji: id, row: 'test', type, difficulty }
}
const SEION = ['a','i','u','e','o','ka','ki','ku'].map(id => makeKana(id))
const ALL = [...SEION, ...['ga','gi'].map(id => makeKana(id, 'dakuon', 2))]

describe('buildPool (smoke)', () => {
  it('returns non-empty array for all valid input combinations', () => {
    const modes: Array<Kana['type'] extends never ? never : Parameters<typeof buildPool>[1]> =
      ['young', 'advanced']
    const diffs: Parameters<typeof buildPool>[2][] = [1, 2, 3, 'all']
    for (const m of modes) {
      for (const d of diffs) {
        const p = buildPool(ALL, m, d)
        expect(p.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('buildParams (smoke)', () => {
  it('young and advanced return different speeds', () => {
    expect(buildParams('young').fallSpeed).toBeLessThan(buildParams('advanced').fallSpeed)
  })
  it('roundLength is 10 for both modes', () => {
    expect(buildParams('young').roundLength).toBe(10)
    expect(buildParams('advanced').roundLength).toBe(10)
  })
})

import { afterEach, vi } from 'vitest'
import { KanaCatchEngine } from './KanaCatchEngine'
vi.mock('../../lib/tts', () => ({ playSpeech: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }))

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })

function engineHarness(roundLength = 5, empty = false) {
  vi.useFakeTimers()
  let frame: FrameRequestCallback | undefined
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frame = cb; return 1 })
  vi.stubGlobal('cancelAnimationFrame', () => { frame = undefined })
  let position = [0, 0]
  const stack: number[][] = []
  const glyphs = new Map<string, number[]>()
  const ctx = {
    clearRect() {}, save() { stack.push([...position]) }, restore() { position = stack.pop() ?? [0, 0] },
    translate(x: number, y: number) { position = [x, y] }, scale() {},
    createRadialGradient() { return { addColorStop() {} } }, beginPath() {}, arc() {}, fill() {}, stroke() {},
    fillText(text: string) { glyphs.set(text, [...position]) },
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  const canvas = document.createElement('canvas')
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 360, bottom: 380, width: 360, height: 380, toJSON() {} })
  const onComplete = vi.fn(), onMiss = vi.fn(), onError = vi.fn(), onAnswer = vi.fn()
  const engine = new KanaCatchEngine(canvas, { fallSpeed: 1000, showRomaji: false, requireAudio: false, roundLength }, {
    nextQuestion: () => ({ items: empty ? [] : [{ id: 'a', display: 'あ' }, { id: 'i', display: 'い' }], targetId: 'a', ttsText: 'あ' }),
    onNewQuestion() {}, onCorrect() {}, onMiss, onComplete, onError, onAnswer,
    onPauseAfterCorrect(_q, resume) { resume() },
  })
  let time = performance.now()
  function tap(text: string) {
    const point = glyphs.get(text)!
    canvas.dispatchEvent(new MouseEvent('pointerdown', { clientX: point[0], clientY: point[1] }))
  }
  function draw() { for (let n = 0; n < 3; n++) { time += 100; frame?.(time) } }
  engine.start()
  return { engine, draw, tap, onComplete, onMiss, onError, onAnswer }
}

it('real pointer events record two first errors, finish at 60%, and ignore repeated completion taps', async () => {
  const h = engineHarness()
  for (let n = 0; n < 5; n++) {
    h.draw()
    if (n >= 3) { h.tap('い'); await Promise.resolve(); await Promise.resolve() }
    for (let repeat = 0; repeat < 10; repeat++) h.tap('あ')
    await vi.advanceTimersByTimeAsync(600)
  }
  expect(h.onMiss).toHaveBeenCalledTimes(2)
  expect(h.onComplete).toHaveBeenCalledExactlyOnceWith(3, 5)
  h.engine.destroy()
})

it('handles an empty pool without crashing and cancels completion on destroy', () => {
  const empty = engineHarness(1, true)
  expect(empty.onError).toHaveBeenCalledOnce()
  empty.engine.destroy()
  const h = engineHarness(1)
  h.draw(); h.tap('あ'); h.engine.destroy()
  vi.advanceTimersByTime(1000)
  expect(h.onComplete).not.toHaveBeenCalled()
})
