import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaMode, KanaDifficulty, ProgressRecord, SessionRecord } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { getAllProgress, getRecentSessions, getTotalStudyTime } from '../../db'
import { accuracy } from '../../lib/srs'

const DEFAULT_PIN = '1234'
const PIN_KEY = 'parentPin'

function getStoredPin(): string {
  return localStorage.getItem(PIN_KEY) ?? DEFAULT_PIN
}

function formatTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}分`
  return `${hours}時間${minutes}分`
}

function getDayLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

interface DayCount {
  label: string
  count: number
}

function last7DayCounts(sessions: SessionRecord[]): DayCount[] {
  const days: DayCount[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + 86400000
    const count = sessions.filter((s) => s.date >= start && s.date < end).length
    days.push({ label: getDayLabel(d), count })
  }
  return days
}

function featureAccuracy(records: ProgressRecord[], type: 'kana' | 'vocab'): number {
  const filtered = records.filter((r) => r.type === type)
  if (filtered.length === 0) return 0
  const total = filtered.reduce((sum, r) => sum + accuracy(r), 0)
  return Math.round(total / filtered.length)
}

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { kanaMode, kanaDifficulty, totalStars, setKanaMode, setKanaDifficulty } = useAppStore()

  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const [studyTime, setStudyTime] = useState(0)
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([])
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    setLoading(true)
    Promise.all([getTotalStudyTime(), getAllProgress(), getRecentSessions(100)]).then(
      ([time, recs, sess]) => {
        setStudyTime(time)
        setProgressRecords(recs)
        setSessions(sess)
        setLoading(false)
      }
    )
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
    setPinInput((p) => p.slice(0, -1))
    setPinError(false)
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h1 className="text-4xl font-bold text-purple-700">家長エリア</h1>
        <p className="text-2xl text-gray-600">PINを入力してください</p>

        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border-4 transition-colors ${
                i < pinInput.length
                  ? pinError
                    ? 'bg-red-400 border-red-400'
                    : 'bg-purple-500 border-purple-500'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {pinError && (
          <p className="text-2xl text-red-500 animate-shake">まちがいです</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d}
              onClick={() => handlePinDigit(d)}
              className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            aria-label="削除"
            onClick={handlePinDelete}
            className="w-20 h-20 rounded-2xl bg-gray-100 text-2xl font-bold shadow-md hover:bg-gray-200 transition-all"
          >
            ⌫
          </button>
          <button
            type="button"
            aria-label="0"
            onClick={() => handlePinDigit('0')}
            className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all"
          >
            0
          </button>
          <div className="w-20 h-20" />
        </div>

        <button
          type="button"
          aria-label="ホームにもどる"
          onClick={() => navigate('/kid')}
          className="mt-4 px-6 py-3 rounded-2xl bg-gray-200 text-xl font-bold hover:bg-gray-300 transition-colors"
        >
          ← もどる
        </button>
      </div>
    )
  }

  const kanaAcc = featureAccuracy(progressRecords, 'kana')
  const vocabAcc = featureAccuracy(progressRecords, 'vocab')
  const dayCounts = last7DayCounts(sessions)
  const maxCount = Math.max(...dayCounts.map((d) => d.count), 1)

  const kanaModes: KanaMode[] = ['hiragana', 'katakana', 'both']
  const kanaModeLabels: Record<KanaMode, string> = {
    hiragana: 'ひらがな',
    katakana: 'カタカナ',
    both: 'りょうほう',
  }
  const difficulties: KanaDifficulty[] = ['level_1', 'level_2', 'level_3', 'all']
  const difficultyLabels: Record<KanaDifficulty, string> = {
    level_1: 'レベル1',
    level_2: 'レベル2',
    level_3: 'レベル3',
    all: 'ぜんぶ',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 pt-6">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="ホームにもどる"
            onClick={() => navigate('/kid')}
            className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            ←
          </button>
          <h1 className="text-4xl font-bold text-purple-700">家長ダッシュボード</h1>
        </div>

        {loading ? (
          <p className="text-2xl text-gray-500 text-center py-8">よみこみちゅう…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⏱</span>
                <span className="text-2xl font-bold text-gray-700">がくしゅうじかん</span>
                <span className="text-3xl font-bold text-blue-600">{formatTime(studyTime)}</span>
              </div>
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-2xl font-bold text-gray-700">ほしのかず</span>
                <span className="text-3xl font-bold text-yellow-500">{totalStars}</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">せいかいりつ</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-gray-600 w-24">五十音</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-400 rounded-full transition-all"
                      style={{ width: `${kanaAcc}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-700 w-12 text-right">{kanaAcc}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-gray-600 w-24">たんご</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${vocabAcc}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-700 w-12 text-right">{vocabAcc}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">この1しゅうかん</h2>
              <div className="flex items-end gap-2 h-24">
                {dayCounts.map((day) => (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-purple-300 rounded-t-lg transition-all"
                      style={{ height: `${(day.count / maxCount) * 64}px`, minHeight: day.count > 0 ? '8px' : '2px' }}
                    />
                    <span className="text-xs text-gray-500">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">せってい</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xl text-gray-600 mb-2">かなのモード</p>
                  <div className="flex gap-2 flex-wrap">
                    {kanaModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-label={kanaModeLabels[mode]}
                        onClick={() => setKanaMode(mode)}
                        className={`px-4 py-2 rounded-2xl text-xl font-bold transition-all ${
                          kanaMode === mode
                            ? 'bg-pink-400 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                        }`}
                      >
                        {kanaModeLabels[mode]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xl text-gray-600 mb-2">むずかしさ</p>
                  <div className="flex gap-2 flex-wrap">
                    {difficulties.map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        aria-label={difficultyLabels[diff]}
                        onClick={() => setKanaDifficulty(diff)}
                        className={`px-4 py-2 rounded-2xl text-xl font-bold transition-all ${
                          kanaDifficulty === diff
                            ? 'bg-blue-400 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
                        }`}
                      >
                        {difficultyLabels[diff]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
