import type { GameModeId } from './index'

export interface Region {
  region_id: string
  name_zh: string
  name_ja?: string
  order: number
  asset_hint: string
  level_ids: string[]
}

export interface StarsCriteria {
  one: 'complete'
  two: 'one_challenge_above_accuracy'
  three: 'all_challenges_above_accuracy'
  accuracy_threshold: number
}

export interface Challenge {
  challenge_id: string
  game_mode: GameModeId
  config_overrides?: Record<string, unknown>
  required_for_completion?: boolean
}

export type LevelType = 'tutorial' | 'lesson' | 'boss'

export interface Level {
  level_id: string
  level_number: number
  level_type: LevelType
  region_id: string
  title_zh: string
  title_ja?: string
  subtitle_zh?: string
  subtitle_ja?: string
  story_intro_zh?: string
  story_intro_ja?: string
  unit_id?: string
  challenges: Challenge[]
  boss_review_units?: string[]
  scene_hint?: string
  xp_reward: number
  stars_criteria: StarsCriteria
}

export interface LevelsData {
  regions: Region[]
  levels: Level[]
}

export interface CompletedLevelRecord {
  completed_at: string
  stars: 1 | 2 | 3
  best_accuracy: number
  times_played: number
}

export interface AdventureProgress {
  id: string
  current_level_id: string
  completed_levels: Record<string, CompletedLevelRecord>
  unlocked_regions: string[]
  collected_medals: string[]
}

export type LevelStatus = 'completed' | 'next' | 'locked'
