import Dexie, { type Table } from 'dexie'
import type { ProgressRecord, SessionRecord, PetState } from '../types'
import type { AdventureProgress } from '../types/adventure'
import type { Profile } from '../types/profile'
import { normalizePreferences } from './models'
import type { ScopedProgress, ScopedSession, ProfilePreferences, MigrationBackup, GameCheckpoint, LevelSession, RewardReceipt } from './models'
import type { Attempt } from '../content/contracts'
import type { WorldCheckpoint, StudyPlan, SkillReview, BattleSession, CoinWallet, CoinLedger, InventoryItem, Equipment, PurchaseReceipt, FirstWin, LearningCheck, CatalogVersion } from './journey-models'
import type {MockSession} from '../mock/session'
import type {MockCommandReceipt} from '../mock/storage'

export class AppDB extends Dexie {
  progress!: Table<ProgressRecord, string> // Original, read-only legacy-shared records.
  sessions!: Table<SessionRecord, string>
  pets!: Table<PetState, string>
  adventureProgress!: Table<AdventureProgress, string>
  profiles!: Table<Profile, string>
  playerProgress!: Table<ScopedProgress, [string, string]>
  playerSessions!: Table<ScopedSession, string>
  preferences!: Table<ProfilePreferences, string>
  wallets!: Table<{ profileId: string; stars: number }, string>
  gameCheckpoints!: Table<GameCheckpoint, string>
  levelSessions!: Table<LevelSession, string>
  rewardReceipts!: Table<RewardReceipt, string>
  dailyClaims!: Table<{ profileId: string; date: string; taskId: string }, [string, string, string]>
  migrationBackups!: Table<MigrationBackup, string>
  learningAttempts!: Table<Attempt,string>
  worldCheckpoints!: Table<WorldCheckpoint,string>
  studyPlans!: Table<StudyPlan,[string,string]>
  skillReviews!: Table<SkillReview,[string,string]>
  battleSessions!: Table<BattleSession,string>
  coinWallets!: Table<CoinWallet,string>
  coinLedger!: Table<CoinLedger,string>
  inventory!: Table<InventoryItem,[string,string]>
  equipment!: Table<Equipment,string>
  purchaseReceipts!: Table<PurchaseReceipt,string>
  firstWins!: Table<FirstWin,[string,string]>
  learningChecks!: Table<LearningCheck,string>
  catalogVersions!: Table<CatalogVersion,string>
  mockSessions!: Table<MockSession,string>
  mockCommandReceipts!: Table<MockCommandReceipt,string>
  constructor(name = 'Japanese101DB') {
    super(name)
    this.version(1).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
    })
    this.version(2).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
    })
    this.version(3).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
      adventureProgress: 'id',
    })
    this.version(4).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
      adventureProgress: 'id',
      profiles: 'profile_id, created_at',
    })
    this.version(5).stores({
      playerProgress: '[profileId+id], profileId, [profileId+nextReview]',
      playerSessions: 'id, profileId, [profileId+date]',
      preferences: 'profileId',
      wallets: 'profileId',
      gameCheckpoints: 'id, profileId, [profileId+routeKey], status',
      levelSessions: 'id, profileId, [profileId+levelId], status',
      rewardReceipts: 'id, profileId',
      dailyClaims: '[profileId+date+taskId], profileId',
      migrationBackups: 'id',
    }).upgrade(async tx => {
      const tables: Record<string, unknown[]> = {}
      for (const name of ['progress', 'sessions', 'pets', 'adventureProgress', 'profiles']) {
        tables[name] = await tx.table(name).toArray()
      }
      const localPreferences: Record<string, string> = {}
      try {
        for (let n = 0; n < localStorage.length; n++) {
          const key = localStorage.key(n)
          // Preserve old app state, never unrelated credentials or sync tokens.
          if (key && (/^completedTasks_/.test(key) || ['kanaMode','kanaDifficulty','ageMode','micMode','uiLang','disabledUnits','totalStars','writeDifficulty','sfxEnabled','sfxVolume'].includes(key))) {
            localPreferences[key] = localStorage.getItem(key) ?? ''
          }
        }
      } catch { /* Browser may deny localStorage; original IndexedDB remains intact. */ }
      await tx.table('migrationBackups').put({ id: 'pre-v5', createdAt: Date.now(), tables, localPreferences })
      // Legacy progress/sessions are unassignable: keep original tables, never guess an owner.
    })
    this.version(6).stores({
      learningAttempts:'id, profileId, [profileId+primarySkillId], sessionId',
      worldCheckpoints:'profileId',studyPlans:'[profileId+unitId], profileId',skillReviews:'[profileId+skillId], profileId, [profileId+dueDate]',
      battleSessions:'id, profileId, [profileId+challengeId], status',coinWallets:'profileId',coinLedger:'id, profileId',
      inventory:'[profileId+itemId], profileId',equipment:'profileId',purchaseReceipts:'id, profileId',firstWins:'[profileId+challengeId], profileId',
    }).upgrade(async tx => {
      const tables:Record<string,unknown[]>={}
      for(const name of ['progress','sessions','pets','adventureProgress','profiles','playerProgress','playerSessions','preferences','wallets','gameCheckpoints','levelSessions','rewardReceipts','dailyClaims']) tables[name]=await tx.table(name).toArray()
      await tx.table('migrationBackups').put({id:'pre-v6',createdAt:Date.now(),tables,localPreferences:{}})
      // New journey state starts separately. Existing coins/stars/pets are never converted or reset.
    })
    // v6 was already pushed as a review build: add tables with a new schema version.
    this.version(7).stores({learningChecks:'id, profileId, [profileId+unitId]'})
    this.version(8).stores({catalogVersions:'id'})
    // Additive only: preserve every existing journey, wallet, profile and legacy record.
    this.version(9).stores({mockSessions:'id, profileId, [profileId+paperId], status',mockCommandReceipts:'id, profileId, sessionId'})
  }
}

