import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaItem } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { speak } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import { getOrCreateProgress, saveProgress, saveSession } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import kanaList from '../../data/kana.json'
import KanaCard from './KanaCard'

const ALL_KANA = kanaList as KanaItem[]
const TOTAL_QUESTIONS = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickWrongChoices(correct: KanaItem, pool: KanaItem[], count: number): KanaItem[] {
  const others = pool.filter((k) => k.id !== correct.id)
  return shuffle(others).slice(0, count)
}

export default function KanaMatchGame() {
  const navigate = useNavigate()
  const { kanaDifficulty, kanaMode, addStars, startSession, endSession } = useAppStore()

  const filteredKana = useMemo<KanaItem[]>(() => {
    if (kanaDifficulty === 'all') return ALL_KANA
    return ALL_KANA.filter((k) => k.difficulty === kanaDifficulty)
  }, [kanaDifficulty])

  const [queue, setQueue] = useState<KanaItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [choices, setChoices] = useState<KanaItem[]>([])
  const [answered, setAnswered] = useState(false)
  const [correctId, setCorrectId] = useState<string | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [cardAnim, setCardAnim] = useState('')
  const [showCompletion, setShowCompletion] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const sessionSaved = useRef(false)
  const correctKanaIds = useRef<string[]>([])

  useEffect(() => {
    startSession()
    return () => {}
  }, [startSession])

  useEffect(() => {
    if (filteredKana.length === 0) return
    const q = shuffle(filteredKana).slice(0, TOTAL_QUESTIONS)
    setQueue(q)
    setCurrentIdx(0)
    setScore(0)
    setShowCompletion(false)
    correctKanaIds.current = []
  }, [filteredKana])

  useEffect(() => {
    if (queue.length === 0 || currentIdx >= queue.length) return
    const current = queue[currentIdx]
    const pool = filteredKana.length >= 4 ? filteredKana : ALL_KANA
    const wrong = pickWrongChoices(current, pool, 3)
    setChoices(shuffle([current, ...wrong]))
    setAnswered(false)
    setCorrectId(null)
    setWrongId(null)
    setCardAnim('')
  }, [queue, currentIdx, filteredKana])

  const handleChoice = async (chosen: KanaItem) => {
    if (answered) return
    setAnswered(true)
    const current = queue[currentIdx]
    const isCorrect = chosen.id === current.id

    const record = await getOrCreateProgress(current.id, 'kana')
    if (isCorrect) {
      setCorrectId(chosen.id)
      setCardAnim('animate-bounce-in')
      speak('すごい！')
      playSfx('correct')
      addStars(1)
      correctKanaIds.current = [...correctKanaIds.current, current.id]
      const updated = updateAfterCorrect(record)
      await saveProgress(updated)
      setScore((s) => s + 1)
      setTimeout(() => { advance(currentIdx) }, 1200)
    } else {
      setWrongId(chosen.id)
      speak('もういちど！')
      playSfx('wrong')
      const updated = updateAfterIncorrect(record)
      await saveProgress(updated)
      setTimeout(() => {
        setAnswered(false)
        setWrongId(null)
      }, 800)
    }
  }

  const advance = (idx: number) => {
    const next = idx + 1
    if (next >= TOTAL_QUESTIONS || next >= queue.length) {
      void finishSession(score + 1)
    } else {
      setCurrentIdx(next)
    }
  }

  const finishSession = async (finalScore: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({
      id: `kana-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'kana',
      correct: finalScore,
      total: TOTAL_QUESTIONS,
    })
    const xp = calculateXpGain(finalScore, TOTAL_QUESTIONS)
    const result = await addXpToPet(xp, correctKanaIds.current)
    if (result.leveledUp) {
      playSfx('levelup')
      setXpResult(result)
    }
    setShowCompletion(true)
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-500">よみこみちゅう…</p>
      </div>
    )
  }

  if (showCompletion) {
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
        <p className="text-3xl text-gray-600">{score} / {TOTAL_QUESTIONS} せいかい</p>
        <button
          type="button"
          aria-label="もういちどあそぶ"
          onClick={() => {
            sessionSaved.current = false
            correctKanaIds.current = []
            const q = shuffle(filteredKana).slice(0, TOTAL_QUESTIONS)
            setQueue(q)
            setCurrentIdx(0)
            setScore(0)
            setShowCompletion(false)
            setXpResult(null)
            startSession()
          }}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          もういちど！
        </button>
        <button
          type="button"
          aria-label="ホームにもどる"
          onClick={() => navigate('/play')}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-blue-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          ホーム
        </button>
      </div>
    )
  }

  const current = queue[currentIdx]
  const progress = (currentIdx / TOTAL_QUESTIONS) * 100

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-6">
      <div className="w-full max-w-md flex items-center gap-3">
        <button
          type="button"
          aria-label="ホームにもどる"
          onClick={() => navigate('/play')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-12 text-right">
          {currentIdx}/{TOTAL_QUESTIONS}
        </span>
      </div>

      <div className="w-full max-w-md">
        <KanaCard
          item={current}
          mode={kanaMode}
          showRomaji={false}
          className={`w-full min-h-52 ${cardAnim}`}
        />
      </div>

      <p className="text-3xl font-bold text-gray-700">どのよみかた？</p>

      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        {choices.map((choice) => {
          let btnClass =
            'min-w-16 min-h-16 h-20 rounded-2xl text-2xl font-bold shadow-md transition-all duration-150 '
          if (correctId === choice.id) {
            btnClass += 'bg-green-400 text-white animate-bounce-in'
          } else if (wrongId === choice.id) {
            btnClass += 'bg-red-400 text-white animate-shake'
          } else {
            btnClass += 'bg-white text-gray-700 hover:bg-yellow-100 hover:scale-105'
          }
          return (
            <button
              key={choice.id}
              type="button"
              aria-label={choice.romaji}
              onClick={() => { void handleChoice(choice) }}
              className={btnClass}
            >
              {choice.romaji}
            </button>
          )
        })}
      </div>
    </div>
  )
}
