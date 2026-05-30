import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import kanaData from '../../data/kana.json'
import type { Kana } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { getOrCreateProgress, saveProgress, saveSession } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import { speak } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import {
  KANA_EMOJI, ROUND_SIZE, buildWritePool, pickRound,
  computeWritingScore, scoreToStars,
} from './kanaWriteEngine'

const ALL_KANA = kanaData as Kana[]
const CANVAS_SIZE = 280
const STROKE_WIDTH = 10
const STROKE_COLOR = '#1a1a1a'
const REF_FONT = `${Math.round(CANVAS_SIZE * 0.72)}px serif`

type Phase = 'draw' | 'result' | 'done'

interface RoundResult { kanaId: string; stars: 0 | 1 | 2 | 3 }

function drawStrokes(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  strokes: { x: number; y: number }[][],
) {
  ctx.strokeStyle = STROKE_COLOR
  ctx.lineWidth = STROKE_WIDTH
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of strokes) {
    if (stroke.length === 0) continue
    ctx.beginPath()
    ctx.moveTo(stroke[0].x, stroke[0].y)
    for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y)
    ctx.stroke()
  }
}

function renderRefChar(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  char: string,
  alpha: string,
) {
  ctx.font = REF_FONT
  ctx.fillStyle = alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char, CANVAS_SIZE / 2, CANVAS_SIZE / 2)
}

