import type { Kana, AgeMode, KanaDifficulty } from '../../types'
import { speak } from '../../lib/tts'

export const CANVAS_W = 360
export const CANVAS_H = 380

const BUBBLE_R = 46
const BURST_MS = 450

export interface EngineCallbacks {
  onCorrect(kanaId: string): void
  onMiss(kanaId: string): void
  onComplete(correct: number, total: number): void
  onTargetChange(target: Kana): void
}

export interface EngineParams {
  pool: Kana[]
  fallSpeed: number
  maxBubbles: number
  showRomaji: boolean
  roundLength: number
}

type BState = 'falling' | 'burst' | 'gone'

interface Bubble {
  kana: Kana
  isCorrect: boolean
  x: number
  y: number
  vy: number
  state: BState
  animT: number
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pure helpers — exported for unit tests
export function pickQuestion(
  pool: Kana[],
  maxBubbles: number,
): { correct: Kana; choices: Kana[] } {
  const correct = pool[Math.floor(Math.random() * pool.length)]
  const count = Math.min(maxBubbles - 1, pool.length - 1)
  const others = shuffled(pool.filter(k => k.id !== correct.id)).slice(0, count)
  return { correct, choices: shuffled([correct, ...others]) }
}

export function buildPool(
  allKana: Kana[],
  ageMode: AgeMode,
  kanaDifficulty: KanaDifficulty,
): Kana[] {
  let base: Kana[]
  if (ageMode === 'young' && (kanaDifficulty === 1 || kanaDifficulty === 'all')) {
    base = allKana.filter(k => k.type === 'seion')
  } else if (kanaDifficulty === 'all') {
    base = allKana
  } else {
    base = allKana.filter(k => k.difficulty <= (kanaDifficulty as number))
  }
  const seionFallback = allKana.filter(k => k.type === 'seion')
  return base.length >= 4 ? base : seionFallback
}

export function buildParams(ageMode: AgeMode): Omit<EngineParams, 'pool'> {
  return ageMode === 'young'
    ? { fallSpeed: 110, maxBubbles: 3, showRomaji: true,  roundLength: 10 }
    : { fallSpeed: 210, maxBubbles: 5, showRomaji: false, roundLength: 10 }
}

export class KanaCatchEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private params: EngineParams
  private cb: EngineCallbacks
  private bubbles: Bubble[] = []
  private questionNum = 0
  private correctCount = 0
  private raf = 0
  private lastTs = 0
  private waiting = false
  private pending: ReturnType<typeof setTimeout> | null = null

  constructor(canvas: HTMLCanvasElement, params: EngineParams, cb: EngineCallbacks) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.params = params
    this.cb = cb
    canvas.addEventListener('pointerdown', this.onPointer)
  }

  start(): void {
    this.spawnQuestion()
    this.lastTs = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy(): void {
    cancelAnimationFrame(this.raf)
    if (this.pending) clearTimeout(this.pending)
    this.canvas.removeEventListener('pointerdown', this.onPointer)
  }

  private spawnQuestion(): void {
    this.waiting = false
    const { correct, choices } = pickQuestion(this.params.pool, this.params.maxBubbles)
    this.cb.onTargetChange(correct)

    const sectionW = CANVAS_W / choices.length
    this.bubbles = choices.map((kana, i) => {
      const cx = sectionW * i + sectionW / 2 + (Math.random() - 0.5) * sectionW * 0.25
      return {
        kana,
        isCorrect: kana.id === correct.id,
        x: Math.max(BUBBLE_R + 4, Math.min(CANVAS_W - BUBBLE_R - 4, cx)),
        y: -BUBBLE_R - i * 18,
        vy: this.params.fallSpeed + (Math.random() - 0.5) * 30,
        state: 'falling',
        animT: 0,
      }
    })
    this.pending = setTimeout(() => speak(correct.hiragana), 350)
  }

  private readonly loop = (ts: number): void => {
    const dt = Math.min((ts - this.lastTs) / 1000, 0.1)
    this.lastTs = ts
    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.loop)
  }

  private update(dt: number): void {
    if (this.waiting) return
    for (const b of this.bubbles) {
      if (b.state === 'falling') {
        b.y += b.vy * dt
        if (b.y > CANVAS_H + BUBBLE_R) {
          b.state = 'gone'
          if (b.isCorrect) { this.onQuestionEnd(false, b.kana.id); return }
        }
      } else if (b.state === 'burst') {
        b.animT += dt * 1000
        if (b.animT >= BURST_MS) b.state = 'gone'
      }
    }
  }

  private onQuestionEnd(caught: boolean, kanaId: string): void {
    this.waiting = true
    this.questionNum++
    if (caught) { this.correctCount++; this.cb.onCorrect(kanaId) }
    else { this.cb.onMiss(kanaId) }
    const done = this.questionNum >= this.params.roundLength
    const delay = caught ? BURST_MS + 60 : 350
    if (done) {
      cancelAnimationFrame(this.raf)
      this.pending = setTimeout(
        () => this.cb.onComplete(this.correctCount, this.params.roundLength),
        delay,
      )
    } else {
      this.pending = setTimeout(() => this.spawnQuestion(), delay)
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    for (const b of this.bubbles) {
      if (b.state !== 'gone') this.drawBubble(b)
    }
  }

  private drawBubble(b: Bubble): void {
    const { ctx } = this
    const t = b.animT / BURST_MS
    ctx.save()
    ctx.translate(b.x, b.y)
    if (b.state === 'burst') {
      ctx.globalAlpha = Math.max(0, 1 - t * 1.5)
      ctx.scale(1 + t * 2.5, 1 + t * 2.5)
    }
    const grad = ctx.createRadialGradient(-BUBBLE_R * 0.3, -BUBBLE_R * 0.3, 4, 0, 0, BUBBLE_R)
    if (b.isCorrect) {
      grad.addColorStop(0, '#fef9c3'); grad.addColorStop(1, '#fbbf24')
    } else {
      grad.addColorStop(0, '#dbeafe'); grad.addColorStop(1, '#60a5fa')
    }
    ctx.beginPath()
    ctx.arc(0, 0, BUBBLE_R, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#1e3a5f'
    ctx.font = `bold ${Math.round(BUBBLE_R * 0.85)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(b.kana.hiragana, 0, -2)

    if (this.params.showRomaji && b.state === 'falling') {
      ctx.fillStyle = 'rgba(30,58,95,0.55)'
      ctx.font = `${Math.round(BUBBLE_R * 0.30)}px sans-serif`
      ctx.fillText(b.kana.romaji, 0, Math.round(BUBBLE_R * 0.52))
    }
    ctx.restore()
    ctx.globalAlpha = 1
  }

  private readonly onPointer = (e: PointerEvent): void => {
    if (this.waiting) return
    const rect = this.canvas.getBoundingClientRect()
    const px = (e.clientX - rect.left) * (CANVAS_W / rect.width)
    const py = (e.clientY - rect.top) * (CANVAS_H / rect.height)
    for (const b of this.bubbles) {
      if (b.state !== 'falling') continue
      const dx = b.x - px, dy = b.y - py
      if (Math.sqrt(dx * dx + dy * dy) <= BUBBLE_R + 10) {
        if (b.isCorrect) {
          b.state = 'burst'
          b.animT = 0
          this.onQuestionEnd(true, b.kana.id)
        }
        // wrong tap: no penalty per SPEC §5.1
        break
      }
    }
  }
}
