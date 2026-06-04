import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreateAdventureProgress } from '../../db'
import { useT } from '../../hooks/useT'
import { getSortedLevels, getLevelStatus, getFirstLevelId, ensureValidProgress } from './adventureEngine'
import { levelsData } from '../../data/loaders'
import type { Level, LevelStatus, AdventureProgress } from '../../types/adventure'

function levelNodeClass(status: LevelStatus, isBoss: boolean): string {
  const base = 'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all select-none border-4'
  if (status === 'completed') return `${base} bg-amber-400 border-amber-600 text-white`
  if (status === 'next') {
    const bossStyle = isBoss ? 'bg-purple-600 border-purple-800' : 'bg-indigo-500 border-indigo-700'
    return `${base} ${bossStyle} text-white animate-pulse cursor-pointer`
  }
  return `${base} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60`
}

function levelEmoji(level: Level, status: LevelStatus): string {
  if (level.level_type === 'boss') return '👹'
  if (level.level_type === 'tutorial') return '⭐'
  if (status === 'completed') return '✓'
  return String(level.level_number)
}

function starsDisplay(stars: 1 | 2 | 3): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

export default function AdventureMap() {
  const navigate = useNavigate()
  const t = useT()
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentNodeRef = useRef<HTMLButtonElement | null>(null)
  const [progress, setProgress] = useState<AdventureProgress | null>(null)

  const levels = getSortedLevels()
  const { regions } = levelsData()

  useEffect(() => {
    getOrCreateAdventureProgress(getFirstLevelId()).then(p => setProgress(ensureValidProgress(levels, p)))
  }, [levels])

  useEffect(() => {
    if (progress && currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [progress])

  function handleLevelClick(level: Level, status: LevelStatus) {
    if (status === 'locked') {
      alert(t('mapLockedHint'))
      return
    }
    navigate(`/adventure/level/${level.level_id}`)
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex items-center justify-center">
        <span className="text-emerald-700 text-lg">{t('loading')}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          aria-label={t('mapBackAria')}
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full bg-white/70 hover:bg-white text-emerald-700 font-bold shadow transition-colors text-sm"
        >
          {t('mapBack')}
        </button>
        <h1 className="text-2xl font-bold text-emerald-700">{t('mapTitle')}</h1>
      </div>

      {/* Horizontal scroll map */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center gap-0 min-w-max pb-8">
          {regions.map((region, rIdx) => {
            const regionLevels = levels.filter((l) => l.region_id === region.region_id)
            const regionUnlocked = regionLevels.some(
              (l) => getLevelStatus(l, progress) !== 'locked',
            )

            return (
              <div key={region.region_id} className="flex items-center gap-0">
                {/* Region label */}
                <div className="flex flex-col items-center mr-3 ml-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full mb-2 whitespace-nowrap ${
                      regionUnlocked
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {regionUnlocked ? (region.name_ja ?? region.name_zh) : t('mapRegionLocked')}
                  </span>
                </div>

                {/* Level nodes for this region */}
                {regionLevels.map((level, lIdx) => {
                  const status = getLevelStatus(level, progress)
                  const isBoss = level.level_type === 'boss'
                  const completedRecord = progress.completed_levels[level.level_id]
                  const isCurrentNode = status === 'next'

                  return (
                    <div key={level.level_id} className="flex items-center">
                      {/* Connector path */}
                      {(lIdx > 0 || rIdx > 0) && (
                        <div className="w-8 h-1 bg-gray-300 rounded-full mx-1" />
                      )}

                      {/* Level node + label */}
                      <div className="flex flex-col items-center gap-1">
                        {/* Boss label */}
                        {isBoss && (
                          <span className="text-xs font-bold text-purple-700 mb-1">
                            {t('mapBossLabel')}
                          </span>
                        )}

                        <button
                          ref={isCurrentNode ? currentNodeRef : null}
                          type="button"
                          aria-label={level.title_ja ?? level.title_zh}
                          className={levelNodeClass(status, isBoss)}
                          onClick={() => handleLevelClick(level, status)}
                        >
                          {levelEmoji(level, status)}
                        </button>

                        {/* Stars below completed node */}
                        {completedRecord && (
                          <span className="text-amber-500 text-xs leading-none">
                            {starsDisplay(completedRecord.stars)}
                          </span>
                        )}

                        {/* Level title */}
                        <span className="text-xs text-center text-gray-600 max-w-[72px] leading-tight">
                          {level.title_ja ?? level.title_zh}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
