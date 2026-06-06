import PetStage from './PetStage'
import type { PetState } from '../types'

interface Props {
  pet: PetState
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const SIZE_PX = { sm: 80, md: 112, lg: 144 }

export default function PetAvatar({ pet, size = 'md', animate = false }: Props) {
  const px = SIZE_PX[size]
  return (
    <div
      style={{
        width: px, height: px,
        borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'visible',
        position: 'relative',
      }}
      aria-label={`pet level ${pet.level}`}
    >
      <PetStage stage={pet.evolutionStage} animate={animate} size={px} />
    </div>
  )
}
