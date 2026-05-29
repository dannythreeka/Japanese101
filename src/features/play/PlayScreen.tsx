import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreatePet } from '../../db'
import { useAppStore } from '../../store/useAppStore'
import { preloadSfx, playSfx } from '../../lib/audio'
import type { PetState } from '../../types'

const SPECIES_EMOJI: Record<PetState['species'], string> = {
  fox: '🦊',
  cat: '🐱',
  dragon: '🐲',
}

const XP_PER_LEVEL = 100

function xpToNextLevel(pet: PetState): number {
  return XP_PER_LEVEL - (pet.xp % XP_PER_LEVEL)
}

function xpProgress(pet: PetState): number {
  return (pet.xp % XP_PER_LEVEL) / XP_PER_LEVEL
}

export default function PlayScreen() {
  const navigate = useNavigate()
  const { totalStars, ageMode } = useAppStore()
  const [pet, setPet] = useState<PetState | null>(null)

  useEffect(() => {
    preloadSfx(['tap', 'correct'])
    getOrCreatePet().then(setPet)
  }, [])

  const handleGameNav = (path: string) => {
    playSfx('tap')
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-8 pb-6 gap-6">

      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <span className="text-3xl font-bold text-emerald-700">にほんご101</span>
        <button
          type="button"
          aria-label="家長エリア"
          onClick={() => navigate('/parent')}
          className="w-12 h-12 rounded-full bg-white/70 text-xl flex items-center justify-center shadow hover:bg-white transition-colors"
        >
          👨‍👩‍👧
        </button>
      </div>

      {/* Pet display */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-36 h-36 rounded-full bg-white shadow-xl flex items-center justify-center text-8xl select-none">
          {pet ? SPECIES_EMOJI[pet.species] : '…'}
        </div>

        {pet && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                レベル {pet.level}
              </p>
              <p className="text-lg text-gray-500">
                つぎまで {xpToNextLevel(pet)} XP
              </p>
            </div>

            {/* XP bar */}
            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress(pet) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2 bg-white/70 rounded-2xl px-5 py-2 shadow">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-bold text-yellow-600">{totalStars}</span>
      </div>

      {/* Game buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="text-center text-xl text-gray-500 font-medium">あそぼう！</p>

        <button
          type="button"
          onClick={() => handleGameNav('/play/kana')}
          className="w-full py-5 rounded-3xl bg-pink-400 text-white text-2xl font-bold shadow-lg hover:bg-pink-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🎮 かな マッチ
        </button>

        <button
          type="button"
          onClick={() => handleGameNav('/play/flashcard')}
          className="w-full py-5 rounded-3xl bg-blue-400 text-white text-2xl font-bold shadow-lg hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🃏 フラッシュカード
        </button>

        <button
          type="button"
          onClick={() => handleGameNav('/play/quiz')}
          className="w-full py-5 rounded-3xl bg-purple-400 text-white text-2xl font-bold shadow-lg hover:bg-purple-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🎧 きくクイズ
        </button>

        {ageMode === 'advanced' && (
          <button
            type="button"
            onClick={() => handleGameNav('/play/kana-catch')}
            className="w-full py-5 rounded-3xl bg-orange-400 text-white text-2xl font-bold shadow-lg hover:bg-orange-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            🫧 かな つかまえろ！
          </button>
        )}
      </div>
    </div>
  )
}
