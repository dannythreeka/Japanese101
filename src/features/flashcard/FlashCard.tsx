import { useState } from 'react'
import type { Word } from "../../types"
import SpeakButton from '../../components/SpeakButton'

interface FlashCardProps {
  word: Word
  onKnow: () => void
  onDontKnow: () => void
}

export default function FlashCard({ word, onKnow, onDontKnow }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)

  const handleCardClick = () => {
    setFlipped((f) => !f)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div
        className="w-full"
        style={{ perspective: '1000px' }}
        aria-label={`フラッシュカード: ${word.kana}`}
      >
        <div
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleCardClick()
          }}
          aria-label={flipped ? '翻到背面' : '翻到正面'}
          style={{
            transition: 'transform 0.5s',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            position: 'relative',
            height: '280px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-3xl shadow-xl bg-white flex flex-col items-center justify-center gap-4"
          >
            <span className="text-8xl leading-none">{word.emoji}</span>
            <span className="text-4xl font-bold text-gray-800">{word.kana}</span>
            <SpeakButton text={word.kana} size="md" />
          </div>

          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-3xl shadow-xl bg-yellow-50 flex flex-col items-center justify-center gap-3 px-6"
          >
            <span className="text-4xl font-bold text-gray-800 text-center">{word.meaning_zh}</span>
            <span className="text-2xl text-gray-500">{word.romaji}</span>
            <SpeakButton text={word.kana} size="sm" />
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4 w-full">
          <button
            type="button"
            aria-label="記住了"
            onClick={onKnow}
            className="flex-1 min-h-20 rounded-2xl bg-green-400 text-white text-2xl font-bold shadow-lg hover:bg-green-500 hover:scale-105 transition-all"
          >
            記住了！✓
          </button>
          <button
            type="button"
            aria-label="再看一次"
            onClick={onDontKnow}
            className="flex-1 min-h-20 rounded-2xl bg-red-400 text-white text-2xl font-bold shadow-lg hover:bg-red-500 hover:scale-105 transition-all"
          >
            再看一次 ✗
          </button>
        </div>
      )}
    </div>
  )
}