export const db = new AppDB()

// ── Active profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE_ID = 'player'

export function getActiveProfileId(): string {
  try { return localStorage.getItem('activeProfileId') ?? DEFAULT_PROFILE_ID } catch { return DEFAULT_PROFILE_ID }
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem('activeProfileId', id)
  window.dispatchEvent(new Event('profilechanged'))
}

// ── Profile CRUD ────────────────────────────────────────────────────────────

export async function getAllProfiles(): Promise<Profile[]> {
  return db.profiles.orderBy('created_at').toArray()
}

export async function getProfile(profileId: string): Promise<Profile | null> {
  return (await db.profiles.get(profileId)) ?? null
}

export async function createProfile(name: string, avatarEmoji: string): Promise<Profile> {
  const profile: Profile = {
    profile_id: `player_${crypto.randomUUID()}`,
    name,
    avatar_emoji: avatarEmoji,
    created_at: Date.now(),
    last_played: Date.now(),
  }
  await db.profiles.put(profile)
  return profile
}

export async function updateProfileLastPlayed(profileId: string): Promise<void> {
  await db.profiles.where('profile_id').equals(profileId).modify({ last_played: Date.now() })
}

export async function resetProfileProgress(profileId: string, notify = true): Promise<void> {
  const journey=[db.learningAttempts,db.worldCheckpoints,db.studyPlans,db.skillReviews,db.battleSessions,db.coinWallets,db.coinLedger,db.inventory,db.equipment,db.purchaseReceipts,db.firstWins,db.learningChecks,db.mockSessions,db.mockCommandReceipts]
  await db.transaction('rw', [db.pets, db.adventureProgress, db.playerProgress, db.playerSessions, db.gameCheckpoints, db.levelSessions, db.rewardReceipts, db.dailyClaims, db.wallets,...journey], async () => {
    for (const table of [db.playerProgress, db.playerSessions, db.gameCheckpoints, db.levelSessions, db.rewardReceipts, db.dailyClaims,...journey]) await table.where('profileId').equals(profileId).delete()
    await db.pets.delete(profileId)
    await db.adventureProgress.delete(profileId)
    await db.wallets.delete(profileId)
  })
  if (notify && getActiveProfileId() === profileId) window.dispatchEvent(new Event('profilechanged'))
}
export async function deleteProfile(profileId: string): Promise<void> {
  await db.transaction('rw', db.tables.filter(t => !['progress','sessions','migrationBackups'].includes(t.name)), async () => {
    await resetProfileProgress(profileId, false)
    await db.preferences.delete(profileId)
    await db.profiles.delete(profileId)
  })
  if (getActiveProfileId() === profileId) {
    const remaining = await getAllProfiles()
    const next = remaining[0] ?? await ensureDefaultProfile()
    setActiveProfileId(next.profile_id)
  }
}

