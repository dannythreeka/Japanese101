import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PetState, KanaCatchSubMode, ConceptWord } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
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
import type { QuestionConfig, EngineParams } from './KanaCatchEngine'
import {
  buildPool, buildParams, loadProgressMap,
  makeListenGenerator, makeMinimalPairGenerator, makeWordToImageGenerator,
} from './questionGenerators'
import KanaCatchSetup from './KanaCatchSetup'
import { useT } from '../../hooks/useT'

const ALL_KANA  = kanaData()
const ALL_VOCAB = vocabData()
const LESSONS   = lessonData()

type GameState = 'setup' | 'playing' | 'results'

const KANA_CATCH_MODE: Record<string, KanaCatchSubMode> = {
  kana_catch_listen:        'listen',
  kana_catch_minimal_pair:  'minimal_pair',
  kana_catch_word_to_image: 'word_to_image',
}

export default function KanaCatchGame() {
  const navigate = useNavigate()
  const { ageMode, kanaDifficulty, addStars, startSession, endSession } = useAppStore()
  const adventure = useAdventureChallenge()
  const t = useT()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionSaved = useRef(false)
  const correctIds = useRef<string[]>([])
  const adventureAutoStarted = useRef(false)

  const [gameState, setGameState] = useState<GameState>('setup')
  const [currentQ, setCurrentQ] = useState<QuestionConfig | null>(null)
  const [score, setScore] = useState(0)
  const [bounce, setBounce] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const [pet, setPet] = useState<PetState | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [subMode, setSubMode] = useState<KanaCatchSubMode>('listen')
  const [unitId, setUnitId] = useState<string | undefined>()
  const [pooledPairs, setPooledPairs] = useState<string[][] | null>(null)
  const [pooledWords, setPooledWords] = useState<ConceptWord[] | null>(null)
  const [paramsOverride, setParamsOverride] = useState<{
    roundLength?: number; fallSpeed?: number; maxBubbles?: number; highlightCorrectAnswer?: boolean
  }>({})

  const baseParams = useMemo(() => buildParams(ageMode), [ageMode])
  const kanaPool   = useMemo(() => buildPool(ALL_KANA, ageMode, kanaDifficulty), [ageMode, kanaDifficulty])
  const effectiveParams = useMemo((): EngineParams => ({
    fallSpeed:   paramsOverride.fallSpeed   ?? baseParams.fallSpeed,
    showRomaji:  baseParams.showRomaji,
    roundLength: paramsOverride.roundLength ?? baseParams.roundLength,
    highlightCorrectAnswer: paramsOverride.highlightCorrectAnswer ?? false,
  }), [baseParams, paramsOverride])

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
      const activePairs = pooledPairs ?? lesson?.target_kana_pairs
      const activeWords = pooledWords ?? lesson?.concept_words
      const maxB = paramsOverride.maxBubbles ?? (effectiveParams.showRomaji ? 3 : 5)
      let nextQ: () => QuestionConfig
      if (subMode === 'minimal_pair' && activePairs) {
        nextQ = makeMinimalPairGenerator(activePairs, ALL_KANA, maxB, pMap)
      } else if (subMode === 'word_to_image' && activeWords) {
        nextQ = makeWordToImageGenerator(activeWords, ALL_VOCAB, maxB, pMap)
      } else {
        nextQ = makeListenGenerator(kanaPool, maxB, pMap)
      }
      const engine = new KanaCatchEngine(canvas, effectiveParams, {
        nextQuestion: nextQ,
        onNewQuestion: (q) => { setCurrentQ(q) },
        onCorrect: (id) => { void handleCorrect(id) },
        onMiss:    (id) => { void handleMiss(id) },
        onComplete: (c, t) => { void handleComplete(c, t) },
      })
      engine.start()
      return () => engine.destroy()
    })()
    return () => { active = false }
  }, [gameState, gameKey, subMode, unitId, pooledPairs, pooledWords, effectiveParams, paramsOverride, kanaPool, handleCorrect, handleMiss, handleComplete])

  const handleStart = useCallback((mode: KanaCatchSubMode, uid?: string) => {
    sessionSaved.current = false
    correctIds.current = []
    setScore(0); setCurrentQ(null); setXpResult(null)
    setSubMode(mode); setUnitId(uid)
    startSession()
    setGameState('playing')
    setGameKey(k => k + 1)
  }, [startSession])

  const handleRestart = useCallback(() => {
    sessionSaved.current = false
    correctIds.current = []
    setScore(0); setCurrentQ(null); setXpResult(null)
    startSession()
    setGameState('playing')
    setGameKey(k => k + 1)
  }, [startSession])

  // Auto-start when launched from adventure mode
  useEffect(() => {
    if (adventureAutoStarted.current || !adventure.pending || gameState !== 'setup') return
    const mode = KANA_CATCH_MODE[adventure.pending.gameMode]
    if (!mode) return
    adventureAutoStarted.current = true
    const ov = adventure.pending.configOverrides
    if (Array.isArray(ov.unitPool)) {
      const poolLessons = LESSONS.filter(l => (ov.unitPool as string[]).includes(l.unit_id))
      setPooledPairs(poolLessons.flatMap(l => l.target_kana_pairs))
      setPooledWords(poolLessons.flatMap(l => l.concept_words))
    }
    const override: { roundLength?: number; fallSpeed?: number; maxBubbles?: number; highlightCorrectAnswer?: boolean } = {}
    if (typeof ov.roundLength === 'number') override.roundLength = ov.roundLength
    if (typeof ov.fallSpeed === 'number') override.fallSpeed = ov.fallSpeed
    if (typeof ov.maxBubbles === 'number') override.maxBubbles = ov.maxBubbles
    if (typeof ov.highlightCorrectAnswer === 'boolean') override.highlightCorrectAnswer = ov.highlightCorrectAnswer
    setParamsOverride(override)
    const uid = ov.unitId
    handleStart(mode, typeof uid === 'string' ? uid : undefined)
  }, [adventure.pending, gameState, handleStart])

  if (gameState === 'setup') {
    return (
      <KanaCatchSetup
        lessons={LESSONS}
        onStart={handleStart}
        onBack={adventure.session ? adventure.cancelChallenge : undefined}
      />
    )
  }

  if (gameState === 'results') {
    const accuracy = effectiveParams.roundLength > 0 ? score / effectiveParams.roundLength : 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        {xpResult?.leveledUp && (
          <LevelUpModal newLevel={xpResult.pet.level} evolvedToStage={xpResult.evolvedToStage}
            onClose={() => setXpResult(null)} />
        )}
        <h1 className="text-5xl font-bold text-pink-500">{t('done')}</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {score}</div>
        <p className="text-3xl text-gray-600">{score} / {effectiveParams.roundLength} {t('correct')}</p>
        {adventure.isActive ? (
          <button type="button"
            onClick={() => adventure.submitResult(accuracy, calculateXpGain(score, effectiveParams.roundLength))}
            className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-indigo-500 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
            {t('adventureReturn')}
          </button>
        ) : (
          <>
            <button type="button" aria-label={t('playAgainAria')} onClick={handleRestart}
              className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform">
              {t('playAgain')}
            </button>
            <button type="button" aria-label={t('kanaCatchChangeMode')} onClick={() => setGameState('setup')}
              className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-orange-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
              {t('kanaCatchChangeMode')}
            </button>
            <button type="button" aria-label={t('homeAria')} onClick={() => navigate('/play')}
              className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-blue-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
              {t('home')}
            </button>
          </>
        )}
      </div>
    )
  }

  const progress = Math.max(0, (score / effectiveParams.roundLength) * 100)

  return (
    <div className="min-h-screen flex flex-col items-center gap-3 p-4 pt-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full max-w-sm flex items-center gap-3">
        <button type="button" aria-label={t('backAria')}
          onClick={() => adventure.isActive ? adventure.cancelChallenge() : setGameState('setup')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-14 text-right">
          {score}/{effectiveParams.roundLength}
        </span>
      </div>

      {subMode === 'word_to_image' && currentQ?.centerContent ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-7xl select-none">{currentQ.centerContent}</span>
          <button type="button" aria-label={t('listenAgainAria')}
            onClick={() => currentQ && speak(currentQ.ttsText)}
            className="w-11 h-11 rounded-full bg-orange-100 text-xl flex items-center justify-center hover:bg-orange-200">
            🔊
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-gray-700">{t('kanaCatchListen2')}</p>
          <button type="button" aria-label={t('listenAgainAria')}
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
