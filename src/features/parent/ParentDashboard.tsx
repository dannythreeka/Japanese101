import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaMode, KanaDifficulty, ProgressRecord, SessionRecord, MicMode } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { requestMicPermission } from '../../lib/mic'
import { getAllProgress, getRecentSessions, getTotalStudyTime } from '../../db'
import { lessonData } from '../../data/loaders'
import { formatTime, last7DayCounts, featureAccuracy } from './dashboardUtils'

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
    setPinInput(p => p.slice(0, -1))
    setPinError(false)
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h1 className="text-4xl font-bold text-purple-700">家長區域</h1>
        <p className="text-2xl text-gray-600">請輸入PIN碼</p>

        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-6 h-6 rounded-full border-4 transition-colors ${
              i < pinInput.length
                ? pinError ? 'bg-red-400 border-red-400' : 'bg-purple-500 border-purple-500'
                : 'border-gray-300'
            }`} />
          ))}
        </div>

        {pinError && <p className="text-2xl text-red-500 animate-shake">密碼錯誤</p>}

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button key={d} type="button" aria-label={d} onClick={() => handlePinDigit(d)}
              className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all">
              {d}
            </button>
          ))}
          <button type="button" aria-label="削除" onClick={handlePinDelete}
            className="w-20 h-20 rounded-2xl bg-gray-100 text-2xl font-bold shadow-md hover:bg-gray-200 transition-all">
            ⌫
          </button>
          <button type="button" aria-label="0" onClick={() => handlePinDigit('0')}
            className="w-20 h-20 rounded-2xl bg-white text-3xl font-bold shadow-md hover:bg-purple-100 hover:scale-105 transition-all">
            0
          </button>
          <div className="w-20 h-20" />
        </div>

        <button type="button" aria-label="回首頁" onClick={() => navigate('/play')}
          className="mt-4 px-6 py-3 rounded-2xl bg-gray-200 text-xl font-bold hover:bg-gray-300 transition-colors">
          ← 返回
        </button>
      </div>
    )
  }

  const kanaAcc = featureAccuracy(progressRecords, 'kana')
  const vocabAcc = featureAccuracy(progressRecords, 'vocab')
  const dayCounts = last7DayCounts(sessions)
  const maxCount = Math.max(...dayCounts.map(d => d.count), 1)

  const kanaModes: KanaMode[] = ['hiragana', 'katakana', 'both']
  const kanaModeLabels: Record<KanaMode, string> = {
    hiragana: '平假名',
    katakana: '片假名',
    both: '兩者皆有',
  }
  const difficulties: KanaDifficulty[] = [1, 2, 3, 'all']
  const difficultyLabels: Record<string, string> = {
    1: '第1級（清音）',
    2: '第2級（濁音）',
    3: '第3級（拗音）',
    all: '全部',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 pt-6">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <button type="button" aria-label="回首頁" onClick={() => navigate('/play')}
            className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
            ←
          </button>
          <h1 className="text-4xl font-bold text-purple-700">家長儀表板</h1>
        </div>

        {loading ? (
          <p className="text-2xl text-gray-500 text-center py-8">載入中…</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⏱</span>
                <span className="text-2xl font-bold text-gray-700">學習時間</span>
                <span className="text-3xl font-bold text-blue-600">{formatTime(studyTime)}</span>
              </div>
              <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col items-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-2xl font-bold text-gray-700">獲得星數</span>
                <span className="text-3xl font-bold text-yellow-500">{totalStars}</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">正確率</h2>
              {[
                { label: '平假名', acc: kanaAcc, color: 'bg-pink-400' },
                { label: '詞彙', acc: vocabAcc, color: 'bg-blue-400' },
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
              <h2 className="text-2xl font-bold text-gray-700">本週</h2>
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
              <h2 className="text-2xl font-bold text-gray-700">設定</h2>

              {/* Age mode */}
              <div>
                <p className="text-xl text-gray-600 mb-2">年齡模式</p>
                <div className="flex gap-3">
                  {(['young', 'advanced'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setAgeMode(mode)}
                      className={`flex-1 py-3 rounded-2xl text-xl font-bold transition-all ${
                        ageMode === mode
                          ? 'bg-emerald-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                      }`}>
                      {mode === 'young' ? '幼齢 🐣' : '進階 🚀'}
                    </button>
                  ))}
                </div>
                <p className="text-lg text-gray-400 mt-2">
                  {ageMode === 'young'
                    ? '含羅馬字・節奏較慢・以清音為主（適合6〜8歲）'
                    : '不含羅馬字・節奏較快・全部假名（適合9〜12歲）'}
                </p>
              </div>

              {/* Kana mode */}
              <div>
                <p className="text-xl text-gray-600 mb-2">假名模式</p>
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
                <p className="text-xl text-gray-600 mb-2">難易度</p>
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
                <p className="text-xl text-gray-600 mb-2">課程</p>
                <div className="flex flex-col divide-y divide-gray-100">
                  {LESSONS.map(lesson => {
                    const enabled = !disabledUnits.includes(lesson.unit_id)
                    return (
                      <div key={lesson.unit_id} className="flex items-center gap-3 py-3">
                        <span className="flex-1 text-lg text-gray-700">{lesson.unit_name_zh}</span>
                        <button
                          type="button"
                          aria-label={enabled ? '關閉' : '開啟'}
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

            {/* マイク設定 */}
            <div className="rounded-3xl bg-white shadow-lg p-5 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-700">麥克風設定（言靈）</h2>
              <p className="text-lg text-gray-500">
                在「言靈召喚」遊戲中讓孩子可以使用語音功能。
              </p>
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
                    {mode === 'off' ? '關閉' : mode === 'offline' ? '離線模式' : '高精度'}
                  </button>
                ))}
              </div>
              <p className="text-base text-gray-400">
                {micMode === 'off'
                  ? '言靈遊戲不可使用'
                  : micMode === 'offline'
                  ? '僅偵測音量 · 不傳送至外部'
                  : '語音識別 · 需要網路連線'}
              </p>
              <p className="text-sm text-gray-400">🔒 語音資料僅在設備內部處理。</p>
            </div>
          </>
        )}
      </div>

      {/* Mic permission modal */}
      {showMicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800">關於麥克風授權</h3>
            <p className="text-lg text-gray-600">
              為了言靈遊戲，請允許使用麥克風。
            </p>
            <ul className="text-base text-gray-500 list-disc pl-5 flex flex-col gap-1">
              <li>語音僅在設備內部處理</li>
              <li>不傳送至外部伺服器</li>
              <li>預設不儲存錄音</li>
            </ul>
            {micPermError && (
              <p className="text-base text-red-500 font-medium">
                無法取得麥克風授權，請確認瀏覽器設定。
              </p>
            )}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => { setShowMicModal(false); setMicPermError(false) }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-xl font-bold hover:bg-gray-200 transition-colors"
              >
                取消
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
                允許
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
