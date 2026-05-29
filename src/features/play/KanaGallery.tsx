import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { getOrCreatePet } from '../../db'
import { kanaData } from '../../data/loaders'

const ALL_KANA = kanaData()

const TYPE_LABEL: Record<string, string> = {
  seion: '清音',
  dakuon: '濁音',
  handakuon: '半濁音',
  youon: '拗音',
}

const KANA_TYPES = ['seion', 'dakuon', 'handakuon', 'youon'] as const

export default function KanaGallery() {
  const navigate = useNavigate()
  const { kanaMode } = useAppStore()
  const [collected, setCollected] = useState<Set<string>>(new Set())

  useEffect(() => {
    getOrCreatePet().then((pet) => {
      setCollected(new Set(pet.collection))
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white p-4 pt-6 pb-10">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="もどる"
            onClick={() => navigate('/play')}
            className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-sky-700">かな ずかん</h1>
          <span className="ml-auto text-xl font-bold text-gray-500">
            {collected.size} / {ALL_KANA.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all"
            style={{ width: `${(collected.size / ALL_KANA.length) * 100}%` }}
          />
        </div>

        {KANA_TYPES.map((type) => {
          const items = ALL_KANA.filter((k) => k.type === type)
          const unlocked = items.filter((k) => collected.has(k.id)).length
          return (
            <div key={type} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-600">{TYPE_LABEL[type]}</h2>
                <span className="text-sm text-gray-400">{unlocked}/{items.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((k) => {
                  const isUnlocked = collected.has(k.id)
                  const display =
                    kanaMode === 'katakana' ? k.katakana : k.hiragana
                  return (
                    <div
                      key={k.id}
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all ${
                        isUnlocked
                          ? 'bg-white text-gray-800 shadow-md'
                          : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      <span className="text-xl font-bold leading-tight">
                        {isUnlocked ? display : '？'}
                      </span>
                      <span className="text-xs text-gray-400 leading-tight">
                        {isUnlocked ? k.romaji : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
