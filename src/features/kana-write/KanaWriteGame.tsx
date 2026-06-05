import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { kanaData, vocabData } from '../../data/loaders'
import type { Kana, Word } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
import { getOrCreateProgress, saveProgress, saveSession } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import { speak } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import {
  KANA_EMOJI, ROUND_SIZE, buildWritePool, pickRound,
  computeWritingScore, scoreToStars,
} from './kanaWriteEngine'
import { useT } from '../../hooks/useT'
import StrokeOrderDemo from './StrokeOrderDemo'

const ALL_KANA: Kana[] = kanaData()
const ALL_VOCAB: Word[] = vocabData()
const CANVAS_SIZE = 280
const STROKE_WIDTH = 10
const STROKE_COLOR = '#1a1a1a'

type Phase = 'draw' | 'result' | 'done'

interface RoundResult { itemId: string; stars: 0 | 1 | 2 | 3; type: 'kana' | 'vocab' }

// Normalised target for any difficulty level
interface WriteTarget {
  id: string
  text: string         // kana string to render + speak
  emoji: string        // shown in the prompt area
  promptLabel: string  // romaji (kana) or meaning_zh (vocab)
  type: 'kana' | 'vocab'
}

function targetFontSize(text: string): number {
  if (text.length === 1) return Math.round(CANVAS_SIZE * 0.72)
  return Math.round(CANVAS_SIZE * 0.60 / text.length)
}

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

function renderRefText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  alpha: string,
) {
  ctx.font = `${targetFontSize(text)}px serif`
  ctx.fillStyle = alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2)
}

function buildVocabPool(): Word[] {
  return ALL_VOCAB.filter(w => w.kana.length >= 2 && w.kana.length <= 4 && w.emoji)
}

