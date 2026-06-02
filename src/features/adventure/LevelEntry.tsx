import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrCreateAdventureProgress } from '../../db'
import { levelsData } from '../../data/loaders'
import { useT } from '../../hooks/useT'
import { getFirstLevelId, getLevelStatus } from './adventureEngine'
import type { Level, AdventureProgress } from '../../types/adventure'

const GAME_MODE_LABEL: Record<string, string> = {
  kana_catch_listen:       '🫧 かな キャッチ (きく)',
  kana_catch_minimal_pair: '🫧 かな キャッチ (くらべ)',
  kana_catch_word_to_image:'🫧 かな キャッチ (えあわせ)',
  dakuten_drag:            '✏️ だくてん ドラッグ',
  kotodama_summon:         '✨ ことだま しょうかん',
  karaoke_rhythm:          '🎤 カラオケ リズム',
  echo_record:             '🎙️ エコー レコード',
  write_canvas:            '✍️ かな かいてみよう',
}

export default function LevelEntry() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const t = useT()
  const [level, setLevel] = useState<Level | null>(null)
  const [progress, setProgress] = useState<AdventureProgress | null>(null)

  useEffect(() => {
    const { levels } = levelsData()
    const found = levels.find((l) => l.level_id === levelId) ?? null
    setLevel(found)
    getOrCreateAdventureProgress(getFirstLevelId()).then(setProgress)
  }, [levelId])

  if (!level || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex items-center justify-center">
        <span className="text-emerald-700 text-lg">{t('loading')}</span>
      </div>
    )
  }

  const status = getLevelStatus(level, progress)
  const completedRecord = progress.completed_levels[level.level_id]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">
      {/* Back */}
      <div className="w-full max-w-sm flex items-center">
        <button
          type="button"
          aria-label={t('levelBackAria')}
          onClick={() => navigate('/adventure')}
          className="px-4 py-2 rounded-full bg-white/70 hover:bg-white text-emerald-700 font-bold shadow transition-colors text-sm"
        >
          {t('levelBack')}
        </button>
      </div>

      {/* Level header */}
      <div className="w-full max-w-sm bg-white/80 rounded-2xl p-5 shadow flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {level.level_type === 'boss' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {t('mapBossLabel')}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-800">{level.title_zh}</h1>
        </div>
        {level.subtitle_zh && (
          <p className="text-sm text-gray-500">{level.subtitle_zh}</p>
        )}
        {level.story_intro_zh && (
          <p className="text-sm text-indigo-700 italic border-l-2 border-indigo-300 pl-3 mt-1">
            {level.story_intro_zh}
          </p>
        )}

        {/* XP + stars row */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>
            {t('levelXpLabel')}: <strong className="text-emerald-600">+{level.xp_reward}</strong>
          </span>
          {completedRecord && (
            <span>
              {t('levelStarsLabel')}: {' '}
              <strong className="text-amber-500">
                {'★'.repeat(completedRecord.stars)}{'☆'.repeat(3 - completedRecord.stars)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Challenges list */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1">
          {t('levelChallengesTitle')}
        </h2>
        {level.challenges.map((ch) => (
          <div
            key={ch.challenge_id}
            className="bg-white/80 rounded-xl px-4 py-3 shadow flex items-center justify-between gap-3"
          >
            <span className="text-sm text-gray-700">
              {GAME_MODE_LABEL[ch.game_mode] ?? ch.game_mode}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                ch.required_for_completion
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {ch.required_for_completion ? t('levelChallengeRequired') : t('levelChallengeOptional')}
            </span>
          </div>
        ))}
      </div>

      {/* Start button (S6.5 placeholder — wired in S6.6) */}
      <div className="w-full max-w-sm mt-auto">
        <button
          type="button"
          disabled={status === 'locked'}
          onClick={() => {
            // S6.6 will route to the first challenge game
          }}
          className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xl font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('levelStartBtn')}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">{t('levelComingSoon')}</p>
      </div>
    </div>
  )
}