export default function KanaWriteGame() {
  const navigate = useNavigate()
  const { ageMode, kanaDifficulty } = useAppStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<{ x: number; y: number }[][]>([])
  const currentStroke = useRef<{ x: number; y: number }[]>([])
  const isDrawing = useRef(false)
  const sessionStart = useRef(Date.now())

  const [round, setRound] = useState<Kana[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('draw')
  const [currentStars, setCurrentStars] = useState<0 | 1 | 2 | 3>(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [xpGained, setXpGained] = useState(0)

  // Build round once on mount
  useEffect(() => {
    const pool = buildWritePool(ALL_KANA, ageMode, kanaDifficulty)
    setRound(pickRound(pool, ROUND_SIZE))
  }, [ageMode, kanaDifficulty])

  const currentKana = round[currentIdx] ?? null

  // Redraw the main canvas (ghost + committed strokes)
  const redrawMain = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    if (ageMode === 'young' && currentKana && phase === 'draw') {
      ctx.save()
      renderRefChar(ctx, currentKana.hiragana, 'rgba(180,180,180,0.30)')
      ctx.restore()
    }

    ctx.save()
    drawStrokes(ctx, strokes.current)
    ctx.restore()
  }, [ageMode, currentKana, phase])

  // Reset canvas when switching kana
  useEffect(() => {
    strokes.current = []
    currentStroke.current = []
    isDrawing.current = false
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }
    redrawMain()
  }, [currentIdx, redrawMain])

  // Speak kana on new character
  useEffect(() => {
    if (currentKana && phase === 'draw') speak(currentKana.hiragana)
  }, [currentKana, phase])

  // ── Pointer events ──────────────────────────────────────────────────────────

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_SIZE / rect.height),
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== 'draw') return
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawing.current = true
    currentStroke.current = [getPos(e)]
    redrawMain()
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || phase !== 'draw') return
    const pos = getPos(e)
    currentStroke.current.push(pos)
    // Incremental draw for the live stroke segment
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      const pts = currentStroke.current
      if (pts.length >= 2) {
        ctx.save()
        ctx.strokeStyle = STROKE_COLOR
        ctx.lineWidth = STROKE_WIDTH
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y)
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  function handlePointerUp() {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentStroke.current.length > 0) {
      strokes.current.push([...currentStroke.current])
      currentStroke.current = []
    }
  }

  function handleClear() {
    strokes.current = []
    currentStroke.current = []
    redrawMain()
  }

  // ── Check answer ────────────────────────────────────────────────────────────

  async function handleCheck() {
    if (!currentKana) return

    // Score against offscreen canvases (no ghost contamination)
    const offUser = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    const ctxU = offUser.getContext('2d')!
    drawStrokes(ctxU, strokes.current)
    const userImageData = ctxU.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const offRef = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    const ctxR = offRef.getContext('2d')!
    ctxR.save()
    renderRefChar(ctxR, currentKana.hiragana, '#000')
    ctxR.restore()
    const refImageData = ctxR.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const score = computeWritingScore(userImageData, refImageData, 18)
    const stars = scoreToStars(score)
    setCurrentStars(stars)

    // Draw orange reference overlay on main canvas
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && currentKana) {
      ctx.save()
      renderRefChar(ctx, currentKana.hiragana, 'rgba(255,120,30,0.55)')
      ctx.restore()
    }

    // SRS update
    const isCorrect = stars >= 2
    const record = await getOrCreateProgress(currentKana.id, 'kana')
    await saveProgress(isCorrect ? updateAfterCorrect(record) : updateAfterIncorrect(record))

    playSfx(isCorrect ? 'correct' : 'tap')

    setResults(prev => [...prev, { kanaId: currentKana.id, stars }])
    setPhase('result')
  }

  // ── Advance to next kana or finish ──────────────────────────────────────────

  async function handleNext() {
    if (currentIdx + 1 >= round.length) {
      await finishRound()
    } else {
      setCurrentIdx(i => i + 1)
      setPhase('draw')
    }
  }

  async function finishRound() {
    const correct = results.filter(r => r.stars >= 2).length
    const total = results.length
    const xp = calculateXpGain(correct, total)
    setXpGained(xp)

    await saveSession({
      id: `kw-${Date.now()}`,
      date: Date.now(),
      durationMs: Date.now() - sessionStart.current,
      feature: 'kana_write',
      correct,
      total,
    })

    if (xp > 0) await addXpToPet(xp, results.filter(r => r.stars >= 2).map(r => r.kanaId))
    if (xp > 0) playSfx('levelup')

    setPhase('done')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const totalStars = results.reduce((sum, r) => sum + r.stars, 0)
    const maxStars = results.length * 3
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center justify-center px-4 gap-6">
        <p className="text-5xl">✏️</p>
        <p className="text-3xl font-bold text-emerald-700">おわり！</p>
        <div className="text-6xl font-bold text-yellow-500">
          {'⭐'.repeat(Math.round(totalStars / Math.max(maxStars, 1) * 3))}
        </div>
        <p className="text-xl text-gray-600">
          {results.filter(r => r.stars >= 2).length} / {results.length} もんせいかい
        </p>
        {xpGained > 0 && (
          <p className="text-lg text-emerald-600 font-semibold">+{xpGained} XP ✨</p>
        )}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2">
              <span className="text-2xl">{KANA_EMOJI[r.kanaId] ?? '？'}</span>
              <span className="text-xl font-bold text-gray-700">{round[i]?.hiragana ?? ''}</span>
              <span className="text-xl">{'⭐'.repeat(r.stars)}{'☆'.repeat(3 - r.stars)}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/play')}
          className="mt-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 transition-colors"
        >
          もどる
        </button>
      </div>
    )
  }

  if (!currentKana) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-100">
        <p className="text-2xl text-gray-400">よみこみちゅう…</p>
      </div>
    )
  }

  const emoji = KANA_EMOJI[currentKana.id] ?? '？'
  const isLast = currentIdx + 1 >= round.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/play')}
          className="text-2xl text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <span className="text-lg font-bold text-gray-600">
          {currentIdx + 1} / {round.length}
        </span>
        <div className="w-8" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx + (phase === 'result' ? 1 : 0)) / round.length) * 100}%` }}
        />
      </div>

      {/* Prompt */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl">{emoji}</span>
        <button
          type="button"
          aria-label="もういちどきく"
          onClick={() => speak(currentKana.hiragana)}
          className="flex items-center gap-2 bg-white/70 rounded-2xl px-4 py-2 shadow hover:bg-white transition-colors"
        >
          <span className="text-2xl">🔊</span>
          <span className="text-2xl font-bold text-sky-700">{currentKana.romaji}</span>
        </button>
      </div>

      {/* Stars (result phase) */}
      {phase === 'result' && (
        <div className="text-4xl">
          {'⭐'.repeat(currentStars)}{'☆'.repeat(3 - currentStars)}
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-2xl bg-white shadow-xl border-4 border-white touch-none"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, cursor: phase === 'draw' ? 'crosshair' : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {phase === 'result' && (
          <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-3 pointer-events-none">
            <span className="text-sm text-orange-600 bg-white/80 rounded-full px-3 py-1">
              だいだい色 = お手本
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {phase === 'draw' ? (
        <div className="flex gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 rounded-2xl bg-gray-200 text-gray-700 text-lg font-bold shadow hover:bg-gray-300 transition-colors"
          >
            けす
          </button>
          <button
            type="button"
            onClick={() => { void handleCheck() }}
            disabled={strokes.current.length === 0}
            className="flex-[2] py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            かくにん ✓
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { void handleNext() }}
          className="w-full max-w-sm py-4 rounded-2xl bg-sky-500 text-white text-xl font-bold shadow hover:bg-sky-600 transition-colors"
        >
          {isLast ? 'おわり 🎉' : 'つぎ →'}
        </button>
      )}

      {/* Hint for young mode */}
      {ageMode === 'young' && phase === 'draw' && (
        <p className="text-sm text-gray-400">うすい文字をなぞってみよう！</p>
      )}
    </div>
  )
}
