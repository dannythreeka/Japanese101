import { db, getOrCreateAdventureProgress } from './index'
import { levelsData } from '../data/loaders'
import type { LevelSession } from './models'
import { computeStars, getFirstLevelId, getLevelStatus } from '../features/adventure/adventureEngine'
import { addXpToPet, applyLevelEvolution } from '../lib/pet'
import { CONTENT_VERSION } from './game-sessions'
import { summarizeAttempts } from '../lib/attempts'

export { GAME_ROUTES, featureForMode } from '../lib/gameModes'
import { GAME_ROUTES, featureForMode } from '../lib/gameModes'

export async function openLevelSession(profileId: string, levelId: string): Promise<LevelSession> {
  return db.transaction('rw', [db.profiles, db.adventureProgress, db.levelSessions], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const level = levelsData().levels.find(l => l.level_id === levelId)
    if (!level) throw new Error('Level does not exist')
    const progress = await getOrCreateAdventureProgress(getFirstLevelId(), profileId)
    if (getLevelStatus(level, progress) === 'locked') throw new Error('Level is locked')
    const current = (await db.levelSessions.where('[profileId+levelId]').equals([profileId,levelId]).toArray()).find(s => s.status === 'active' && s.contentVersion === CONTENT_VERSION)
    if (current) { const updated = { ...current, updatedAt: Date.now() }; await db.levelSessions.put(updated); return updated }
    const session: LevelSession = { id: crypto.randomUUID(), profileId, levelId, contentVersion: CONTENT_VERSION, status: 'active', startedAt: Date.now(), updatedAt: Date.now(), pending: null, results: {} }
    await db.levelSessions.add(session)
    return session
  })
}
export async function launchLevelChallenge(profileId: string, sessionId: string, challengeId: string): Promise<LevelSession> {
  return db.transaction('rw', [db.profiles, db.levelSessions], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const session = await db.levelSessions.get(sessionId)
    if (!session || session.profileId !== profileId || session.status !== 'active' || session.contentVersion !== CONTENT_VERSION) throw new Error('Invalid level session')
    const challenge = levelsData().levels.find(l => l.level_id === session.levelId)?.challenges.find(c => c.challenge_id === challengeId)
    if (!challenge || !GAME_ROUTES[challenge.game_mode]) throw new Error('Challenge is unavailable')
    const updated = { ...session, updatedAt: Date.now(), pending: { challengeId, gameMode: challenge.game_mode, configOverrides: challenge.config_overrides ?? {} } }
    await db.levelSessions.put(updated)
    return updated
  })
}
export async function acceptChallengeResult(profileId: string, levelSessionId: string, gameSessionId: string): Promise<LevelSession> {
  return db.transaction('rw', [db.profiles, db.levelSessions, db.gameCheckpoints], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const level = await db.levelSessions.get(levelSessionId), game = await db.gameCheckpoints.get(gameSessionId)
    if (!level || level.profileId !== profileId || level.status !== 'active' || !game || game.profileId !== profileId || game.levelSessionId !== level.id || !game.challengeId || game.status !== 'finished') throw new Error('Challenge has no completed session')
    const challenge = levelsData().levels.find(l => l.level_id === level.levelId)?.challenges.find(c => c.challenge_id === game.challengeId)
    if (!challenge || featureForMode[challenge.game_mode] !== game.feature) throw new Error('Wrong challenge mode')
    const accuracy = summarizeAttempts(Object.values(game.attempts), game.planned).firstAccuracy ?? 0
    const updated = { ...level, updatedAt: Date.now(), pending: null, results: { ...level.results, [game.challengeId]: { accuracy, xpGained: 0, sessionId: game.id } } }
    await db.levelSessions.put(updated)
    return updated
  })
}
export async function finishLevel(profileId: string, sessionId: string, levelId: string) {
  return db.transaction('rw', [db.profiles, db.levelSessions, db.gameCheckpoints, db.adventureProgress, db.pets, db.rewardReceipts], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const session = await db.levelSessions.get(sessionId)
    const level = levelsData().levels.find(l => l.level_id === levelId)
    if (!session || session.profileId !== profileId || session.levelId !== levelId || session.contentVersion !== CONTENT_VERSION || !level) throw new Error('Invalid level session')
    const oldReceipt = await db.rewardReceipts.get(`level:${sessionId}`)
    if (oldReceipt) return { alreadyCompleted: true, receipt: oldReceipt, stars: (await db.adventureProgress.get(profileId))!.completed_levels[levelId].stars }
    if (session.status !== 'active') throw new Error('Session cannot be completed')
    const progress = await getOrCreateAdventureProgress(getFirstLevelId(), profileId)
    if (getLevelStatus(level, progress) === 'locked') throw new Error('Level is locked')
    const required = level.challenges.filter(c => c.required_for_completion !== false)
    if (!required.length) throw new Error('Level has no required challenges')
    const results: Record<string, { accuracy: number }> = {}
    for (const challenge of required) {
      const result = session.results[challenge.challenge_id]
      const game = result?.sessionId ? await db.gameCheckpoints.get(result.sessionId) : null
      if (!game || game.profileId !== profileId || game.levelSessionId !== session.id || game.challengeId !== challenge.challenge_id || game.feature !== featureForMode[challenge.game_mode] || game.status !== 'finished') throw new Error('Required challenge is unfinished')
      results[challenge.challenge_id] = { accuracy: summarizeAttempts(Object.values(game.attempts), game.planned).firstAccuracy ?? 0 }
    }
    const stars = computeStars(level, results)
    const played = progress.completed_levels[levelId]?.times_played ?? 0
    const factor = played >= 3 ? .1 : played === 2 ? .25 : played === 1 ? .5 : 1
    const xp = Math.round((level.xp_reward + (stars === 3 ? 30 : 0)) * factor)
    await addXpToPet(xp, [], profileId)
    const previous = progress.completed_levels[levelId]
    const completed = { ...progress.completed_levels, [levelId]: { completed_at: new Date().toISOString(), stars: Math.max(stars, previous?.stars ?? 1) as 1|2|3, best_accuracy: Math.max(...Object.values(results).map(r => r.accuracy), previous?.best_accuracy ?? 0), times_played: played + 1 } }
    const sorted = [...levelsData().levels].sort((a,b)=>a.level_number-b.level_number)
    const next = sorted[sorted.findIndex(l=>l.level_id===levelId)+1]
    await db.adventureProgress.put({ ...progress, completed_levels: completed, current_level_id: progress.current_level_id === levelId && next ? next.level_id : progress.current_level_id })
    await applyLevelEvolution(Object.keys(completed), profileId)
    const receipt = { id:`level:${sessionId}`,profileId,xp,stars,createdAt:Date.now() }
    await db.rewardReceipts.add(receipt)
    await db.levelSessions.put({ ...session, status:'completed', pending:null })
    return { alreadyCompleted: false, receipt, stars }
  })
}

export async function cancelLevelChallenge(profileId: string, sessionId: string): Promise<void> {
  await db.transaction('rw', [db.profiles, db.levelSessions], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const session = await db.levelSessions.get(sessionId)
    if (!session || session.profileId !== profileId) throw new Error('Invalid level session')
    await db.levelSessions.put({ ...session, pending: null, updatedAt: Date.now() })
  })
}
