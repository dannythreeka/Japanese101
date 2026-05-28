import type { KanaItem, KanaMode } from '../../types'
import SpeakButton from '../../components/SpeakButton'

interface KanaCardProps {
  item: KanaItem
  mode: KanaMode
  showRomaji?: boolean
  className?: string
}

export default function KanaCard({ item, mode, showRomaji = false, className = '' }: KanaCardProps) {
  return (
    <div className={`rounded-3xl shadow-xl bg-white flex flex-col items-center justify-center p-8 gap-4 ${className}`}>
      {mode === 'hiragana' && (
        <span className="text-8xl font-bold text-gray-800 leading-none">{item.hiragana}</span>
      )}
      {mode === 'katakana' && (
        <span className="text-8xl font-bold text-gray-800 leading-none">{item.katakana}</span>
      )}
      {mode === 'both' && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-8xl font-bold text-gray-800 leading-none">{item.hiragana}</span>
          <span className="text-6xl font-bold text-blue-500 leading-none">{item.katakana}</span>
        </div>
      )}
      {showRomaji && (
        <span className="text-3xl text-gray-500 font-medium">{item.romaji}</span>
      )}
      <SpeakButton text={item.romaji} size="lg" />
    </div>
  )
}
