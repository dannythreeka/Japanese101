import { useT } from '../../hooks/useT'

interface Props {
  newLevel: number
  evolvedToStage: number | null
  onClose: () => void
}

export default function LevelUpModal({ newLevel, evolvedToStage, onClose }: Props) {
  const t = useT()
  const stageMsgs = ['', t('levelUpEvolved1'), t('levelUpEvolved2'), t('levelUpEvolved3')]

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('levelUpLevel')}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-bounce-in max-w-xs mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-6xl animate-star-pop">🎉</span>
        <h2 className="text-3xl font-bold text-purple-600">{t('levelUpLevel')}</h2>
        <p className="text-4xl font-bold text-yellow-500">Lv. {newLevel}</p>
        {evolvedToStage !== null && (
          <p className="text-2xl text-pink-500 font-bold">
            {stageMsgs[evolvedToStage] ?? t('levelUpEvolved1')}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-8 py-3 rounded-2xl bg-purple-500 text-white text-2xl font-bold hover:bg-purple-600 transition-colors"
        >
          {t('levelUpPraise')}
        </button>
      </div>
    </div>
  )
}
