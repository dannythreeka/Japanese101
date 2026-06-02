import Dexie, { type Table } from 'dexie'
import type { ProgressRecord, SessionRecord, PetState } from '../types'
import type { AdventureProgress } from '../types/adventure'

class AppDB extends Dexie {
  progress!: Table<ProgressRecord, string>
  sessions!: Table<SessionRecord, string>
  pets!: Table<PetState, string>
  adventureProgress!: Table<AdventureProgress, string>

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
  }
}

export const db = new AppDB()

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

const DEFAULT_PET_ID = 'player'

export async function getOrCreatePet(petId = DEFAULT_PET_ID): Promise<PetState> {
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

export async function getPetState(petId = DEFAULT_PET_ID): Promise<PetState | null> {
  return (await db.pets.get(petId)) ?? null
}

// ── Adventure progress ──────────────────────────────────────────────────────

const ADVENTURE_ID = 'player'

export async function getAdventureProgress(): Promise<AdventureProgress | null> {
  return (await db.adventureProgress.get(ADVENTURE_ID)) ?? null
}

export async function saveAdventureProgress(p: AdventureProgress): Promise<void> {
  await db.adventureProgress.put(p)
}

export async function getOrCreateAdventureProgress(firstLevelId: string): Promise<AdventureProgress> {
  const existing = await db.adventureProgress.get(ADVENTURE_ID)
  if (existing) return existing
  const fresh: AdventureProgress = {
    id: ADVENTURE_ID,
    current_level_id: firstLevelId,
    completed_levels: {},
    unlocked_regions: [],
    collected_medals: [],
  }
  await db.adventureProgress.put(fresh)
  return fresh
}
