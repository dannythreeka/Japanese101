import { useCheckpointState, usePracticeSession } from '../../hooks/usePracticeSession'
import { getActiveProfileId } from '../../db'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PetState, KanaCatchSubMode, ConceptWord } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
import { kanaData, vocabData, lessonData } from '../../data/loaders'
import { playSfx } from '../../lib/audio'
import { speak } from '../../lib/tts'
import { getOrCreatePet } from '../../db'
import { calculateXpGain } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import PetAvatar from '../../components/PetAvatar'
import { KanaCatchEngine, CANVAS_W, CANVAS_H } from './KanaCatchEngine'
import type { QuestionConfig, EngineParams } from './KanaCatchEngine'
import {
  buildPool, buildParams, loadProgressMap,
  makeListenGenerator, makeKatakanaListenGenerator, makeMinimalPairGenerator, makeWordToImageGenerator,
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
  const [profileId] = useState(getActiveProfileId)
  const navigate = useNavigate()
  const practice = usePracticeSession()
  const [restored] = useState(() => practice.session)
  const answer = practice.answer
  const save = practice.save
  const { ageMode, kanaDifficulty, startSession } = useAppStore()
  const adventure = useAdventureChallenge()
  const t = useT()
  const [initialChallenge] = useState(() => adventure.pending)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<KanaCatchEngine | null>(null)
  const sessionSaved = useRef(false)
  const correctIds = useRef<string[]>([])

  const [gameState, setGameState] = useCheckpointState<GameState>('gameState', initialChallenge ? 'playing' : 'setup')
  const [currentQ, setCurrentQ] = useState<QuestionConfig | null>(null)
  const [score, setScore] = useState(()=>practice.summary.completed)
  const [firstScore, setFirstScore] = useState(()=>practice.summary.correct)
  const [gameError, setGameError] = useState(false)
  const [audioState, setAudioState] = useState<'loading'|'ready'|'error'>('loading')
  const [bounce, setBounce] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const [pet, setPet] = useState<PetState | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [subMode, setSubMode] = useCheckpointState<KanaCatchSubMode>('subMode', initialChallenge ? (KANA_CATCH_MODE[initialChallenge.gameMode] ?? 'listen') : 'listen')
  const [unitId, setUnitId] = useCheckpointState<string | undefined>('unitId', typeof initialChallenge?.configOverrides.unitId === 'string' ? initialChallenge.configOverrides.unitId : undefined)
  const [pooledPairs] = useCheckpointState<string[][] | null>('pooledPairs', () => Array.isArray(initialChallenge?.configOverrides.unitPool) ? LESSONS.filter(l => (initialChallenge.configOverrides.unitPool as string[]).includes(l.unit_id)).flatMap(l => l.target_kana_pairs) : null)
  const [pooledWords] = useCheckpointState<ConceptWord[] | null>('pooledWords', () => Array.isArray(initialChallenge?.configOverrides.unitPool) ? LESSONS.filter(l => (initialChallenge.configOverrides.unitPool as string[]).includes(l.unit_id)).flatMap(l => l.concept_words) : null)
  const [pausedQ, setPausedQ] = useState<QuestionConfig | null>(null)
  const resumeRef = useRef<(() => void) | null>(null)
  const [kanaPoolOverride] = useCheckpointState<typeof ALL_KANA | null>('kanaPoolOverride', () => Array.isArray(initialChallenge?.configOverrides.kanaPool) ? ALL_KANA.filter(k => (initialChallenge.configOverrides.kanaPool as string[]).includes(k.hiragana)) : null)
  const [paramsOverride] = useCheckpointState<{
    roundLength?: number; fallSpeed?: number; maxBubbles?: number; highlightCorrectAnswer?: boolean; showRomajiHint?: boolean
  }>('paramsOverride', () => initialChallenge?.configOverrides ?? {})

  const baseParams = useMemo(() => buildParams(ageMode), [ageMode])
  const kanaPool   = useMemo(() => buildPool(ALL_KANA, ageMode, kanaDifficulty), [ageMode, kanaDifficulty])
  const effectiveParams = useMemo((): EngineParams => ({
    fallSpeed:   paramsOverride.fallSpeed   ?? baseParams.fallSpeed,
    showRomaji:  paramsOverride.showRomajiHint ?? baseParams.showRomaji,
    requireAudio: subMode !== 'word_to_image',
    roundLength: paramsOverride.roundLength ?? baseParams.roundLength,
    highlightCorrectAnswer: paramsOverride.highlightCorrectAnswer ?? false,
  }), [baseParams, paramsOverride, subMode])

  useEffect(() => { let active=true; void getOrCreatePet(profileId).then(value=>{if(active)setPet(value)}); return()=>{active=false} }, [profileId])

  useEffect(() => {
    if (pausedQ) speak(pausedQ.ttsText)
  }, [pausedQ])

  const alive = practice.alive
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (bounceTimer.current) clearTimeout(bounceTimer.current) }, [])
  const handleCorrect = useCallback(async (itemId: string) => {
    playSfx('correct')
    setScore(s => s + 1)
    setBounce(true)
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => { if (alive()) setBounce(false) }, 600)
    correctIds.current = [...correctIds.current, itemId]
  }, [alive])

  const handleMiss = useCallback(() => { playSfx('wrong') }, [])

  const finish = practice.finish
  const handleComplete = useCallback(async (correct: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    setFirstScore(correct)
    const result = await finish()
    if (!alive()) return
    setPet(result.pet)
    if (result.leveledUp) { playSfx('levelup'); setXpResult(result) }
    setGameState('results')
  }, [finish, alive, setGameState])

  useEffect(() => {
    if (gameState !== 'playing' || gameError) return
    const canvas = canvasRef.current
    if (!canvas) return
    let active = true
    let engine: KanaCatchEngine | null = null
    void (async () => {
      const pMap = await loadProgressMap(profileId)
      if (!active) return
      const lesson = LESSONS.find(l => l.unit_id === unitId)
      const activePairs = pooledPairs ?? lesson?.target_kana_pairs
      const activeWords = pooledWords ?? lesson?.concept_words
      const maxB = paramsOverride.maxBubbles ?? (effectiveParams.showRomaji ? 3 : 5)
      let nextQ: () => QuestionConfig
      if (subMode === 'minimal_pair') {
        nextQ = makeMinimalPairGenerator(activePairs ?? [], ALL_KANA, maxB, pMap)
      } else if (subMode === 'word_to_image') {
        nextQ = makeWordToImageGenerator(activeWords ?? [], ALL_VOCAB, maxB, pMap)
      } else if (subMode === 'listen_katakana') {
        nextQ = makeKatakanaListenGenerator(kanaPoolOverride ?? kanaPool, maxB, pMap)
      } else {
        nextQ = makeListenGenerator(kanaPoolOverride ?? kanaPool, maxB, pMap)
      }
      const summary = restored.attempts
      const completed = Object.values(summary).filter(a => a.completed).length
      const firstCorrect = Object.values(summary).filter(a => a.firstAnswerCorrect && !a.hintUsed).length
      let index = completed
      const generate = nextQ
      nextQ = () => {
        const key = `q:${index}`
        const previous = restored.checkpoint[key]
        const q = previous && !summary[key]?.completed ? previous as QuestionConfig : generate()
        void save({ [key]: q }).catch(() => {})
        return q
      }
      await save({}, effectiveParams.roundLength)
      if (!active) return
      engine = new KanaCatchEngine(canvas, { ...effectiveParams, initialQuestionIndex: completed, initialFirstCorrect: firstCorrect, initialWrong: summary[`q:${completed}`]?.firstAnswerCorrect === false }, {
        nextQuestion: nextQ,
        onNewQuestion: (q) => { setCurrentQ(q) },
        onAnswer: async (n, itemId, correct) => {
          const type = ALL_KANA.some(k => k.id === itemId) ? 'kana' : 'vocab'
          await answer(`q:${n}`, itemId, type, correct, !!effectiveParams.highlightCorrectAnswer || effectiveParams.showRomaji)
          if (correct !== false) index = n + 1
        },
        onCorrect: (id) => { void handleCorrect(id) },
        onMiss:    () => { handleMiss() },
        onComplete: (c) => { void handleComplete(c) },
        onError: () => { setGameError(true) },
        onAudioState: setAudioState,
        onPauseAfterCorrect: (q, resume) => {
          resumeRef.current = resume
          setPausedQ(q)
        },
      })
      engineRef.current = engine
      engine.start()
    })().catch(() => { if (active) setGameError(true) })
    return () => { active = false; engine?.destroy(); engineRef.current = null }
  }, [gameState, gameKey, subMode, unitId, pooledPairs, pooledWords, effectiveParams, paramsOverride, kanaPool, kanaPoolOverride, handleCorrect, handleMiss, handleComplete, gameError, restored, answer, save, profileId])

  const handleStart = useCallback((mode: KanaCatchSubMode, uid?: string) => {
    sessionSaved.current = false
    correctIds.current = []
    setScore(0); setCurrentQ(null); setXpResult(null)
    setFirstScore(0); setGameError(false)
    setSubMode(mode); setUnitId(uid)
    startSession()
    setGameState('playing')
    setGameKey(k => k + 1)
  }, [startSession, setGameState, setSubMode, setUnitId])

  const handleRestart = useCallback(() => {
    void practice.restart({ gameState: 'playing', subMode, unitId, paramsOverride, pooledPairs, pooledWords, kanaPoolOverride })
  }, [practice, subMode, unitId, paramsOverride, pooledPairs, pooledWords, kanaPoolOverride])

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
    const accuracy = effectiveParams.roundLength > 0 ? firstScore / effectiveParams.roundLength : 0
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
        {xpResult?.leveledUp && (
          <LevelUpModal newLevel={xpResult.pet.level} evolvedToStage={xpResult.evolvedToStage}
            onClose={() => setXpResult(null)} />
        )}
        <h1 className="text-5xl font-bold text-pink-500">{t('done')}</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {practice.session.reward?.stars ?? practice.summary.correct}</div>
        <p className="text-3xl text-gray-600">{t('firstAccuracy')}: {Math.round(accuracy * 100)}% ({firstScore}/{effectiveParams.roundLength})</p>
        <p>{t('practiceCompletion')}: 100%</p>
        {adventure.isActive ? (
          <button type="button"
            onClick={() => adventure.submitResult(accuracy, calculateXpGain(firstScore, effectiveParams.roundLength))}
            className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-indigo-500 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform">
            {t('adventureReturn')}
          </button>
        ) : (
          <>
            <button type="button" aria-label={t('playAgainAria')} onClick={handleRestart}
              className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform">
              {t('playAgain')}
            </button>
            <button type="button" aria-label={t('kanaCatchChangeMode')} onClick={() => { void practice.restart({gameState:'setup'}) }}
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

  if (gameError) return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-6" onClick={handleRestart}>{t('retry')}</button><button className="min-h-16 px-6" onClick={() => adventure.isActive ? adventure.cancelChallenge() : setGameState('setup')}>{t('back')}</button></div>

  return (
    <div className="relative min-h-screen flex flex-col items-center gap-3 p-4 pt-6 bg-gradient-to-b from-orange-50 to-white">
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
            onClick={() => engineRef.current?.playQuestionAudio()}
            className="w-11 h-11 rounded-full bg-orange-100 text-xl flex items-center justify-center hover:bg-orange-200">
            🔊
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-gray-700">{t('kanaCatchListen2')}</p>
          <button type="button" aria-label={t('listenAgainAria')}
            onClick={() => engineRef.current?.playQuestionAudio()}
            className="w-12 h-12 rounded-full bg-orange-100 text-2xl flex items-center justify-center hover:bg-orange-200 transition-colors">
            🔊
          </button>
        </div>
      )}

      {audioState === 'error' && <p role="alert">{t('audioUnavailable')}</p>}
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
        className="w-full max-w-sm rounded-2xl shadow-inner bg-gradient-to-b from-sky-100 to-indigo-100" />
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">{currentQ?.items.map(item => <button key={item.id} type="button" className="min-h-16 rounded-2xl bg-white shadow px-3 text-2xl" disabled={effectiveParams.requireAudio && audioState !== 'ready'} onClick={() => engineRef.current?.choose(item.id)}>{item.display}</button>)}</div>
      <button className="min-h-16 px-6" onClick={() => engineRef.current?.skip()}>{t('skipQuestion')}</button>

      <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${bounce ? '-translate-y-4 scale-110' : ''}`}>
        {pet ? <PetAvatar pet={pet} size="sm" /> : <span className="text-5xl">🐾</span>}
        {score > 0 && <span className="text-xl font-bold text-yellow-500">⭐ × {score}</span>}
      </div>

      {/* Correct answer reveal overlay */}
      {pausedQ && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-900/60 z-20 rounded-none">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl mx-4 w-full max-w-sm">
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-300"
              style={{ background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fbbf24)' }}
            >
              <span className="text-5xl font-bold text-sky-900 select-none">
                {pausedQ.items.find(i => i.id === pausedQ.targetId)?.display ?? ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPausedQ(null)
                resumeRef.current?.()
                resumeRef.current = null
              }}
              className="min-w-16 min-h-16 px-10 py-4 rounded-3xl bg-emerald-400 text-white text-2xl font-bold shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
            >
              {t('kanaCatchNext')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
