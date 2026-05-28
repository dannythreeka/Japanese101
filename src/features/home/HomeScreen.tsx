import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import StarCount from '../../components/StarCount'

interface NavCardProps {
  emoji: string
  label: string
  sublabel: string
  color: string
  onClick: () => void
}

function NavCard({ emoji, label, sublabel, color, onClick }: NavCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-full min-h-32 rounded-3xl shadow-lg ${color} flex items-center gap-5 px-6 transition-transform active:scale-95 hover:scale-105`}
    >
      <span className="text-6xl">{emoji}</span>
      <div className="text-left">
        <div className="text-3xl font-bold text-white">{label}</div>
        <div className="text-xl text-white/80">{sublabel}</div>
      </div>
    </button>
  )
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const totalStars = useAppStore(s => s.totalStars)

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto">
      <div className="text-center mt-4 mb-2">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          にほんご101
        </h1>
        <p className="text-2xl text-gray-500 mt-1">日文學習</p>
      </div>

      <div className="w-full flex justify-center">
        <StarCount count={totalStars} />
      </div>

      <div className="w-full flex flex-col gap-4">
        <NavCard
          emoji="🔤"
          label="五十音"
          sublabel="かなをまなぼう"
          color="bg-pink-400"
          onClick={() => navigate('/kid/kana')}
        />
        <NavCard
          emoji="📚"
          label="たんご"
          sublabel="ことばをおぼえよう"
          color="bg-blue-400"
          onClick={() => navigate('/kid/flashcard')}
        />
        <NavCard
          emoji="👂"
          label="きいてこたえよう"
          sublabel="ちょうりょく"
          color="bg-green-400"
          onClick={() => navigate('/kid/quiz')}
        />
      </div>

      <button
        type="button"
        onClick={() => navigate('/parent')}
        aria-label="家長頁面"
        className="mt-auto text-lg text-gray-400 underline underline-offset-2 py-2 px-4"
      >
        家長 👨‍👩‍👧
      </button>
    </div>
  )
}
