import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaMode, KanaDifficulty, ProgressRecord, SessionRecord, MicMode } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { requestMicPermission } from '../../lib/mic'
import { getAllProgress, getRecentSessions, getTotalStudyTime, getOrCreateAdventureProgress } from '../../db'
import { lessonData, levelsData } from '../../data/loaders'
import { getFirstLevelId } from '../adventure/adventureEngine'
import { formatTime, last7DayCounts, featureAccuracy } from './dashboardUtils'
import { useT } from '../../hooks/useT'
import type { AdventureProgress } from '../../types/adventure'

const LESSONS = lessonData()

const DEFAULT_PIN = '1234'
const PIN_KEY = 'parentPin'

function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) ?? DEFAULT_PIN
}

export default function ParentDashboard() {
  const navigate = useNavigate()
  const {
    kanaMode, kanaDifficulty, ageMode, disabledUnits, totalStars, micMode,
    setKanaMode, setKanaDifficulty, setAgeMode, toggleUnit, setMicMode,
  } = useAppStore()

  const [showMicModal, setShowMicModal] = useState(false)
  const [pendingMicMode, setPendingMicMode] = useState<Exclude<MicMode, 'off'>>('offline')
  const [micPermError, setMicPermError] = useState(false)

  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const [studyTime, setStudyTime] = useState(0)
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([])
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [adventureProgress, setAdventureProgress] = useState<AdventureProgress | null>(null)
  const [loading, setLoading] = useState(false)

  const t = useT()

  useEffect(() => {
    if (!unlocked) return
    setLoading(true)
    Promise.all([
      getTotalStudyTime(),
      getAllProgress(),
      getRecentSessions(100),
      getOrCreateAdventureProgress(getFirstLevelId()),
    ]).then(([time, recs, sess, adv]) => {
      setStudyTime(time)
      setProgressRecords(recs)
      setSessions(sess)
      setAdventureProgress(adv)
      setLoading(false)
    })
  }, [unlocked])

  const handlePinDigit = (digit: string) => {
    if (pinInput.length >= 4) return
    const next = pinInput + digit
    setPinInput(next)
    setPinError(false)
    if (next.length === 4) {
      if (next === getStoredPin()) {
        setUnlocked(true)
      } else {
        setPinError(true)
        setTimeout(() => setPinInput(''), 600)
      }
    }
  }

  const handlePinDelete = () => {
    setPinInput(p => p.slice(0, -1))
    setPinError(false)
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h1 className="text-4xl font-bold text-purple-700">{t('parentArea')}</h1>
        <p className="text-2xl text-gray-600">{t('parentEnterPin')}</p>

        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-6 h-6 rounded-full border-4 transition-colors ${
              i < pinInput.length
                ? pinError ? 'bg-red-400 border-red-400' : 'bg-purple-500 border-purple-500'
                : 'border-gray-300'
            }`} />
          ))}
        </div>

        {pinError && <p className="text-2xl text-red-500 animate-shake">{t('parentPinError')}</p>}

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button key={d} type="button" aria-label={d} onClick={() => handlePinDigit(d)}
              className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all">
              {d}
            </button>
          ))}
          <button type="button" aria-label="⌫" onClick={handlePinDelete}
            className="w-20 h-20 rounded-2xl bg-gray-100 text-2xl font-bold shadow-md hover:bg-gray-200 transition-all">
            ⌫
          </button>
          <button type="button" aria-label="0" onClick={() => handlePinDigit('0')}
            className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all">
            0
          </button>
          <div className="w-20 h-20" />
        </div>

        <button type="button" aria-label={t('homeAria')} onClick={() => navigate('/play')}
          className="mt-4 px-6 py-3 rounded-2xl bg-gray-200 text-xl font-bold hover:bg-gray-300 transition-colors">
          {t('back')}
        </button>
      </div>
    )
  }

  const kanaAcc = featureAccuracy(progressRecords, 'kana')
  const vocabAcc = featureAccuracy(progressRecords, 'vocab')
  const dayCounts = last7DayCounts(sessions)
  const maxCount = Math.max(...dayCounts.map(d => d.count), 1)

  const { levels: allLevels } = levelsData()
  const completedCount = adventureProgress ? Object.keys(adventureProgress.completed_levels).length : 0
  const totalLevels = allLevels.length
  const adventureStars = adventureProgress
    ? Object.values(adventureProgress.completed_levels).reduce((sum, r) => sum + r.stars, 0)
    : 0
  const bossDefeated = adventureProgress
    ? Object.keys(adventureProgress.completed_levels).some(id => allLevels.find(l => l.level_id === id)?.level_type === 'boss')
    : false

  const kanaModes: KanaMode[] = ['hiragana', 'katakana', 'both']
  const kanaModeLabels: Record<KanaMode, string> = {
    hiragana: t('parentHiragana'),
    katakana: t('parentKatakana'),
    both: t('parentBoth'),
  }
  const difficulties: KanaDifficulty[] = [1, 2, 3, 'all']
  const difficultyLabels: Record<string, string> = {
    1: t('parentDiff1'),
    2: t('parentDiff2'),
    3: t('parentDiff3'),
    all: t('parentDiffAll'),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 pt-6">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <button type="button" aria-label={t('homeAria')} onClick={() => navigate('/play')}
            className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
            ←
          </button>
          <h1 className="text-4xl font-bold text-purple-700">{t('parentDashboard')}</h1>
        </div>

        {loading ? (
          <p className="text-2xl text-gray-500 text-center py-8">{t('parentLoading')}</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⏱</span>
                <span className="text-2xl font-bold text-gray-700">{t('parentStudyTime')}</span>
                <span className="text-3xl font-bold text-blue-600">{formatTime(studyTime)}</span>
              </div>
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-2xl font-bold text-gray-700">{t('parentStars')}</span>
                <span className="text-3xl font-bold text-yellow-500">{totalStars}</span>
              </div>
            </div>

            {/* Adventure progress */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-gray-700">{t('parentAdventureTitle')}</h2>
              <div className="flex items-center justify-between">
                <span className="text-xl text-gray-600">{t('parentLevelsLabel')}</span>
                <span className="text-2xl font-bold text-indigo-600">{completedCount} / {totalLevels}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all"
                  style={{ width: totalLevels > 0 ? `${(completedCount / totalLevels) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl text-gray-600">{t('parentAdventureStars')}</span>
                <span className="text-2xl font-bold text-amber-500">★ {adventureStars}</span>
              </div>
              <div className={`text-base font-semibold px-3 py-2 rounded-xl ${bossDefeated ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                {bossDefeated ? t('parentBossDefeated') : t('parentBossNotYet')}
              </div>
            </div>

            {/* Accuracy */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">{t('parentAccuracy')}</h2>
              {[
                { label: t('parentKanaLabel'), acc: kanaAcc, color: 'bg-pink-400' },
                { label: t('parentVocabLabel'), acc: vocabAcc, color: 'bg-blue-400' },
              ].map(({ label, acc, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl text-gray-600 w-24">{label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${acc}%` }} />
                  </div>
                  <span className="text-xl font-bold text-gray-700 w-12 text-right">{acc}%</span>
                </div>
              ))}
            </div>

            {/* 7-day chart */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">{t('parentWeekly')}</h2>
              <div className="flex items-end gap-2 h-24">
                {dayCounts.map(day => (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-purple-300 rounded-t-lg transition-all"
                      style={{ height: `${(day.count / maxCount) * 64}px`, minHeight: day.count > 0 ? '8px' : '2px' }} />
                    <span className="text-xs text-gray-500">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-gray-700">{t('parentSettings')}</h2>

              {/* Age mode */}
              <div>
                <p className="text-xl text-gray-600 mb-2">{t('parentAgeMode')}</p>
                <div className="flex gap-3">
                  {(['young', 'advanced'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setAgeMode(mode)}
                      className={`flex-1 py-3 rounded-2xl text-xl font-bold transition-all ${
                        ageMode === mode
                          ? 'bg-emerald-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                      }`}>
                      {mode === 'young' ? t('parentYoung') : t('parentAdvanced')}
                    </button>
                  ))}
                </div>
                <p className="text-lg text-gray-400 mt-2">
                  {ageMode === 'young' ? t('parentAgeModeYoung') : t('parentAgeModeAdv')}
                </p>
              </div>

              {/* Kana mode */}
              <div>
                <p className="text-xl text-gray-600 mb-2">{t('parentKanaMode')}</p>
                <div className="flex gap-2 flex-wrap">
                  {kanaModes.map(mode => (
                    <button key={mode} type="button" aria-label={kanaModeLabels[mode]}
                      onClick={() => setKanaMode(mode)}
                      className={`px-4 py-2 rounded-2xl text-xl font-bold transition-all ${
                        kanaMode === mode
                          ? 'bg-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                      }`}>
                      {kanaModeLabels[mode]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-xl text-gray-600 mb-2">{t('parentDifficulty')}</p>
                <div className="flex gap-2 flex-wrap">
                  {difficulties.map(diff => (
                    <button key={diff} type="button" aria-label={difficultyLabels[diff]}
                      onClick={() => setKanaDifficulty(diff)}
                      className={`px-4 py-2 rounded-2xl text-xl font-bold transition-all ${
                        kanaDifficulty === diff
                          ? 'bg-blue-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
                      }`}>
                      {difficultyLabels[diff]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit toggle */}
              <div>
                <p className="text-xl text-gray-600 mb-2">{t('parentLessons')}</p>
                <div className="flex flex-col divide-y divide-gray-100">
                  {LESSONS.map(lesson => {
                    const enabled = !disabledUnits.includes(lesson.unit_id)
                    return (
                      <div key={lesson.unit_id} className="flex items-center gap-3 py-3">
                        <span className="flex-1 text-lg text-gray-700">{lesson.unit_name_zh}</span>
                        <button
                          type="button"
                          aria-label={enabled ? t('parentToggleOff') : t('parentToggleOn')}
                          onClick={() => toggleUnit(lesson.unit_id)}
                          className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                            enabled ? 'bg-emerald-400' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                            enabled ? 'left-7' : 'left-1'
                          }`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mic settings */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">{t('parentMicTitle')}</h2>
              <p className="text-lg text-gray-500">{t('parentMicDesc')}</p>
              <div className="flex gap-2 flex-wrap">
                {(['off', 'offline', 'enhanced'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode !== 'off' && micMode === 'off') {
                        setPendingMicMode(mode)
                        setMicPermError(false)
                        setShowMicModal(true)
                      } else {
                        setMicMode(mode)
                      }
                    }}
                    className={`px-5 py-2 rounded-2xl text-xl font-bold transition-all ${
                      micMode === mode
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
                    }`}
                  >
                    {mode === 'off' ? t('parentMicOff') : mode === 'offline' ? t('parentMicOffline') : t('parentMicHigh')}
                  </button>
                ))}
              </div>
              <p className="text-base text-gray-400">
                {micMode === 'off'
                  ? t('parentMicStatusOff')
                  : micMode === 'offline'
                  ? t('parentMicStatusOfl')
                  : t('parentMicStatusEnh')}
              </p>
              <p className="text-sm text-gray-400">{t('parentMicPrivacy')}</p>
            </div>
          </>
        )}
      </div>

      {/* Mic permission modal */}
      {showMicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800">{t('parentMicModalTitle')}</h3>
            <p className="text-lg text-gray-600">{t('parentMicModalDesc')}</p>
            <ul className="text-base text-gray-500 list-disc pl-5 flex flex-col gap-1">
              <li>{t('parentMicBullet1')}</li>
              <li>{t('parentMicBullet2')}</li>
              <li>{t('parentMicBullet3')}</li>
            </ul>
            {micPermError && (
              <p className="text-base text-red-500 font-medium">{t('parentMicError')}</p>
            )}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => { setShowMicModal(false); setMicPermError(false) }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-xl font-bold hover:bg-gray-200 transition-colors"
              >
                {t('parentMicCancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const granted = await requestMicPermission()
                  if (granted) {
                    setMicMode(pendingMicMode)
                    setShowMicModal(false)
                    setMicPermError(false)
                  } else {
                    setMicPermError(true)
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-xl font-bold hover:bg-indigo-600 transition-colors"
              >
                {t('parentMicAllow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
