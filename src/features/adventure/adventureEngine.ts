import { levelsData } from '../../data/loaders'
import { saveAdventureProgress } from '../../db'
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

export function computeStars(
  level: Level,
  results: Record<string, { accuracy: number }>,
): 1 | 2 | 3 {
  const threshold = level.stars_criteria.accuracy_threshold
  const accuracies = Object.values(results).map((r) => r.accuracy)
  if (accuracies.length === 0) return 1
  const allAbove = accuracies.every((a) => a >= threshold)
  const anyAbove = accuracies.some((a) => a >= threshold)
  if (allAbove) return 3
  if (anyAbove) return 2
  return 1
}

export async function completeLevel(
  progress: AdventureProgress,
  level: Level,
  stars: 1 | 2 | 3,
  bestAccuracy: number,
): Promise<AdventureProgress> {
  const existing = progress.completed_levels[level.level_id]
  const updated: AdventureProgress = {
    ...progress,
    completed_levels: {
      ...progress.completed_levels,
      [level.level_id]: {
        completed_at: new Date().toISOString(),
        stars: Math.max(stars, existing?.stars ?? 1) as 1 | 2 | 3,
        best_accuracy: Math.max(bestAccuracy, existing?.best_accuracy ?? 0),
        times_played: (existing?.times_played ?? 0) + 1,
      },
    },
  }
  const sorted = getSortedLevels()
  const idx = sorted.findIndex((l) => l.level_id === level.level_id)
  const next = sorted[idx + 1]
  if (next && updated.current_level_id === level.level_id) {
    updated.current_level_id = next.level_id
  }
  await saveAdventureProgress(updated)
  return updated
}
