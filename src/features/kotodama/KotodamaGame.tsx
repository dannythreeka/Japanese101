import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
import { speak } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import { saveSession } from '../../db'
import { addXpToPet } from '../../lib/pet'
import { buildKotodamaRound } from './KotodamaEngine'
import { lessonData } from '../../data/loaders'
import { SCENE_REGISTRY } from './scenes'
import { useT } from '../../hooks/useT'
import {
  createMicSession,
  DEFAULT_CONFIG,
  EASY_CONFIG,
  type MicSession,
  type MicOutcome,
} from '../../lib/mic'
import type { MicMode } from '../../types'

type GamePhase = 'initial' | 'listening' | 'success' | 'done'

const ROUNDS = 3
const MAX_ATTEMPTS = 5
const ALL_LESSONS = lessonData()

export default function KotodamaGame() {
  const navigate = useNavigate()
  const { micMode, ageMode, addStars, startSession, endSession } = useAppStore()
  const adventure = useAdventureChallenge()
  const t = useT()
  const outcomeMsg: Record<MicOutcome, string> = {
    silent:  t('outcomeSilent'),
    weak:    t('outcomeWeak'),
    good:    t('outcomeGood'),
    perfect: t('outcomePerfect'),
  }

  // Redirect if mic is disabled
  useEffect(() => {
    if (micMode === 'off') {
      if (adventure.session) {
        adventure.cancelChallenge()
      } else {
        navigate('/play', { replace: true })
      }
    }
  }, [micMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const [words] = useState(() => {
    const ov = adventure.pending?.configOverrides
    const pool = ov?.unitPool
    const count = typeof ov?.roundLength === 'number' ? ov.roundLength : ROUNDS
    if (Array.isArray(pool)) {
      const filtered = ALL_LESSONS.filter(l => (pool as string[]).includes(l.unit_id))
      return buildKotodamaRound(filtered.length > 0 ? filtered : undefined, count)
    }
    return buildKotodamaRound(undefined, count)
  })
  const [roundIndex, setRoundIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('initial')
  const [outcome, setOutcome] = useState<MicOutcome | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [roundStars, setRoundStars] = useState<number[]>([])

  const sessionRef = useRef<MicSession | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedRef   = useRef(false)
  const waveBarRefs = useRef<(HTMLDivElement | null)[]>([])
  const rmsRafRef = useRef<number | null>(null)

  const BAR_FACTORS = [0.45, 0.75, 1.0, 0.75, 0.45, 0.65, 0.85, 0.65, 0.45]

  // Keep advance logic in a ref to avoid stale closures in setTimeout
  const advanceRef = useRef<() => void>(() => undefined)
  advanceRef.current = () => {
    if (roundIndex + 1 >= words.length) {
      setPhase('done')
    } else {
      setRoundIndex(r => r + 1)
      setPhase('initial')
      setOutcome(null)
      setAttempts(0)
    }
  }

  // Start session timer on mount; cleanup mic on unmount
  useEffect(() => {
    startSession()
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current)
      sessionRef.current?.stop()
      sessionRef.current = null
    }
  }, [startSession])

  // Speak word when round starts
  useEffect(() => {
    if (phase === 'initial' && words[roundIndex]) {
      speak(words[roundIndex].word, 0.8)
    }
  }, [roundIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save session when game ends
  useEffect(() => {
    if (phase !== 'done' || savedRef.current) return
    savedRef.current = true
    const total = roundStars.reduce((a, b) => a + b, 0)
    addStars(total)
    const duration = endSession()
    void saveSession({
      id: `kotodama-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'kotodama',
      correct: roundStars.filter(s => s > 0).length,
      total: words.length,
    })
    void addXpToPet(total * 10)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drive waveform bars directly via DOM refs — bypass React re-renders at 60fps
  useEffect(() => {
    const resetBars = () => waveBarRefs.current.forEach(el => { if (el) el.style.height = '6px' })
    if (phase !== 'listening') {
      if (rmsRafRef.current !== null) { cancelAnimationFrame(rmsRafRef.current); rmsRafRef.current = null }
      resetBars()
      return
    }
    const MIN_H = 6
    const MAX_H = 56
    const sample = () => {
      const rms = sessionRef.current?.getRms() ?? 0
      waveBarRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.height = `${Math.min(MAX_H, MIN_H + rms * 400 * (BAR_FACTORS[i] ?? 1))}px`
      })
      rmsRafRef.current = requestAnimationFrame(sample)
    }
    rmsRafRef.current = requestAnimationFrame(sample)
    return () => {
      if (rmsRafRef.current !== null) { cancelAnimationFrame(rmsRafRef.current); rmsRafRef.current = null }
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null }
    if (!sessionRef.current) return
    const result = sessionRef.current.stop()
    sessionRef.current = null

    setOutcome(result.outcome)

    if (result.outcome === 'good' || result.outcome === 'perfect') {
      const earned = result.outcome === 'perfect' ? 2 : 1
      setRoundStars(rs => [...rs, earned])
      setPhase('success')
      playSfx('correct')
      setTimeout(() => advanceRef.current(), 2200)
    } else {
      setPhase('initial')
      setAttempts(prev => {
        const next = prev + 1
        if (next >= MAX_ATTEMPTS) {
          setRoundStars(rs => [...rs, 0])
          setTimeout(() => advanceRef.current(), 1500)
        }
        return next
      })
    }
  }, [])

  const startListening = useCallback(async () => {
    if (phase !== 'initial') return
    if (!words[roundIndex]) return
    setPhase('listening')
    setOutcome(null)
    const config = ageMode === 'young' ? EASY_CONFIG : DEFAULT_CONFIG
    try {
      sessionRef.current = await createMicSession(
        config,
        micMode as Exclude<MicMode, 'off'>,
        words[roundIndex].word,
      )
      autoStopRef.current = setTimeout(stopListening, config.maxRecordDurationMs)
    } catch {
      setPhase('initial')
    }
  }, [phase, roundIndex, words, ageMode, micMode, stopListening])

  // ── Done screen ────────────────────────────────────────────
  if (phase === 'done') {
    const total = roundStars.reduce((a, b) => a + b, 0)
    const accuracy = words.length > 0 ? roundStars.filter(s => s > 0).length / words.length : 0
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-4xl font-bold text-indigo-700">{t('kotodamaDone')}</h2>
        <div className="flex items-center gap-2">
          <span className="text-5xl">⭐</span>
          <span className="text-5xl font-bold text-yellow-500">×{total}</span>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          {words.map((w, i) => (
            <div key={w.id} className="flex items-center justify-between bg-white/70 rounded-2xl px-5 py-3 shadow">
              <span className="text-3xl font-bold text-gray-700">{w.word}</span>
              <span className="text-2xl text-gray-500">{w.meaning_zh}</span>
              <span className="text-2xl">{'⭐'.repeat(roundStars[i] ?? 0) || '—'}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {adventure.isActive ? (
            <button
              type="button"
              onClick={() => adventure.submitResult(accuracy, total * 10)}
              className="px-8 py-4 rounded-3xl bg-indigo-500 text-white text-2xl font-bold hover:bg-indigo-600 transition-colors"
            >
              {t('adventureReturn')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/play')}
              className="px-8 py-4 rounded-3xl bg-gray-200 text-2xl font-bold hover:bg-gray-300 transition-colors"
            >
              {t('kotodamaBack')}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              savedRef.current = false
              setRoundStars([])
              setRoundIndex(0)
              setPhase('initial')
              setOutcome(null)
              setAttempts(0)
            }}
            className="px-8 py-4 rounded-3xl bg-indigo-400 text-white text-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg"
          >
            {t('kotodamaAgain')}
          </button>
        </div>
      </div>
    )
  }

  const currentWord = words[roundIndex]
  if (!currentWord) return null

  const SceneComponent = SCENE_REGISTRY[currentWord.kotodama_scene.scene_id]
  const isSuccess = phase === 'success'
  const isListening = phase === 'listening'
  const showRetry = outcome === 'silent' || outcome === 'weak'
  const maxAttemptsReached = attempts >= MAX_ATTEMPTS

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">

      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <button
          type="button"
          aria-label={t('kotodamaBackAria')}
          onClick={() => adventure.isActive ? adventure.cancelChallenge() : navigate('/play')}
          className="w-12 h-12 rounded-full bg-white/70 text-xl flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          ←
        </button>
        <div className="flex gap-2">
          {words.map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-colors ${
              i < roundIndex ? 'bg-yellow-400'
                : i === roundIndex ? 'bg-indigo-500'
                : 'bg-gray-300'
            }`}/>
          ))}
        </div>
        <div className="text-xl font-bold text-indigo-600">{roundIndex + 1}/{words.length}</div>
      </div>

      {/* Scene */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl">
        {SceneComponent ? (
          <SceneComponent success={isSuccess} />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
            {t('kotodamaNoScene')}
          </div>
        )}
      </div>

      {/* Word display */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl font-bold text-indigo-800 tracking-widest">
          {currentWord.word}
        </span>
        <span className="text-2xl text-gray-500">{currentWord.meaning_zh}</span>
      </div>

      {/* Status feedback */}
      <div className="h-10 flex items-center justify-center">
        {isSuccess && (
          <span className="text-3xl font-bold text-emerald-500 animate-bounce">
            {outcome ? outcomeMsg[outcome] : t('kotodamaSuccess')}
          </span>
        )}
        {showRetry && !maxAttemptsReached && (
          <span className="text-2xl font-bold text-orange-500">
            {outcome ? outcomeMsg[outcome] : ''}
          </span>
        )}
        {maxAttemptsReached && !isSuccess && (
          <span className="text-2xl text-gray-400">{t('kotodamaNextWord')}</span>
        )}
        {!isSuccess && !showRetry && !maxAttemptsReached && !isListening && attempts > 0 && (
          <span className="text-xl text-gray-400">{t('kotodamaTryAgain')}</span>
        )}
      </div>

      {/* Waveform — visible only while listening */}
      <div
        aria-hidden="true"
        className={`flex items-end justify-center gap-1.5 h-16 transition-opacity duration-200 ${isListening ? 'opacity-100' : 'opacity-0'}`}
      >
        {BAR_FACTORS.map((_, i) => (
          <div
            key={i}
            ref={el => { waveBarRefs.current[i] = el }}
            style={{ height: '6px', transition: 'height 55ms ease-out' }}
            className="w-2.5 rounded-full bg-indigo-500"
          />
        ))}
      </div>

      {/* Mic button */}
      {!isSuccess && !maxAttemptsReached && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            aria-label={isListening ? t('kotodamaRecordAria') : t('kotodamaSayAria')}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              void startListening()
            }}
            onPointerUp={stopListening}
            onPointerCancel={stopListening}
            disabled={isListening && !sessionRef.current}
            className={`w-28 h-28 rounded-full text-5xl shadow-xl flex items-center justify-center transition-all select-none ${
              isListening
                ? 'bg-red-400 scale-110 shadow-red-300/60 shadow-2xl'
                : 'bg-indigo-400 hover:bg-indigo-500 hover:scale-105 active:scale-95'
            }`}
            style={{}}

          >
            🎤
          </button>
          <p className="text-xl text-indigo-600 font-medium text-center">
            {isListening ? t('kotodamaSaying') : t('kotodamaInstruct')}
          </p>
          {attempts > 0 && !isListening && (
            <p className="text-base text-gray-400">
              {t('kotodamaRemain').replace('{n}', String(MAX_ATTEMPTS - attempts))}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
