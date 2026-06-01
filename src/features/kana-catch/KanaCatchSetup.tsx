import { useNavigate } from 'react-router-dom'
import type { KanaCatchSubMode, UnitLesson } from '../../types'

interface Props {
  lessons: UnitLesson[]
  onStart(mode: KanaCatchSubMode, unitId?: string): void
}

interface ModeInfo {
  mode: KanaCatchSubMode
  label: string
  icon: string
  desc: string
  needsUnit: boolean
}

const MODES: ModeInfo[] = [
  { mode: 'listen',       icon: '🎵', label: '聆聽',   desc: '聽聲音找假名',       needsUnit: false },
  { mode: 'minimal_pair', icon: '🔤', label: '比較',   desc: '有濁點嗎？',         needsUnit: true  },
  { mode: 'word_to_image',icon: '🖼️', label: '找詞語', desc: '找出符合圖片的詞語！', needsUnit: true  },
]

export default function KanaCatchSetup({ lessons, onStart }: Props) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-8 bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full max-w-sm flex items-center gap-3">
        <button type="button" aria-label="回首頁" onClick={() => navigate('/play')}
          className="w-12 h-12 rounded-full bg-gray-200 text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">
          ←
        </button>
        <h1 className="text-2xl font-bold text-orange-600">接住假名！</h1>
      </div>

      <p className="text-xl text-gray-600">選擇遊戲模式？</p>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {MODES.map(({ mode, icon, label, desc, needsUnit }) => {
          // modes that need a unit are only available if lessons provide that mode
          const availableLessons = needsUnit
            ? lessons.filter(l => l.suggested_game_modes.includes(
                mode === 'minimal_pair' ? 'kana_catch_minimal_pair' : 'kana_catch_word_to_image'
              ))
            : []
          const disabled = needsUnit && availableLessons.length === 0

          if (!needsUnit) {
            return (
              <button key={mode} type="button"
                onClick={() => onStart(mode)}
                className="w-full py-5 rounded-3xl bg-orange-400 text-white text-xl font-bold shadow-lg hover:bg-orange-500 hover:scale-[1.02] transition-all flex flex-col items-center gap-1">
                <span className="text-3xl">{icon}</span>
                <span>{label}</span>
                <span className="text-sm font-normal opacity-80">{desc}</span>
              </button>
            )
          }

          if (disabled) return null

          return (
            <div key={mode} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-xl font-bold text-gray-700">{label}</span>
                <span className="text-sm text-gray-500 ml-1">{desc}</span>
              </div>
              {availableLessons.map(lesson => (
                <button key={lesson.unit_id} type="button"
                  onClick={() => onStart(mode, lesson.unit_id)}
                  className="w-full py-4 rounded-2xl bg-sky-400 text-white text-lg font-bold shadow-md hover:bg-sky-500 hover:scale-[1.01] transition-all">
                  📘 {lesson.unit_name_zh}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
