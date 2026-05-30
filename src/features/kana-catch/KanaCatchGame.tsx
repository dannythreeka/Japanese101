import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PetState, KanaCatchSubMode } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { kanaData, vocabData, lessonData } from '../../data/loaders'
import { playSfx } from '../../lib/audio'
import { speak } from '../../lib/tts'
import { getOrCreateProgress, saveProgress, saveSession, getOrCreatePet } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import PetAvatar from '../../components/PetAvatar'
import { KanaCatchEngine, CANVAS_W, CANVAS_H } from './KanaCatchEngine'
import type { QuestionConfig } from './KanaCatchEngine'
import {
  buildPool, buildParams, loadProgressMap,
  makeListenGenerator, makeMinimalPairGenerator, makeWordToImageGenerator,
} from './questionGenerators'
import KanaCatchSetup from './KanaCatchSetup'

const ALL_KANA  = kanaData()
const ALL_VOCAB = vocabData()
const LESSONS   = lessonData()

type GameState = 'setup' | 'playing' | 'results'

export default function KanaCatchGame() {
  const navigate = useNavigate()
  const { ageMode, kanaDifficulty, addStars, startSession, endSession } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionSaved = useRef(false)
  const correctIds = useRef<string[]>([])

  const [gameState, setGameState] = useState<GameState>('setup')
  const [currentQ, setCurrentQ] = useState<QuestionConfig | null>(null)
  const [score, setScore] = useState(0)
  const [questionNum, setQuestionNum] = useState(0)
  const [bounce, setBounce] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const [pet, setPet] = useState<PetState | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [subMode, setSubMode] = useState<KanaCatchSubMode>('listen')
  const [unitId, setUnitId] = useState<string | undefined>()

  const baseParams = useMemo(() => buildParams(ageMode), [ageMode])
  const kanaPool   = useMemo(() => buildPool(ALL_KANA, ageMode, kanaDifficulty), [ageMode, kanaDifficulty])

  useEffect(() => { getOrCreatePet().then(setPet) }, [])

  const handleCorrect = useCallback(async (itemId: string) => {
    playSfx('correct')
    addStars(1)
    setScore(s => s + 1)
    setBounce(true)
    setTimeout(() => setBounce(false), 600)
    correctIds.current = [...correctIds.current, itemId]
    const type = subMode === 'word_to_image' ? 'vocab' : 'kana'
    const record = await getOrCreateProgress(itemId, type)
    await saveProgress(updateAfterCorrect(record))
  }, [addStars, subMode])

  const handleMiss = useCallback(async (itemId: string) => {
    playSfx('wrong')
    const type = subMode === 'word_to_image' ? 'vocab' : 'kana'
    const record = await getOrCreateProgress(itemId, type)
    await saveProgress(updateAfterIncorrect(record))
  }, [subMode])

  const handleComplete = useCallback(async (correct: number, total: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({ id: `kana-catch-${Date.now()}`, date: Date.now(), durationMs: duration,
      feature: 'kana_catch', correct, total })
    const xp = calculateXpGain(correct, total)
    const result = await addXpToPet(xp, subMode !== 'word_to_image' ? correctIds.current : [])
    setPet(result.pet)
    if (result.leveledUp) { playSfx('levelup'); setXpResult(result) }
    setGameState('results')
  }, [endSession, subMode])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    let active = true
    void (async () => {
      const pMap = await loadProgressMap()
      if (!active) return
      const lesson = LESSONS.find(l => l.unit_id === unitId)
      let nextQ: () => QuestionConfig
      const max = baseParams.showRomaji ? 3 : 5
      if (subMode === 'minimal_pair' && lesson) {
        nextQ = makeMinimalPairGenerator(lesson.target_kana_pairs, ALL_KANA, max, pMap)
      } else if (subMode === 'word_to_image' && lesson) {
        nextQ = makeWordToImageGenerator(lesson.concept_words, ALL_VOCAB, max, pMap)
      } else {
        nextQ = makeListenGenerator(kanaPool, max, pMap)
      }
      const engine = new KanaCatchEngine(canvas, baseParams, {
        nextQuestion: nextQ,
        onNewQuestion: (q) => { setCurrentQ(q); setQuestionNum(n => n + 1) },
        onCorrect: (id) => { void handleCorrect(id) },
        onMiss:    (id) => { void handleMiss(id) },
        onComplete: (c, t) => { void handleComplete(c, t) },
      })
      engine.start()
      return () => engine.destroy()
    })()
    return () => { active = false }
  }, [gameState, gameKey, subMode, unitId, baseParams, kanaPool, handleCorrect, handleMiss, handleComplete])

  const handleStart = useCallback((mode: KanaCatchSubMode, uid?: string) => {
    sessionSaved.current = false
    correctIds.current = []
    setScore(0); setQuestionNum(0); setCurrentQ(null); setXpResult(null)
    setSubMode(mode); setUnitId(uid)
    startSession()
    setGameState('playing')
    setGameKey(k => k + 1)
  }, [startSession])

  const handleRestart = useCallback(() => {
    sessionSaved.current = false
    correctIds.current = []
    setScore(0); setQuestionNum(0); setCurrentQ(null); setXpResult(null)
    startSession()
    setGameState('playing')
    setGameKey(k => k + 1)
  }, [startSession])

  if (gameState === 'setup') {
    return <KanaCatchSetup lessons={LESSONS} onStart={handleStart} />
  }

  if (gameState === 'results') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        {xpResult?.leveledUp && (
          <LevelUpModal newLevel={xpResult.pet.level} evolvedToStage={xpResult.evolvedToStage}
            onClose={() => setXpResult(null)} />
        )}
        <h1 className="text-5xl font-bold text-pink-500">おわった！</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {score}</div>
        <p className="text-3xl text-gray-600">{score} / {baseParams.roundLength} せいかい</p>
        <button type="button" aria-label="もういちどあそぶ" onClick={handleRestart}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform">
          もういちど！
        </button>
        <button type="button" aria-label="モードをえらぶ" onClick={() => setGameState('setup')}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-orange-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
          モードをかえる
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
        <button type="button" aria-label="もどる" onClick={() => setGameState('setup')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-14 text-right">
          {Math.max(0, questionNum - 1)}/{baseParams.roundLength}
        </span>
      </div>

      {subMode === 'word_to_image' && currentQ?.centerContent ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-7xl select-none">{currentQ.centerContent}</span>
          <button type="button" aria-label="もういちどきく"
            onClick={() => currentQ && speak(currentQ.ttsText)}
            className="w-11 h-11 rounded-full bg-orange-100 text-xl flex items-center justify-center hover:bg-orange-200">
            🔊
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-gray-700">おとをきいて！</p>
          <button type="button" aria-label="もういちどきく"
            onClick={() => currentQ && speak(currentQ.ttsText)}
            className="w-12 h-12 rounded-full bg-orange-100 text-2xl flex items-center justify-center hover:bg-orange-200 transition-colors">
            🔊
          </button>
        </div>
      )}

      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
        className="w-full max-w-sm rounded-2xl shadow-inner bg-gradient-to-b from-sky-100 to-indigo-100" />

      <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${bounce ? '-translate-y-4 scale-110' : ''}`}>
        {pet ? <PetAvatar pet={pet} size="sm" /> : <span className="text-5xl">🐾</span>}
        {score > 0 && <span className="text-xl font-bold text-yellow-500">⭐ × {score}</span>}
      </div>
    </div>
  )
}
