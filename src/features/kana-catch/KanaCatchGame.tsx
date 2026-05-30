import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Kana, PetState } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { kanaData } from '../../data/loaders'
import { playSfx } from '../../lib/audio'
import { speak } from '../../lib/tts'
import { getOrCreateProgress, saveProgress, saveSession, getOrCreatePet } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import PetAvatar from '../../components/PetAvatar'
import { KanaCatchEngine, buildPool, buildParams, CANVAS_W, CANVAS_H } from './KanaCatchEngine'

const ALL_KANA = kanaData()

export default function KanaCatchGame() {
  const navigate = useNavigate()
  const { ageMode, kanaDifficulty, addStars, startSession, endSession } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionSaved = useRef(false)
  const correctKanaIds = useRef<string[]>([])

  const [target, setTarget] = useState<Kana | null>(null)
  const [questionNum, setQuestionNum] = useState(0)
  const [score, setScore] = useState(0)
  const [bounce, setBounce] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const [pet, setPet] = useState<PetState | null>(null)
  const [gameKey, setGameKey] = useState(0)

  const pool = useMemo(() => buildPool(ALL_KANA, ageMode, kanaDifficulty), [ageMode, kanaDifficulty])
  const baseParams = useMemo(() => buildParams(ageMode), [ageMode])

  useEffect(() => {
    startSession()
    getOrCreatePet().then(setPet)
  }, [startSession])

  const handleCorrect = useCallback(async (kanaId: string) => {
    playSfx('correct')
    addStars(1)
    setScore(s => s + 1)
    setBounce(true)
    setTimeout(() => setBounce(false), 600)
    correctKanaIds.current = [...correctKanaIds.current, kanaId]
    const record = await getOrCreateProgress(kanaId, 'kana')
    await saveProgress(updateAfterCorrect(record))
  }, [addStars])

  const handleMiss = useCallback(async (kanaId: string) => {
    playSfx('wrong')
    const record = await getOrCreateProgress(kanaId, 'kana')
    await saveProgress(updateAfterIncorrect(record))
  }, [])

  const handleComplete = useCallback(async (correct: number, total: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({
      id: `kana-catch-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'kana_catch',
      correct,
      total,
    })
    const xp = calculateXpGain(correct, total)
    const result = await addXpToPet(xp, correctKanaIds.current)
    setPet(result.pet)
    if (result.leveledUp) { playSfx('levelup'); setXpResult(result) }
    setShowResults(true)
  }, [endSession])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || showResults) return
    const params = { ...baseParams, pool }
    const engine = new KanaCatchEngine(canvas, params, {
      onCorrect: (id) => { void handleCorrect(id) },
      onMiss:    (id) => { void handleMiss(id) },
      onComplete: (c, t) => { void handleComplete(c, t) },
      onTargetChange: (kana) => { setTarget(kana); setQuestionNum(n => n + 1) },
    })
    engine.start()
    return () => engine.destroy()
  }, [pool, baseParams, handleCorrect, handleMiss, handleComplete, showResults, gameKey])

  const handleRestart = useCallback(() => {
    sessionSaved.current = false
    correctKanaIds.current = []
    setScore(0)
    setQuestionNum(0)
    setTarget(null)
    setShowResults(false)
    setXpResult(null)
    startSession()
    setGameKey(k => k + 1)
  }, [startSession])

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        {xpResult?.leveledUp && (
          <LevelUpModal
            newLevel={xpResult.pet.level}
            evolvedToStage={xpResult.evolvedToStage}
            onClose={() => setXpResult(null)}
          />
        )}
        <h1 className="text-5xl font-bold text-pink-500">おわった！</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {score}</div>
        <p className="text-3xl text-gray-600">{score} / {baseParams.roundLength} せいかい</p>
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

  const progress = Math.max(0, ((questionNum - 1) / baseParams.roundLength) * 100)

  return (
    <div className="min-h-screen flex flex-col items-center gap-3 p-4 pt-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full max-w-sm flex items-center gap-3">
        <button type="button" aria-label="ホームにもどる" onClick={() => navigate('/play')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-14 text-right">
          {Math.max(0, questionNum - 1)}/{baseParams.roundLength}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold text-gray-700">おとをきいて！</p>
        <button type="button" aria-label="もういちどきく"
          onClick={() => target && speak(target.hiragana)}
          className="w-12 h-12 rounded-full bg-orange-100 text-2xl flex items-center justify-center hover:bg-orange-200 transition-colors">
          🔊
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full max-w-sm rounded-2xl shadow-inner bg-gradient-to-b from-sky-100 to-indigo-100"
      />

      <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${bounce ? '-translate-y-4 scale-110' : ''}`}>
        {pet ? <PetAvatar pet={pet} size="sm" /> : <span className="text-5xl">🐾</span>}
        {score > 0 && <span className="text-xl font-bold text-yellow-500">⭐ × {score}</span>}
      </div>
    </div>
  )
}
