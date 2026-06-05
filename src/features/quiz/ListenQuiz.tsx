import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Word } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { speakWithCallback } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import { getOrCreateProgress, saveProgress, saveSession } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { calculateXpGain, addXpToPet } from '../../lib/pet'
import type { XpResult } from '../../lib/pet'
import LevelUpModal from '../play/LevelUpModal'
import SpeakButton from '../../components/SpeakButton'
import { vocabData } from '../../data/loaders'
import { useT } from '../../hooks/useT'

const allWords: Word[] = vocabData()
const TOTAL_ROUNDS = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickChoices(correct: Word, pool: Word[]): Word[] {
  const others = pool.filter((w) => w.id !== correct.id)
  const wrong = shuffle(others).slice(0, 3)
  return shuffle([correct, ...wrong])
}

interface QuizRound {
  correct: Word
  choices: Word[]
}

function makeRound(pool: Word[]): QuizRound {
  const correct = pool[Math.floor(Math.random() * pool.length)]
  const choices = pickChoices(correct, pool)
  return { correct, choices }
}

export default function ListenQuiz() {
  const navigate = useNavigate()
  const { addStars, startSession, endSession } = useAppStore()
  const t = useT()
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const [round, setRound] = useState<QuizRound>(() => makeRound(allWords))
  const [roundNum, setRoundNum] = useState(1)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [correctId, setCorrectId] = useState<string | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [xpResult, setXpResult] = useState<XpResult | null>(null)
  const sessionSaved = useRef(false)

  const playQuestion = useCallback((kana: string) => {
    speakWithCallback(kana, () => {}, 0.8)
  }, [])

  useEffect(() => {
    startSession()
    return () => {}
  }, [startSession])

  useEffect(() => {
    const timer = setTimeout(() => {
      playQuestion(round.correct.kana)
    }, 500)
    return () => clearTimeout(timer)
  }, [round, playQuestion])

  const handleChoice = async (chosen: Word) => {
    if (answered) return
    setAnswered(true)
    const isCorrect = chosen.id === round.correct.id

    const record = await getOrCreateProgress(round.correct.id, 'vocab')

    if (isCorrect) {
      setCorrectId(chosen.id)
      speakWithCallback('やった！', () => {}, 0.9)
      playSfx('correct')
      addStars(1)
      await saveProgress(updateAfterCorrect(record))
      const nextScore = score + 1
      setScore(nextScore)
      setTimeout(() => {
        if (roundNum >= TOTAL_ROUNDS) {
          void finishSession(nextScore)
        } else {
          setRound(makeRound(allWords))
          setRoundNum((r) => r + 1)
          setAnswered(false)
          setCorrectId(null)
          setWrongId(null)
        }
      }, 1500)
    } else {
      setWrongId(chosen.id)
      speakWithCallback('もういちど！', () => {
        setTimeout(() => playQuestion(round.correct.kana), 300)
      }, 0.9)
      playSfx('wrong')
      await saveProgress(updateAfterIncorrect(record))
      setTimeout(() => {
        setAnswered(false)
        setWrongId(null)
      }, 800)
    }
  }

  const finishSession = async (finalScore: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({
      id: `quiz-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'quiz',
      correct: finalScore,
      total: TOTAL_ROUNDS,
    })
    const xp = calculateXpGain(finalScore, TOTAL_ROUNDS)
    const result = await addXpToPet(xp)
    if (result.leveledUp) {
      playSfx('levelup')
      setXpResult(result)
    }
    setShowResults(true)
  }

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
        <h1 className="text-5xl font-bold text-pink-500">{t('done')}</h1>
        <div className="text-4xl font-bold text-yellow-500">⭐ × {score}</div>
        <p className="text-3xl text-gray-600">{score} / {TOTAL_ROUNDS} {t('correct')}</p>
        <button
          type="button"
          aria-label={t('playAgainAria')}
          onClick={() => {
            sessionSaved.current = false
            setRound(makeRound(allWords))
            setRoundNum(1)
            setScore(0)
            setAnswered(false)
            setCorrectId(null)
            setWrongId(null)
            setShowResults(false)
            setXpResult(null)
            startSession()
          }}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {t('playAgain')}
        </button>
        <button
          type="button"
          aria-label={t('homeAria')}
          onClick={() => navigate('/play')}
          className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-blue-400 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          {t('home')}
        </button>
      </div>
    )
  }

  const progress = ((roundNum - 1) / TOTAL_ROUNDS) * 100

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-6">
      <div className="w-full max-w-md flex items-center gap-3">
        <button
          type="button"
          aria-label={t('homeAria')}
          onClick={() => navigate('/play')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          ←
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-2xl font-bold text-gray-600 min-w-12 text-right">
          {roundNum}/{TOTAL_ROUNDS}
        </span>
      </div>

      <h1 className="text-4xl font-bold text-gray-800">{t('listenQuizWhich')}</h1>

      <div className="flex items-center gap-4">
        <SpeakButton text={round.correct.kana} size="lg" />
        <span className="text-2xl text-gray-500">{t('listenQuizListen')}</span>
      </div>

      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-2">
        {round.choices.map((choice) => {
          let btnClass =
            'w-full h-28 rounded-3xl shadow-md transition-all duration-150 flex flex-col items-center justify-center gap-1 border-4 '
          if (correctId === choice.id) {
            btnClass += 'border-green-400 bg-green-100 animate-bounce-in'
          } else if (wrongId === choice.id) {
            btnClass += 'border-red-400 bg-red-100 animate-shake'
          } else {
            btnClass += 'border-transparent bg-white hover:bg-yellow-50 hover:scale-105'
          }
          return (
            <button
              key={choice.id}
              type="button"
              aria-label={choice.meaning_zh}
              onClick={() => { void handleChoice(choice) }}
              className={btnClass}
            >
              {imgErrors.has(choice.id) ? (
                <span className="text-5xl leading-none select-none">
                  {choice.emoji ?? choice.meaning_zh}
                </span>
              ) : (
                <img
                  src={choice.image.src}
                  alt={choice.meaning_zh}
                  className="w-16 h-16 object-contain"
                  onError={() => setImgErrors(prev => new Set([...prev, choice.id]))}
                />
              )}
              <span className="text-xs text-gray-500">{choice.meaning_zh}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
