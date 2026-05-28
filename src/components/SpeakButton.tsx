import { speak } from '../lib/tts'

interface SpeakButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
}

export default function SpeakButton({ text, className = '', size = 'md' }: SpeakButtonProps) {
  return (
    <button
      type="button"
      aria-label="日本語で読む"
      onClick={() => speak(text)}
      className={`${sizeClasses[size]} rounded-full bg-yellow-400 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      🔊
    </button>
  )
}