export async function ensureDefaultProfile(): Promise<Profile> {
  const existing = await db.profiles.get(DEFAULT_PROFILE_ID)
  if (existing) return existing
  const profile: Profile = {
    profile_id: DEFAULT_PROFILE_ID,
    name: 'プレイヤー',
    avatar_emoji: '🦊',
    created_at: Date.now(),
    last_played: Date.now(),
  }
  await db.profiles.put(profile)
  return profile
}

// ── Progress ────────────────────────────────────────────────────────────────

export async function getOrCreateProgress(
  id: string,
  type: ProgressRecord['type'],
  profileId: string,
): Promise<ScopedProgress> {
  const existing = await db.playerProgress.get([profileId, id])
  if (existing) return existing
  const fresh: ScopedProgress = {
    id, profileId,
    type,
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
    nextReview: 0,
    streak: 0,
  }
  await db.playerProgress.put(fresh)
  return fresh
}

export async function saveProgress(record: ScopedProgress): Promise<void> {
  await db.playerProgress.put(record)
}

export async function saveSession(profileId: string, session: SessionRecord): Promise<void> {
  await db.playerSessions.put({ ...session, profileId })
}

export async function getAllProgress(profileId: string): Promise<ScopedProgress[]> {
  return db.playerProgress.where('profileId').equals(profileId).toArray()
}

export async function getRecentSessions(profileId: string, limit = 30): Promise<ScopedSession[]> {
  return db.playerSessions.where('[profileId+date]').between([profileId, Dexie.minKey], [profileId, Dexie.maxKey]).reverse().limit(limit).toArray()
}

export async function getTotalStudyTime(profileId: string): Promise<number> {
  const sessions = await db.playerSessions.where('profileId').equals(profileId).toArray()
  return sessions.reduce((sum, s) => sum + s.durationMs, 0)
}

// ── Pet state ──────────────────────────────────────────────────────────────

export async function getOrCreatePet(petId: string): Promise<PetState> {
  const existing = await db.pets.get(petId)
  if (existing) return existing
  const fresh: PetState = {
    petId,
    species: 'fox',
    level: 1,
    xp: 0,
    evolutionStage: 0,
    unlockedCosmetics: [],
    collection: [],
    lastPlayed: new Date().toISOString(),
  }
  await db.pets.put(fresh)
  return fresh
}

export async function savePetState(pet: PetState): Promise<void> {
  await db.pets.put(pet)
}

export async function getPetState(petId: string): Promise<PetState | null> {
  return (await db.pets.get(petId)) ?? null
}

// ── Adventure progress ──────────────────────────────────────────────────────

export async function getAdventureProgress(profileId: string): Promise<AdventureProgress | null> {
  return (await db.adventureProgress.get(profileId)) ?? null
}

export async function saveAdventureProgress(p: AdventureProgress): Promise<void> {
  await db.adventureProgress.put(p)
}

export async function getOrCreateAdventureProgress(firstLevelId: string, profileId: string): Promise<AdventureProgress> {
  const existing = await db.adventureProgress.get(profileId)
  if (existing) return existing
  const fresh: AdventureProgress = {
    id: profileId,
    current_level_id: firstLevelId,
    completed_levels: {},
    unlocked_regions: [],
    collected_medals: [],
  }
  await db.adventureProgress.put(fresh)
  return fresh
}

export async function getProfilePreferences(profileId: string): Promise<ProfilePreferences> {
  return normalizePreferences(profileId, await db.preferences.get(profileId))
}
export async function saveProfilePreferences(preferences: ProfilePreferences): Promise<void> {
  await db.transaction('rw', [db.profiles, db.preferences], async () => {
    if (!await db.profiles.get(preferences.profileId)) throw new Error('Player no longer exists')
    await db.preferences.put(normalizePreferences(preferences.profileId,preferences))
  })
}
export async function getLegacySharedBackup(): Promise<MigrationBackup | undefined> {
  return db.migrationBackups.get('pre-v5')
}
