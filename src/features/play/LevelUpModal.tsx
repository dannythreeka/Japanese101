const STAGE_MSG = ['', '進化了！', '變得更強了！', '最強！']

interface Props {
  newLevel: number
  evolvedToStage: number | null
  onClose: () => void
}

export default function LevelUpModal({ newLevel, evolvedToStage, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-bounce-in max-w-xs mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-6xl animate-star-pop">🎉</span>
        <h2 className="text-3xl font-bold text-purple-600">升級了！</h2>
        <p className="text-4xl font-bold text-yellow-500">Lv. {newLevel}</p>
        {evolvedToStage !== null && (
          <p className="text-2xl text-pink-500 font-bold">
            {STAGE_MSG[evolvedToStage] ?? '進化了！'}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-8 py-3 rounded-2xl bg-purple-500 text-white text-2xl font-bold hover:bg-purple-600 transition-colors"
        >
          太棒了！
        </button>
      </div>
    </div>
  )
}
