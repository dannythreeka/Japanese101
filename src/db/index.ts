import Dexie, { type Table } from 'dexie'
import type { ProgressRecord, SessionRecord, PetState } from '../types'
import type { AdventureProgress } from '../types/adventure'
import type { Profile } from '../types/profile'

class AppDB extends Dexie {
  progress!: Table<ProgressRecord, string>
  sessions!: Table<SessionRecord, string>
  pets!: Table<PetState, string>
  adventureProgress!: Table<AdventureProgress, string>
  profiles!: Table<Profile, string>

  constructor() {
    super('Japanese101DB')
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
  }
}

export const db = new AppDB()

// ── Active profile ──────────────────────────────────────────────────────────

const DEFAULT_PROFILE_ID = 'player'

export function getActiveProfileId(): string {
  return localStorage.getItem('activeProfileId') ?? DEFAULT_PROFILE_ID
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem('activeProfileId', id)
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
    profile_id: `player_${Date.now()}`,
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

export async function deleteProfile(profileId: string): Promise<void> {
  await Promise.all([
    db.profiles.delete(profileId),
    db.pets.delete(profileId),
    db.adventureProgress.delete(profileId),
  ])
}

export async function resetProfileProgress(profileId: string): Promise<void> {
  await db.pets.delete(profileId)
  await db.adventureProgress.delete(profileId)
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
): Promise<ProgressRecord> {
  const existing = await db.progress.get(id)
  if (existing) return existing
  const fresh: ProgressRecord = {
    id,
    type,
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
    nextReview: 0,
    streak: 0,
  }
  await db.progress.put(fresh)
  return fresh
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  await db.progress.put(record)
}

export async function saveSession(session: SessionRecord): Promise<void> {
  await db.sessions.put(session)
}

export async function getAllProgress(): Promise<ProgressRecord[]> {
  return db.progress.toArray()
}

export async function getRecentSessions(limit = 30): Promise<SessionRecord[]> {
  return db.sessions.orderBy('date').reverse().limit(limit).toArray()
}

export async function getTotalStudyTime(): Promise<number> {
  const sessions = await db.sessions.toArray()
  return sessions.reduce((sum, s) => sum + s.durationMs, 0)
}

// ── Pet state ──────────────────────────────────────────────────────────────

export async function getOrCreatePet(petId = getActiveProfileId()): Promise<PetState> {
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

export async function getPetState(petId = getActiveProfileId()): Promise<PetState | null> {
  return (await db.pets.get(petId)) ?? null
}

// ── Adventure progress ──────────────────────────────────────────────────────

export async function getAdventureProgress(profileId = getActiveProfileId()): Promise<AdventureProgress | null> {
  return (await db.adventureProgress.get(profileId)) ?? null
}

export async function saveAdventureProgress(p: AdventureProgress): Promise<void> {
  await db.adventureProgress.put(p)
}

export async function getOrCreateAdventureProgress(firstLevelId: string, profileId = getActiveProfileId()): Promise<AdventureProgress> {
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
