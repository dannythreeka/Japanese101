import Dexie, { type Table } from 'dexie';
import type { ProgressRecord, SessionRecord, PetState } from '../types';
import type { AdventureProgress } from '../types/adventure';
import type { Profile } from '../types/profile';

/** Returns the active profile ID from localStorage; falls back to 'player' for backward compat */
function getActiveProfileId(): string {
  return localStorage.getItem('activeProfileId') ?? 'player';
}

class AppDB extends Dexie {
  progress!: Table<ProgressRecord, string>;
  sessions!: Table<SessionRecord, string>;
  pets!: Table<PetState, string>;
  adventureProgress!: Table<AdventureProgress, string>;
  profiles!: Table<Profile, string>;

  constructor() {
    super('Japanese101DB');
    this.version(1).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
    });
    this.version(2).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
    });
    this.version(3).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
      adventureProgress: 'id',
    });
    this.version(4).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
      pets: 'petId',
      adventureProgress: 'id',
      profiles: 'profile_id, last_played',
    });
  }
}

export const db = new AppDB();

export async function getOrCreateProgress(
  id: string,
  type: ProgressRecord['type'],
): Promise<ProgressRecord> {
  const existing = await db.progress.get(id);
  if (existing) return existing;
  const fresh: ProgressRecord = {
    id,
    type,
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
    nextReview: 0,
    streak: 0,
  };
  await db.progress.put(fresh);
  return fresh;
}

export async function saveProgress(record: ProgressRecord): Promise<void> {
  await db.progress.put(record);
}

export async function saveSession(session: SessionRecord): Promise<void> {
  await db.sessions.put(session);
}

export async function getAllProgress(): Promise<ProgressRecord[]> {
  return db.progress.toArray();
}

export async function getRecentSessions(limit = 30): Promise<SessionRecord[]> {
  return db.sessions.orderBy('date').reverse().limit(limit).toArray();
}

export async function getTotalStudyTime(): Promise<number> {
  const sessions = await db.sessions.toArray();
  return sessions.reduce((sum, s) => sum + s.durationMs, 0);
}

// ── Profile store ──────────────────────────────────────────────────────────

export async function getProfiles(): Promise<Profile[]> {
  return db.profiles.orderBy('last_played').reverse().toArray();
}

export async function saveProfile(profile: Profile): Promise<void> {
  await db.profiles.put(profile);
}

export async function deleteProfile(profileId: string): Promise<void> {
  await Promise.all([
    db.profiles.delete(profileId),
    db.pets.delete(profileId),
    db.adventureProgress.delete(profileId),
  ]);
}

// ── Pet state ──────────────────────────────────────────────────────────────

export async function getOrCreatePet(petId?: string): Promise<PetState> {
  const id = petId ?? getActiveProfileId();
  const existing = await db.pets.get(id);
  if (existing) return existing;
  const fresh: PetState = {
    petId: id,
    species: 'fox',
    level: 1,
    xp: 0,
    evolutionStage: 0,
    unlockedCosmetics: [],
    collection: [],
    lastPlayed: new Date().toISOString(),
  };
  await db.pets.put(fresh);
  return fresh;
}

export async function savePetState(pet: PetState): Promise<void> {
  await db.pets.put(pet);
}

export async function getPetState(petId?: string): Promise<PetState | null> {
  const id = petId ?? getActiveProfileId();
  return (await db.pets.get(id)) ?? null;
}

// ── Adventure progress ──────────────────────────────────────────────────────

export async function getAdventureProgress(
  profileId?: string,
): Promise<AdventureProgress | null> {
  const id = profileId ?? getActiveProfileId();
  return (await db.adventureProgress.get(id)) ?? null;
}

export async function saveAdventureProgress(
  p: AdventureProgress,
): Promise<void> {
  await db.adventureProgress.put(p);
}

export async function getOrCreateAdventureProgress(
  firstLevelId: string,
  profileId?: string,
): Promise<AdventureProgress> {
  const id = profileId ?? getActiveProfileId();
  const existing = await db.adventureProgress.get(id);
  if (existing) return existing;
  const fresh: AdventureProgress = {
    id,
    current_level_id: firstLevelId,
    completed_levels: {},
    unlocked_regions: [],
    collected_medals: [],
  };
  await db.adventureProgress.put(fresh);
  return fresh;
}

/** Reset adventure progress and pet state for a profile (keeps profile record). */
export async function resetProfileProgress(profileId: string): Promise<void> {
  await db.pets.delete(profileId);
  await db.adventureProgress.delete(profileId);
}
