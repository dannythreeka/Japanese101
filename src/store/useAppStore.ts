import { create } from 'zustand'
import { getActiveProfileId, getProfilePreferences, saveProfilePreferences, db } from '../db'
import { incrementStars } from '../db/profile-data'
import { defaultPreferences } from '../db/models'
import type { ProfilePreferences } from '../db/models'
import type { KanaMode, KanaDifficulty, AgeMode, MicMode, WriteDifficulty } from '../types'
import type { UiLang } from '../lib/i18n'

export interface AdventureSession {
  id?: string
  profileId?: string
  levelId: string
  pending: {
    challengeId: string
    gameMode: string
    configOverrides: Record<string, unknown>
  } | null
  results: Record<string, { accuracy: number; xpGained: number; sessionId?: string }>
}

interface AppState {
  profileId: string
  enhancedConsent: boolean
  storageError: string | null
  hydrateProfile: (profileId: string) => Promise<void>
  retryStorage: () => Promise<void>

  kanaMode: KanaMode
  kanaDifficulty: KanaDifficulty
  ageMode: AgeMode
  micMode: MicMode
  uiLang: UiLang
  disabledUnits: string[]
  sessionStartTime: number | null
  totalStars: number
  parentUnlocked: boolean
  adventureSession: AdventureSession | null

  writeDifficulty: WriteDifficulty
  setWriteDifficulty: (d: WriteDifficulty) => void
  setKanaMode: (mode: KanaMode) => void
  setKanaDifficulty: (level: KanaDifficulty) => void
  setAgeMode: (mode: AgeMode) => void
  setMicMode: (mode: MicMode) => void
  setUiLang: (lang: UiLang) => void
  toggleUnit: (unitId: string) => void
  startSession: () => void
  endSession: () => number
  addStars: (n: number) => void
  setParentUnlocked: (v: boolean) => void
  initAdventureSession: (levelId: string) => void
  launchChallenge: (challengeId: string, gameMode: string, overrides: Record<string, unknown>) => void
  recordChallengeResult: (challengeId: string, accuracy: number, xpGained: number) => void
  cancelAdventureChallenge: () => void
  clearAdventureSession: () => void
}

let retryPending: (() => Promise<unknown>) | null = null
export const useAppStore = create<AppState>((set, get) => {
  const persist = (patch: Partial<ProfilePreferences>) => {
    const snapshot = { ...get() }
    const profileId = snapshot.profileId
    const preferences: ProfilePreferences = {
      profileId, kanaMode: snapshot.kanaMode, kanaDifficulty: snapshot.kanaDifficulty,
      ageMode: snapshot.ageMode, micMode: snapshot.micMode, enhancedConsent: snapshot.enhancedConsent,
      uiLang: snapshot.uiLang, disabledUnits: snapshot.disabledUnits, writeDifficulty: snapshot.writeDifficulty, ...patch,
    }
    set(patch)
    const operation = () => saveProfilePreferences(preferences)
    void operation().catch((error: unknown) => { retryPending = operation; set({ storageError: String(error) }) })
  }
  return {
  ...defaultPreferences(getActiveProfileId()),
  storageError: null,
  sessionStartTime: null,
  totalStars: 0,
  parentUnlocked: false,
  adventureSession: null,
  hydrateProfile: async (profileId) => {
    const [preferences, wallet] = await Promise.all([getProfilePreferences(profileId), db.wallets.get(profileId)])
    if (getActiveProfileId() !== profileId) return
    set({ ...preferences, totalStars: wallet?.stars ?? 0, adventureSession: null, sessionStartTime: null, parentUnlocked: false })
  },
  retryStorage: async () => { if (retryPending) await retryPending(); retryPending = null; set({ storageError: null }) },
  setWriteDifficulty: (writeDifficulty) => persist({ writeDifficulty }),
  setKanaMode: (kanaMode) => persist({ kanaMode }),
  setKanaDifficulty: (kanaDifficulty) => persist({ kanaDifficulty }),
  setAgeMode: (ageMode) => persist({ ageMode }),
  setMicMode: (micMode) => persist({ micMode, enhancedConsent: micMode === 'enhanced' }),
  setUiLang: (uiLang) => persist({ uiLang }),
  toggleUnit: (unitId) => { const current = get().disabledUnits; persist({ disabledUnits: current.includes(unitId) ? current.filter(id => id !== unitId) : [...current, unitId] }) },

  startSession: () => set({ sessionStartTime: Date.now() }),

  endSession: () => {
    const start = get().sessionStartTime
    const duration = start ? Date.now() - start : 0
    set({ sessionStartTime: null })
    return duration
  },

  addStars: (n) => {
    const profileId = get().profileId
    const operation = async () => { const totalStars = await incrementStars(profileId, n); if (get().profileId === profileId) set({ totalStars }) }
    void operation().catch((error: unknown) => { retryPending = operation; set({ storageError: String(error) }) })
  },

  setParentUnlocked: (v) => set({ parentUnlocked: v }),

  initAdventureSession: (levelId) => {
    const current = get().adventureSession
    if (current?.levelId === levelId) return  // keep existing results for replay
    set({ adventureSession: { levelId, pending: null, results: {} } })
  },

  launchChallenge: (challengeId, gameMode, overrides) => {
    const current = get().adventureSession
    if (!current) return
    set({ adventureSession: { ...current, pending: { challengeId, gameMode, configOverrides: overrides } } })
  },

  recordChallengeResult: (challengeId, accuracy, xpGained) => {
    const current = get().adventureSession
    if (!current) return
    set({
      adventureSession: {
        ...current,
        pending: null,
        results: { ...current.results, [challengeId]: { accuracy, xpGained } },
      },
    })
  },

  cancelAdventureChallenge: () => {
    const current = get().adventureSession
    if (!current) return
    set({ adventureSession: { ...current, pending: null } })
  },

  clearAdventureSession: () => set({ adventureSession: null }),
  }
})
