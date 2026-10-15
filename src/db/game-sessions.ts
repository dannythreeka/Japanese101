import { db, getOrCreateProgress } from './index'
import type { GameCheckpoint } from './models'
import type { SessionRecord } from '../types'
import { recordAnswer, skipQuestion, summarizeAttempts } from '../lib/attempts'
import { updateAfterCorrect, updateAfterIncorrect } from '../lib/srs'
import { addXpToPet, calculateXpGain } from '../lib/pet'
import { incrementStars } from './profile-data'

export const CONTENT_VERSION = 'legacy-v1-reliable-1'
const participating = (feature: SessionRecord['feature']) => ['flashcard','kana_write','kotodama'].includes(feature)

async function owned(profileId: string, sessionId: string) {
  if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
  const session = await db.gameCheckpoints.get(sessionId)
  if (!session || session.profileId !== profileId) throw new Error('Session does not belong to this player')
  if (session.contentVersion !== CONTENT_VERSION) throw new Error('Content version changed; previous answers are preserved')
  return session
}

export async function openGameSession(profileId: string, routeKey: string, feature: SessionRecord['feature'], context?: { levelSessionId: string; challengeId: string }): Promise<GameCheckpoint> {
  return db.transaction('rw', [db.profiles, db.gameCheckpoints], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const existing = (await db.gameCheckpoints.where('[profileId+routeKey]').equals([profileId, routeKey]).toArray()).find(s => s.status === 'active')
    if (existing) {
      if (existing.contentVersion !== CONTENT_VERSION) throw new Error('Content version changed; previous answers are preserved')
      return existing
    }
    const session: GameCheckpoint = { id: crypto.randomUUID(), profileId, routeKey, feature, status: 'active', contentVersion: CONTENT_VERSION, startedAt: Date.now(), updatedAt: Date.now(), planned: 0, checkpoint: {}, attempts: {}, ...context }
    await db.gameCheckpoints.add(session)
    return session
  })
}
export async function abandonGameSession(profileId: string, sessionId: string): Promise<void> {
  await db.transaction('rw', [db.profiles, db.gameCheckpoints], async () => {
    const session = await owned(profileId, sessionId)
    if (session.status === 'active') await db.gameCheckpoints.put({ ...session, status: 'abandoned', updatedAt: Date.now() })
  })
}
export async function saveCheckpoint(profileId: string, sessionId: string, patch: Record<string, unknown>, planned?: number): Promise<GameCheckpoint> {
  return db.transaction('rw', [db.profiles, db.gameCheckpoints], async () => {
    const session = await owned(profileId, sessionId)
    if (session.status !== 'active') return session
    if (planned !== undefined && (!Number.isInteger(planned) || planned < 0 || planned > 1000)) throw new Error('Invalid question count')
    const updated = { ...session, planned: planned ?? session.planned, checkpoint: { ...session.checkpoint, ...patch }, updatedAt: Date.now() }
    await db.gameCheckpoints.put(updated)
    return updated
  })
}
export async function submitGameAnswer(profileId: string, sessionId: string, questionId: string, itemId: string, type: 'kana' | 'vocab', answer: boolean | null, hintUsed = false): Promise<GameCheckpoint> {
  return db.transaction('rw', [db.profiles, db.gameCheckpoints, db.playerProgress], async () => {
    const session = await owned(profileId, sessionId)
    if (session.status !== 'active') return session
    const previous = session.attempts[questionId]
    if (previous?.completed) return session
    if (previous && previous.itemId !== itemId) throw new Error('Question identity changed')
    const attempt = answer === null ? skipQuestion(previous, questionId, itemId) : recordAnswer(previous, questionId, itemId, answer, hintUsed || participating(session.feature))
    const updated = { ...session, attempts: { ...session.attempts, [questionId]: attempt }, updatedAt: Date.now() }
    if (!previous && !participating(session.feature)) {
      const record = await getOrCreateProgress(itemId, type, profileId)
      await db.playerProgress.put(attempt.firstAnswerCorrect && !attempt.hintUsed ? updateAfterCorrect(record) : updateAfterIncorrect(record))
    }
    await db.gameCheckpoints.put(updated)
    return updated
  })
}
export async function finishGameSession(profileId: string, sessionId: string) {
  return db.transaction('rw', [db.profiles, db.gameCheckpoints, db.playerSessions, db.pets, db.wallets, db.rewardReceipts], async () => {
    const session = await owned(profileId, sessionId)
    const receiptId = `game:${sessionId}`
    const receipt = await db.rewardReceipts.get(receiptId)
    if (receipt) return { session, receipt, summary: summarizeAttempts(Object.values(session.attempts), session.planned) }
    if (session.status !== 'active') throw new Error('Session cannot be completed')
    const summary = summarizeAttempts(Object.values(session.attempts), session.planned)
    if (!session.planned || summary.completed !== session.planned) throw new Error('Questions remain unfinished')
    const participation = participating(session.feature)
    const xp = participation ? summary.completed * 5 : calculateXpGain(summary.correct, summary.total)
    const stars = participation ? summary.completed : summary.correct
    await addXpToPet(xp, participation ? [] : Object.values(session.attempts).filter(a => a.firstAnswerCorrect && !a.hintUsed).map(a => a.itemId), profileId)
    await incrementStars(profileId, stars)
    const final = { ...session, status: 'finished' as const, updatedAt: Date.now() }
    await db.playerSessions.add({ id: session.id, profileId, date: Date.now(), durationMs: Date.now() - session.startedAt, feature: session.feature, correct: summary.correct, total: summary.total, completionRate: summary.completionRate, evidenceKind: participation ? 'participation' : 'independent' })
    const saved = { id: receiptId, profileId, xp, stars, createdAt: Date.now() }
    await db.rewardReceipts.add(saved)
    await db.gameCheckpoints.put(final)
    return { session: final, receipt: saved, summary }
  })
}
