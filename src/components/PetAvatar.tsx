import type { PetState } from '../types'
import { getActiveCosmetic } from '../lib/cosmetics'

// 7 stages per species: 0=egg, 1=hatchling, 2-6=evolution stages
const SPECIES_EMOJI: Record<PetState['species'], string[]> = {
  fox:    ['🥚', '🐣', '🦊', '🦊', '🦊', '🦊', '🦊'],
  cat:    ['🥚', '🐣', '🐱', '🐱', '🐱', '🐱', '🐱'],
  dragon: ['🥚', '🐣', '🐲', '🐲', '🐲', '🐲', '🐲'],
}

// stage 0-1: no aura; 2: wind; 3: sparkle; 4: crown; 5: star; 6: fire
const STAGE_AURA = ['', '', '💨', '✨', '👑', '🌟', '🔥']

// Background ring colours per stage
const STAGE_RING = [
  'bg-gray-100',       // 0 egg
  'bg-yellow-50',      // 1 hatchling
  'bg-emerald-50',     // 2 wind
  'bg-sky-50',         // 3 wings
  'bg-purple-50',      // 4 symbol
  'bg-amber-50',       // 5 glow
  'bg-gradient-to-br from-yellow-100 to-pink-100',  // 6 ultimate
]

const SIZE: Record<string, string> = {
  sm: 'w-16 h-16 text-5xl',
  md: 'w-28 h-28 text-7xl',
  lg: 'w-36 h-36 text-8xl',
}

const COSMETIC_TEXT: Record<string, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

interface Props {
  pet: PetState
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function PetAvatar({ pet, size = 'md', animate = false }: Props) {
  const stage = Math.min(pet.evolutionStage, 6)
  const emoji = SPECIES_EMOJI[pet.species][stage] ?? '🦊'
  const aura = STAGE_AURA[stage] ?? ''
  const ring = STAGE_RING[stage] ?? 'bg-white'
  const cosmetic = getActiveCosmetic(pet.unlockedCosmetics)

  return (
    <div
      className={`${SIZE[size]} rounded-full ${ring} shadow-xl flex items-center justify-center select-none relative ${animate ? 'animate-bounce-in' : ''}`}
    >
      <span>{emoji}</span>
      {cosmetic && (
        <span className={`absolute -top-2 left-1/2 -translate-x-1/2 ${COSMETIC_TEXT[size]} leading-none`}>
          {cosmetic.emoji}
        </span>
      )}
      {!cosmetic && aura && (
        <span className="absolute -top-1 -right-1 text-base leading-none">{aura}</span>
      )}
    </div>
  )
}
