import { levelsData } from '../../data/loaders'
import type { Level, LevelStatus, AdventureProgress } from '../../types/adventure'

export function getSortedLevels(): Level[] {
  return [...levelsData().levels].sort((a, b) => a.level_number - b.level_number)
}

export function getLevelStatus(level: Level, progress: AdventureProgress): LevelStatus {
  if (progress.completed_levels[level.level_id]) return 'completed'
  if (level.level_id === progress.current_level_id) return 'next'
  return 'locked'
}

export function getCurrentLevel(levels: Level[], progress: AdventureProgress): Level | null {
  return levels.find((l) => l.level_id === progress.current_level_id) ?? null
}

export function getFirstLevelId(): string {
  const sorted = getSortedLevels()
  return sorted[0]?.level_id ?? ''
}
