import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { speak } from '../../lib/tts'
import StarCount from '../../components/StarCount'

export default function HomeScreen() {
  const navigate = useNavigate()
  const totalStars = useAppStore((s) => s.totalStars)

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pt-10 pb-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <h1
            className="text-5xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #f472b6, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            にほんご101
          </h1>
          <button
            type="button"
            aria-label="日本語で読む"
            onClick={() => speak('にほんご101')}
            className="w-12 h-12 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-transform"
          >
            🔊
          </button>
        </div>
        <p className="text-2xl text-gray-500">日文學習</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4 mt-6">
        <button
          type="button"
          aria-label="五十音をれんしゅうする"
          onClick={() => navigate('/play/kana')}
          className="w-full min-h-[120px] rounded-3xl shadow-lg bg-gradient-to-r from-pink-300 to-pink-400 text-white flex items-center gap-5 px-6 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="text-5xl">🔤</span>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold">五十音</span>
            <span className="text-xl opacity-90">かなのれんしゅう</span>
          </div>
        </button>

        <button
          type="button"
          aria-label="たんごをれんしゅうする"
          onClick={() => navigate('/play/flashcard')}
          className="w-full min-h-[120px] rounded-3xl shadow-lg bg-gradient-to-r from-yellow-300 to-yellow-400 text-white flex items-center gap-5 px-6 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="text-5xl">📚</span>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold">たんご</span>
            <span className="text-xl opacity-90">フラッシュカード</span>
          </div>
        </button>

        <button
          type="button"
          aria-label="きくれんしゅうをする"
          onClick={() => navigate('/play/quiz')}
          className="w-full min-h-[120px] rounded-3xl shadow-lg bg-gradient-to-r from-blue-300 to-blue-400 text-white flex items-center gap-5 px-6 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="text-5xl">👂</span>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold">きく</span>
            <span className="text-xl opacity-90">リスニングクイズ</span>
          </div>
        </button>

        <div className="w-full min-h-[120px] rounded-3xl shadow-lg bg-gradient-to-r from-green-200 to-green-300 flex items-center justify-center px-6">
          <StarCount count={totalStars} />
        </div>
      </div>

      <div className="w-full flex justify-end mt-6">
        <button
          type="button"
          aria-label="家長エリアへ"
          onClick={() => navigate('/parent')}
          className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-600 text-lg font-bold hover:bg-gray-300 transition-colors"
        >
          家長
        </button>
      </div>
    </div>
  )
}
