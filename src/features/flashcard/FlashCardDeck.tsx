import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VocabWord } from '../../types'
import { getOrCreateProgress, saveProgress, saveSession } from '../../db'
import { updateAfterCorrect, updateAfterIncorrect } from '../../lib/srs'
import { useAppStore } from '../../store/useAppStore'
import SpeakButton from '../../components/SpeakButton'
import FlashCard from './FlashCard'
import rawVocab from '../../data/vocabulary.json'

const ALL_WORDS = rawVocab as VocabWord[]

const UNIT_LABELS: Record<string, string> = {
  topic_animals: '動物',
  topic_food: '食物',
  topic_colors: '顏色',
  topic_numbers: '數字',
  topic_body: '身體',
  topic_feelings: '心情',
  topic_daily: '日常',
}

const UNIT_JAPANESE: Record<string, string> = {
  topic_animals: 'どうぶつ',
  topic_food: 'たべもの',
  topic_colors: 'いろ',
  topic_numbers: 'かず',
  topic_body: 'からだ',
  topic_feelings: 'きもち',
  topic_daily: 'にちじょう',
}

const unitIds = [...new Set(ALL_WORDS.map((w) => w.unit))]

export default function FlashCardDeck() {
  const navigate = useNavigate()
  const { startSession, endSession } = useAppStore()
  const [unitId, setUnitId] = useState(unitIds[0])
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [wordIdx, setWordIdx] = useState(0)
  const sessionSaved = useRef(false)

  const unitWords = ALL_WORDS.filter((w) => w.unit === unitId)

  useEffect(() => {
    startSession()
    return () => {}
  }, [startSession])

  useEffect(() => {
    setQueue([...unitWords])
    setWordIdx(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId])

  const handleKnow = async () => {
    const word = queue[wordIdx]
    const record = await getOrCreateProgress(word.id, 'vocab')
    await saveProgress(updateAfterCorrect(record))
    if (wordIdx + 1 >= queue.length) {
      await endRound(queue.length)
    } else {
      setWordIdx((i) => i + 1)
    }
  }

  const handleDontKnow = async () => {
    const word = queue[wordIdx]
    const record = await getOrCreateProgress(word.id, 'vocab')
    await saveProgress(updateAfterIncorrect(record))
    const newQueue = [...queue]
    newQueue.push(newQueue[wordIdx])
    setQueue(newQueue)
    setWordIdx((i) => i + 1)
  }

  const endRound = async (total: number) => {
    if (sessionSaved.current) return
    sessionSaved.current = true
    const duration = endSession()
    await saveSession({
      id: `flashcard-${Date.now()}`,
      date: Date.now(),
      durationMs: duration,
      feature: 'flashcard',
      correct: unitWords.length,
      total,
    })
    setWordIdx(0)
    setQueue([...unitWords])
    sessionSaved.current = false
  }

  const currentWord = queue[wordIdx]

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 pt-6">
      <div className="w-full max-w-md flex items-center gap-3">
        <button
          type="button"
          aria-label="ホームにもどる"
          onClick={() => navigate('/kid')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          ←
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl font-bold text-pink-500">{UNIT_LABELS[unitId] ?? unitId}</span>
          <SpeakButton text={UNIT_JAPANESE[unitId] ?? unitId} size="sm" />
        </div>
        <span className="text-2xl font-bold text-gray-600">
          {Math.min(wordIdx + 1, queue.length)}/{queue.length}
        </span>
      </div>

      <div className="w-full max-w-md overflow-x-auto pb-2">
        <div className="flex gap-2">
          {unitIds.map((uid) => (
            <button
              key={uid}
              type="button"
              aria-label={UNIT_LABELS[uid] ?? uid}
              onClick={() => {
                sessionSaved.current = false
                setUnitId(uid)
              }}
              className={`px-4 py-2 rounded-2xl text-xl font-bold whitespace-nowrap transition-all ${
                uid === unitId
                  ? 'bg-pink-400 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-pink-100'
              }`}
            >
              {UNIT_LABELS[uid] ?? uid}
            </button>
          ))}
        </div>
      </div>

      {currentWord ? (
        <FlashCard
          word={currentWord}
          onKnow={() => { void handleKnow() }}
          onDontKnow={() => { void handleDontKnow() }}
        />
      ) : (
        <div className="flex flex-col items-center gap-6 mt-12">
          <p className="text-4xl font-bold text-green-500">よくできました！</p>
          <button
            type="button"
            aria-label="もういちど"
            onClick={() => {
              sessionSaved.current = false
              setQueue([...unitWords])
              setWordIdx(0)
            }}
            className="min-w-16 min-h-16 px-8 py-4 rounded-3xl bg-green-400 text-white text-3xl font-bold shadow-lg hover:scale-105 transition-transform"
          >
            もういちど！
          </button>
        </div>
      )}
    </div>
  )
}