function pickVocabRound(pool: Word[], count: number): Word[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function toWriteTarget(item: Kana | Word, _difficulty: 1 | 2 | 3): WriteTarget {
  if ('hiragana' in item) {
    // It's a Kana
    return {
      id: item.id,
      text: item.hiragana,
      emoji: KANA_EMOJI[item.id] ?? '？',
      promptLabel: item.romaji,
      type: 'kana',
    }
  }
  // It's a Word
  return {
    id: item.id,
    text: item.kana,
    emoji: item.emoji ?? '📝',
    promptLabel: item.meaning_zh,
    type: 'vocab',
  }
}

export default function KanaWriteGame() {
  const navigate = useNavigate()
  const { ageMode, kanaDifficulty, writeDifficulty } = useAppStore()
  const adventure = useAdventureChallenge()
  const t = useT()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<{ x: number; y: number }[][]>([])
  const currentStroke = useRef<{ x: number; y: number }[]>([])
  const isDrawing = useRef(false)
  const sessionStart = useRef(Date.now())

  const [round, setRound] = useState<WriteTarget[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('draw')
  const [currentStars, setCurrentStars] = useState<0 | 1 | 2 | 3>(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [xpGained, setXpGained] = useState(0)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [userSnapshot, setUserSnapshot] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  // Build round
  useEffect(() => {
    const pending = adventure.pending
    if (pending?.gameMode === 'write_canvas') {
      const poolChars = pending.configOverrides.kanaPool
      const roundLen = pending.configOverrides.roundLength
      if (Array.isArray(poolChars)) {
        const filtered = ALL_KANA.filter(k => (poolChars as string[]).includes(k.hiragana))
        const len = typeof roundLen === 'number' ? roundLen : ROUND_SIZE
        const pool = filtered.length > 0 ? filtered : ALL_KANA
        setRound(pickRound(pool, len).map(k => toWriteTarget(k, writeDifficulty)))
        return
      }
    }
    if (writeDifficulty === 3) {
      const pool = buildVocabPool()
      setRound(pickVocabRound(pool, ROUND_SIZE).map(w => toWriteTarget(w, 3)))
    } else {
      const pool = buildWritePool(ALL_KANA, ageMode, kanaDifficulty)
      setRound(pickRound(pool, ROUND_SIZE).map(k => toWriteTarget(k, writeDifficulty)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = round[currentIdx] ?? null

  // Redraw the main canvas (ghost + committed strokes)
  const redrawMain = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    if (writeDifficulty === 1 && current && phase === 'draw') {
      ctx.save()
      renderRefText(ctx, current.text, 'rgba(180,180,180,0.30)')
      ctx.restore()
    }

    ctx.save()
    drawStrokes(ctx, strokes.current)
    ctx.restore()
  }, [writeDifficulty, current, phase])

  // Reset canvas when switching target
  useEffect(() => {
    setHasStrokes(false)
    setUserSnapshot(null)
    strokes.current = []
    currentStroke.current = []
    isDrawing.current = false
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    }
    redrawMain()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx])

  // Sync canvas whenever redrawMain is recreated (covers initial load + phase changes)
  useEffect(() => { redrawMain() }, [redrawMain])

  // Speak on new target
  useEffect(() => {
    if (current && phase === 'draw') speak(current.text)
  }, [current, phase])

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
      setHasStrokes(true)
    }
  }

  function handleClear() {
    strokes.current = []
    currentStroke.current = []
    setHasStrokes(false)
    redrawMain()
  }

  // ── Check answer ────────────────────────────────────────────────────────────

  async function handleCheck() {
    if (!current) return

    const offUser = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    const ctxU = offUser.getContext('2d')!
    drawStrokes(ctxU, strokes.current)
    const userImageData = ctxU.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const snapshotCanvas = document.createElement('canvas')
    snapshotCanvas.width = CANVAS_SIZE
    snapshotCanvas.height = CANVAS_SIZE
    const snapshotCtx = snapshotCanvas.getContext('2d')
    if (snapshotCtx) {
      drawStrokes(snapshotCtx, strokes.current)
      setUserSnapshot(snapshotCanvas.toDataURL('image/png'))
    }

    const offRef = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    const ctxR = offRef.getContext('2d')!
    ctxR.save()
    renderRefText(ctxR, current.text, '#000')
    ctxR.restore()
    const refImageData = ctxR.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const score = computeWritingScore(userImageData, refImageData, 18)
    const stars = scoreToStars(score)
    setCurrentStars(stars)

    const isCorrect = stars >= 2
    const record = await getOrCreateProgress(current.id, current.type)
    await saveProgress(isCorrect ? updateAfterCorrect(record) : updateAfterIncorrect(record))

    playSfx(isCorrect ? 'correct' : 'tap')

    setResults(prev => [...prev, { itemId: current.id, stars, type: current.type }])
    setPhase('result')
  }

  // ── Advance ─────────────────────────────────────────────────────────────────

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

    if (xp > 0) await addXpToPet(xp, results.filter(r => r.stars >= 2 && r.type === 'kana').map(r => r.itemId))
    if (xp > 0) playSfx('levelup')

    setPhase('done')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const totalStars = results.reduce((sum, r) => sum + r.stars, 0)
    const maxStars = results.length * 3
    const correct = results.filter(r => r.stars >= 2).length
    const accuracy = results.length > 0 ? correct / results.length : 0
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center justify-center px-4 gap-6">
        <p className="text-5xl">✏️</p>
        <p className="text-3xl font-bold text-emerald-700">{t('doneKanaWrite')}</p>
        <div className="text-6xl font-bold text-yellow-500">
          {'⭐'.repeat(Math.round(totalStars / Math.max(maxStars, 1) * 3))}
        </div>
        <p className="text-xl text-gray-600">
          {correct} / {results.length} {t('correct')}
        </p>
        {xpGained > 0 && (
          <p className="text-lg text-emerald-600 font-semibold">+{xpGained} XP ✨</p>
        )}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2">
              <span className="text-2xl">{round[i]?.emoji ?? '？'}</span>
              <span className="text-xl font-bold text-gray-700">{round[i]?.text ?? ''}</span>
              <span className="text-xl">{'⭐'.repeat(r.stars)}{'☆'.repeat(3 - r.stars)}</span>
            </div>
          ))}
        </div>
        {adventure.isActive ? (
          <button
            type="button"
            onClick={() => adventure.submitResult(accuracy, xpGained)}
            className="mt-2 px-8 py-3 rounded-2xl bg-indigo-500 text-white text-xl font-bold shadow hover:bg-indigo-600 transition-colors"
          >
            {t('adventureReturn')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/play')}
            className="mt-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 transition-colors"
          >
            {t('kanaWriteReturn')}
          </button>
        )}
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-100">
        <p className="text-2xl text-gray-400">{t('loading')}</p>
      </div>
    )
  }

  const isLast = currentIdx + 1 >= round.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">
      {showDemo && current.type === 'kana' && (
        <StrokeOrderDemo char={current.text} onClose={() => setShowDemo(false)} />
      )}

      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <button
          type="button"
          onClick={() => adventure.isActive ? adventure.cancelChallenge() : navigate('/play')}
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
        <span className="text-6xl">{current.emoji}</span>
        <button
          type="button"
          aria-label={t('listenAgainAria')}
          onClick={() => speak(current.text)}
          className="flex items-center gap-2 bg-white/70 rounded-2xl px-4 py-2 shadow hover:bg-white transition-colors"
        >
          <span className="text-2xl">🔊</span>
          <span className="text-2xl font-bold text-sky-700">{current.promptLabel}</span>
        </button>
      </div>

      {/* Stars (result phase) */}
      {phase === 'result' && (
        <div className="text-4xl">
          {'⭐'.repeat(currentStars)}{'☆'.repeat(3 - currentStars)}
        </div>
      )}

      {/* Canvas / Result panels */}
      {phase === 'result' && userSnapshot ? (
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-bold text-gray-600">{t('kanaWriteOteho')}</span>
            <div
              className="rounded-2xl bg-white shadow-xl border-4 border-sky-200 flex items-center justify-center"
              style={{ width: 140, height: 140 }}
            >
              <span style={{ fontSize: Math.round(140 * 0.60 / Math.max(1, current.text.length)), fontFamily: 'serif', color: '#1d4ed8', lineHeight: 1 }}>
                {current.text}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-bold text-gray-600">{t('kanaWriteKiminoj')}</span>
            <img
              src={userSnapshot}
              alt={current.promptLabel}
              className="rounded-2xl bg-white shadow-xl border-4 border-orange-400"
              style={{ width: 140, height: 140 }}
              draggable={false}
            />
          </div>
        </div>
      ) : (
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
        </div>
      )}

      {/* Action buttons */}
      {phase === 'draw' ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-3 rounded-2xl bg-gray-200 text-gray-700 text-lg font-bold shadow hover:bg-gray-300 transition-colors"
            >
              {t('kanaWriteClear')}
            </button>
            <button
              type="button"
              onClick={() => { void handleCheck() }}
              disabled={!hasStrokes}
              className="flex-[2] py-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('kanaWriteCheck')}
            </button>
          </div>
          {current.type === 'kana' && (
            <button
              type="button"
              onClick={() => setShowDemo(true)}
              className="px-5 py-2 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm font-semibold transition-colors active:scale-95"
            >
              {t('kanaWriteDemo')} ✍️
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { void handleNext() }}
          className="w-full max-w-sm py-4 rounded-2xl bg-sky-500 text-white text-xl font-bold shadow hover:bg-sky-600 transition-colors"
        >
          {isLast ? t('kanaWriteFinish') : t('kanaWriteNext')}
        </button>
      )}

      {/* Hint: only show when ghost is visible (Level 1) */}
      {writeDifficulty === 1 && phase === 'draw' && (
        <p className="text-sm text-gray-400">{t('kanaWriteHint')}</p>
      )}
    </div>
  )
}
