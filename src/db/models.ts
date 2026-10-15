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
  sfxEnabled: boolean
  sfxVolume: number
  writeDifficulty: WriteDifficulty
}
export const defaultPreferences = (profileId: string): ProfilePreferences => ({ profileId, kanaMode: 'hiragana', kanaDifficulty: 1, ageMode: 'young', micMode: 'off', enhancedConsent: false, uiLang: 'zh', disabledUnits: [], sfxEnabled: true, sfxVolume: 1, writeDifficulty: 1 })
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
  reward?: { xp: number; stars: number }
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
  updatedAt: number
  status: 'active' | 'completed'
}
export interface MigrationBackup {
  id: string
  createdAt: number
  tables: Record<string, unknown[]>
  localPreferences: Record<string, string>
}
export interface RewardReceipt { id: string; profileId: string; xp: number; stars: number; createdAt: number }

/** Invalid persisted settings fall back safely; raw legacy backups remain untouched. */
export function normalizePreferences(profileId: string, raw: unknown): ProfilePreferences {
  const defaults = defaultPreferences(profileId)
  if (!raw || typeof raw !== 'object') return defaults
  const input = raw as Record<string, unknown>
  const result = { ...defaults }
  if (['hiragana','katakana','both'].includes(String(input.kanaMode))) result.kanaMode = input.kanaMode as KanaMode
  if ([1,2,3,'all'].includes(input.kanaDifficulty as number)) result.kanaDifficulty = input.kanaDifficulty as KanaDifficulty
  if (['young','advanced'].includes(String(input.ageMode))) result.ageMode = input.ageMode as AgeMode
  if (['zh','ja'].includes(String(input.uiLang))) result.uiLang = input.uiLang as UiLang
  if ([1,2,3].includes(Number(input.writeDifficulty))) result.writeDifficulty = input.writeDifficulty as WriteDifficulty
  if (Array.isArray(input.disabledUnits)) result.disabledUnits = input.disabledUnits.filter((id):id is string=>typeof id==='string')
  result.enhancedConsent = input.enhancedConsent === true
  if (input.micMode === 'offline' || input.micMode === 'enhanced' && result.enhancedConsent) result.micMode = input.micMode
  if (typeof input.sfxEnabled === 'boolean') result.sfxEnabled = input.sfxEnabled
  if (typeof input.sfxVolume === 'number' && Number.isFinite(input.sfxVolume)) result.sfxVolume = Math.min(1, Math.max(0,input.sfxVolume))
  return result
}
