export interface Cosmetic {
  id: string
  emoji: string
  nameJa: string
  unlockLevel: number
}

export const COSMETICS: Cosmetic[] = [
  { id: 'bow',        emoji: '🎀', nameJa: 'リボン',       unlockLevel: 3  },
  { id: 'flower',     emoji: '🌸', nameJa: 'はな',         unlockLevel: 5  },
  { id: 'tophat',     emoji: '🎩', nameJa: 'シルクハット',  unlockLevel: 7  },
  { id: 'graduation', emoji: '🎓', nameJa: 'がくぼうし',   unlockLevel: 10 },
  { id: 'crown',      emoji: '👑', nameJa: 'おうかん',     unlockLevel: 15 },
]

export function getNewlyUnlocked(oldLevel: number, newLevel: number): Cosmetic[] {
  return COSMETICS.filter(c => c.unlockLevel > oldLevel && c.unlockLevel <= newLevel)
}

// Returns the highest-level unlocked cosmetic (auto-equip best)
export function getActiveCosmetic(unlockedIds: string[]): Cosmetic | null {
  const unlocked = COSMETICS.filter(c => unlockedIds.includes(c.id))
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null
}
