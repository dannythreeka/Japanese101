import type { PetState } from '../types';
import { getActiveCosmetic } from '../lib/cosmetics';
import { PET_STAGES } from '../data/petStages';

const SIZE: Record<string, string> = {
  sm: 'w-16 h-16 text-5xl',
  md: 'w-28 h-28 text-7xl',
  lg: 'w-36 h-36 text-8xl',
};

const COSMETIC_TEXT: Record<string, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

interface Props {
  pet: PetState;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function PetAvatar({
  pet,
  size = 'md',
  animate = false,
}: Props) {
  const stageData = PET_STAGES[pet.evolutionStage] ?? PET_STAGES[0];
  const emoji = stageData.emoji;
  const aura = stageData.aura;
  const cosmetic = getActiveCosmetic(pet.unlockedCosmetics);

  return (
    <div
      className={`${SIZE[size]} rounded-full bg-white shadow-xl flex items-center justify-center select-none relative ${animate ? 'animate-bounce-in' : ''}`}
    >
      <span>{emoji}</span>
      {cosmetic && (
        <span
          className={`absolute -top-2 left-1/2 -translate-x-1/2 ${COSMETIC_TEXT[size]} leading-none`}
        >
          {cosmetic.emoji}
        </span>
      )}
      {!cosmetic && aura && (
        <span className="absolute -top-1 -right-1 text-base leading-none">
          {aura}
        </span>
      )}
    </div>
  );
}
