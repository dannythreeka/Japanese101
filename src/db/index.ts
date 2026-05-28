import Dexie, { type Table } from 'dexie'
import type { ProgressRecord, SessionRecord } from '../types'

class AppDB extends Dexie {
  progress!: Table<ProgressRecord, string>
  sessions!: Table<SessionRecord, string>

  constructor() {
    super('Japanese101DB')
    this.version(1).stores({
      progress: 'id, type, nextReview, lastSeen',
      sessions: 'id, date, feature',
    })
  }
}

export const db = new AppDB()

export async function getOrCreateProgress(id: string, type: ProgressRecord['type']): Promise<ProgressRecord> {
  const existing = await db.progress.get(id)
  if (existing) return existing
  const fresh: ProgressRecord = { id, type, correct: 0, incorrect: 0, lastSeen: 0, nextReview: 0, streak: 0 }
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
