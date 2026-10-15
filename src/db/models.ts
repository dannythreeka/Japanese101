import type { ProgressRecord, SessionRecord, KanaMode, KanaDifficulty, AgeMode, MicMode, WriteDifficulty } from '../types'
import type { UiLang } from '../lib/i18n'
import type { QuestionAttempt } from '../lib/attempts'
import type { AdventureSession } from '../store/useAppStore'

export type ScopedProgress = ProgressRecord & { profileId: string }
export type ScopedSession = SessionRecord & { profileId: string; completionRate?: number; evidenceKind?: 'independent' | 'participation' }
export interface ProfilePreferences {
  profileId: string
  kanaMode: KanaMode
  kanaDifficulty: KanaDifficulty
  ageMode: AgeMode
  micMode: MicMode
  enhancedConsent: boolean
  uiLang: UiLang
  disabledUnits: string[]
  writeDifficulty: WriteDifficulty
}
export const defaultPreferences = (profileId: string): ProfilePreferences => ({ profileId, kanaMode: 'hiragana', kanaDifficulty: 1, ageMode: 'young', micMode: 'off', enhancedConsent: false, uiLang: 'zh', disabledUnits: [], writeDifficulty: 1 })
export interface GameCheckpoint {
  id: string
  profileId: string
  feature: SessionRecord['feature']
  routeKey: string
  contentVersion: string
  status: 'active' | 'finished' | 'abandoned'
  startedAt: number
  updatedAt: number
  planned: number
  checkpoint: Record<string, unknown>
  attempts: Record<string, QuestionAttempt>
  levelSessionId?: string
  challengeId?: string
}
export interface LevelSession extends AdventureSession {
  id: string
  profileId: string
  contentVersion: string
  startedAt: number
  status: 'active' | 'completed'
}
export interface MigrationBackup {
  id: string
  createdAt: number
  tables: Record<string, unknown[]>
  localPreferences: Record<string, string>
}
export interface RewardReceipt { id: string; profileId: string; xp: number; stars: number; createdAt: number }
