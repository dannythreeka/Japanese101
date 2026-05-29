import type { PetState } from '../types'

const SPECIES_EMOJI: Record<PetState['species'], string[]> = {
  fox:    ['🥚', '🦊', '🦊', '🦊'],
  cat:    ['🥚', '🐱', '🐱', '🐱'],
  dragon: ['🥚', '🐲', '🐲', '🐲'],
}

const STAGE_AURA = ['', '', '✨', '👑']

const SIZE: Record<string, string> = {
  sm: 'w-16 h-16 text-5xl',
  md: 'w-28 h-28 text-7xl',
  lg: 'w-36 h-36 text-8xl',
}

interface Props {
  pet: PetState
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function PetAvatar({ pet, size = 'md', animate = false }: Props) {
  const emoji = SPECIES_EMOJI[pet.species][pet.evolutionStage] ?? '🦊'
  const aura = STAGE_AURA[pet.evolutionStage] ?? ''

  return (
    <div
      className={`${SIZE[size]} rounded-full bg-white shadow-xl flex items-center justify-center select-none relative ${animate ? 'animate-bounce-in' : ''}`}
    >
      <span>{emoji}</span>
      {aura && (
        <span className="absolute -top-1 -right-1 text-base leading-none">{aura}</span>
      )}
    </div>
  )
}
