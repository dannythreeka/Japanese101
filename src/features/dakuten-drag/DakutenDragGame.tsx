import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PetState } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { lessonData } from '../../data/loaders'
import { playSfx } from '../../lib/audio'
import { speak } from '../../lib/tts'
import { getOrCreateProgress, saveProgress, saveSession, getOrCreatePet } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import PetAvatar from '../../components/PetAvatar'
import { buildQuestions, shuffleQuestions, checkAnswer, getProgressId } from './DakutenDragEngine'
import type { DragQuestion } from './DakutenDragEngine'

const LESSONS = lessonData()

function loadShuffledQuestions(): DragQuestion[] {
  const lesson = LESSONS.find(l => (l.dakuten_drag_items?.length ?? 0) > 0)
  return lesson ? shuffleQuestions(buildQuestions(lesson)) : []
}

type Phase = 'playing' | 'results'

export default function DakutenDragGame() {
  const navigate = useNavigate()
  const { addStars, startSession, endSession } = useAppStore()
  const sessionSaved = useRef(false)

  const [pet, setPet] = useState<PetState | null>(null)
  const [questions, setQuestions] = useState<DragQuestion[]>(() => loadShuffledQuestions())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [wrongTile, setWrongTile] = useState<number | null>(null)
  const [successTile, setSuccessTile] = useState<number | null>(null)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)

  // Drag state
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [hoveredTile, setHoveredTile] = useState<number | null>(null)
  const dragActive = useRef(false)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    void getOrCreatePet().then(setPet)
    startSession()
  }, [startSession])

  useEffect(() => {
    if (phase === 'playing' && questions[currentIdx]) {
      speak(questions[currentIdx].item.target)
    }
  }, [currentIdx, phase, questions])

  const handleComplete = useCallback(async (correct: number, total: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({
      id: `dakuten-drag-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'dakuten_drag',
      correct,
      total,
    })
    const xp = calculateXpGain(correct, total)
    const result = await addXpToPet(xp, [])
    setPet(result.pet)
    if (result.leveledUp) { playSfx('levelup'); setXpResult(result) }
    setPhase('results')
  }, [endSession])

  const handleDrop = useCallback(async (tileIndex: number) => {
    const current = questions[currentIdx]
    if (!current || phase !== 'playing' || successTile !== null) return

    if (checkAnswer(current, tileIndex)) {
      playSfx('correct')
      addStars(1)
      const newScore = score + 1
      setScore(newScore)
      setSuccessTile(tileIndex)
      speak(current.item.target)
      const record = await getOrCreateProgress(getProgressId(current.item), 'vocab')
      await saveProgress(updateAfterCorrect(record))
      setTimeout(() => {
        setSuccessTile(null)
        const next = currentIdx + 1
        if (next >= questions.length) {
          void handleComplete(newScore, questions.length)
        } else {
          setCurrentIdx(next)
        }
      }, 900)
    } else {
      playSfx('wrong')
      setWrongTile(tileIndex)
      const record = await getOrCreateProgress(getProgressId(current.item), 'vocab')
      await saveProgress(updateAfterIncorrect(record))
      setTimeout(() => setWrongTile(null), 500)
    }
  }, [questions, currentIdx, phase, successTile, addStars, score, handleComplete])

  const findTileAt = useCallback((x: number, y: number): number => {
    return tileRefs.current.findIndex(ref => {
      if (!ref) return false
      const r = ref.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    })
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (successTile !== null) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragActive.current = true
    setDragPos({ x: e.clientX, y: e.clientY })
  }, [successTile])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragActive.current) return
    setDragPos({ x: e.clientX, y: e.clientY })
    const idx = findTileAt(e.clientX, e.clientY)
    setHoveredTile(idx >= 0 ? idx : null)
  }, [findTileAt])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragActive.current) return
    dragActive.current = false
    const idx = findTileAt(e.clientX, e.clientY)
    setDragPos(null)
    setHoveredTile(null)
    if (idx >= 0) void handleDrop(idx)
  }, [findTileAt, handleDrop])

  const handleRestart = useCallback(() => {
    sessionSaved.current = false
    dragActive.current = false
    setQuestions(loadShuffledQuestions())
    setCurrentIdx(0)
    setScore(0)
    setPhase('playing')
    setSuccessTile(null)
    setWrongTile(null)
    setXpResult(null)
    setDragPos(null)
    setHoveredTile(null)
    startSession()
  }, [startSession])

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-2xl text-gray-500">データなし</p>
        <button type="button" onClick={() => navigate('/play')}
          className="px-6 py-3 rounded-2xl bg-blue-400 text-white text-xl font-bold">ホーム</button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-violet-100 to-pink-50">
        {xpResult?.leveledUp && (
          <LevelUpModal newLevel={xpResult.pet.level} evolvedToStage={xpResult.evolvedToStage}
            onClose={() => setXpResult(null)} />
        )}
        <h1 className="text-5xl font-bold text-pink-500">おわった！</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {score}</div>
        <p className="text-3xl text-gray-600">{score} / {questions.length} せいかい</p>
        <button type="button" aria-label="もういちどあそぶ" onClick={handleRestart}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform">
          もういちど！
        </button>
        <button type="button" aria-label="ホームにもどる" onClick={() => navigate('/play')}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-blue-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
          ホーム
        </button>
      </div>
    )
  }

  const current = questions[currentIdx]
  const markSymbol = current.item.mark === 'handakuten' ? '゜' : '゛'
  const progress = (currentIdx / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-6 bg-gradient-to-b from-violet-100 to-pink-50">

      {/* Progress header */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button type="button" aria-label="もどる" onClick={() => navigate('/play')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-14 text-right">
          {currentIdx}/{questions.length}
        </span>
      </div>

      {/* Meaning + TTS */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl font-bold text-violet-700">{current.item.meaning_zh}</div>
        <button type="button" aria-label="もういちどきく"
          onClick={() => speak(current.item.target)}
          className="w-14 h-14 rounded-full bg-violet-100 text-3xl flex items-center justify-center hover:bg-violet-200 transition-colors shadow">
          🔊
        </button>
      </div>

      {/* Instruction */}
      <p className="text-2xl text-gray-600 text-center">
        どれに{' '}
        <span className="text-4xl font-bold text-red-500 mx-1">{markSymbol}</span>
        {' '}を つける？
      </p>

      {/* Kana tiles — drop targets */}
      <div className="flex gap-6 justify-center">
        {current.baseChars.map((char, i) => {
          const isWrong = wrongTile === i
          const isSuccess = successTile === i
          const isHovered = hoveredTile === i && dragPos !== null

          return (
            <div
              key={i}
              ref={el => { tileRefs.current[i] = el }}
              aria-label={char}
              className={[
                'w-24 h-24 rounded-3xl text-5xl font-bold shadow-lg transition-all duration-150',
                'border-4 select-none flex items-center justify-center',
                isSuccess
                  ? 'bg-green-400 border-green-600 text-white scale-110'
                  : isHovered
                  ? 'bg-violet-200 border-violet-600 scale-110'
                  : isWrong
                  ? 'bg-red-100 border-red-400 animate-shake'
                  : 'bg-white border-violet-300 text-violet-800',
              ].join(' ')}
            >
              {isSuccess ? `${current.targetChars[i]}${markSymbol}` : char}
            </div>
          )
        })}
      </div>

      {/* Draggable badge */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <button
          type="button"
          aria-label={`${markSymbol}をドラッグして正しい文字にのせよう`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          disabled={successTile !== null}
          style={{ touchAction: 'none' }}
          className={[
            'w-20 h-20 rounded-full text-5xl font-bold shadow-xl',
            'bg-red-400 text-white border-4 border-red-600',
            'flex items-center justify-center select-none',
            dragPos ? 'invisible' : 'cursor-grab hover:scale-110 transition-transform active:scale-95',
            successTile !== null ? 'opacity-40' : '',
          ].join(' ')}
        >
          {markSymbol}
        </button>
        {!dragPos && (
          <p className="text-lg text-gray-400">ドラッグして のせよう！</p>
        )}
      </div>

      {/* Floating badge clone — follows pointer during drag */}
      {dragPos && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: dragPos.x - 40,
            top: dragPos.y - 40,
            width: 80,
            height: 80,
            zIndex: 50,
            pointerEvents: 'none',
          }}
          className="rounded-full text-5xl font-bold bg-red-400 text-white border-4 border-red-600 shadow-2xl flex items-center justify-center scale-110"
        >
          {markSymbol}
        </div>
      )}

      {/* Pet + score */}
      <div className="flex flex-col items-center gap-1 mt-auto pb-4">
        {pet ? <PetAvatar pet={pet} size="sm" /> : <span className="text-5xl">🐾</span>}
        {score > 0 && <span className="text-xl font-bold text-yellow-500">⭐ × {score}</span>}
      </div>
    </div>
  )
}
