import RecoveryBoundary from './RecoveryBoundary'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { GameCheckpoint } from '../db/models'
import type { SessionRecord } from '../types'
import { db } from '../db'
import { openGameSession, saveCheckpoint, submitGameAnswer, finishGameSession, abandonGameSession, recoverGameRoute } from '../db/game-sessions'
import { useAppStore } from '../store/useAppStore'
import { featureForMode } from '../db/level-sessions'
import { summarizeAttempts } from '../lib/attempts'
import { stopGameAudio } from '../lib/audio'
import { stopSpeaking } from '../lib/tts'
import type { XpResult } from '../lib/pet'
import { useT } from '../hooks/useT'
import { PracticeContext } from '../hooks/usePracticeSession'

function ActivePractice({ session: initial, children, restart }: { session: GameCheckpoint; children: ReactNode; restart: (initial?: Record<string, unknown>) => Promise<void> }) {
  const [session, setSession] = useState(initial)
  const [error, setError] = useState(false)
  const alive = useRef(false)
  const pending = useRef<(() => void) | null>(null)
  const chain = useRef(Promise.resolve())
  const cancelPending = useRef<(() => void) | null>(null)
  const t = useT()
  useEffect(() => { alive.current = true; return () => { alive.current = false; pending.current = null; cancelPending.current?.(); stopSpeaking(); stopGameAudio() } }, [])
  // Keep a failed submission pending until retry succeeds. The game cannot advance or claim a save.
  const run = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const result = new Promise<T>((resolve) => {
      chain.current = chain.current.then(() => new Promise<void>(done => {
        if (!alive.current) { done(); return }
        const cancel = () => { pending.current = null; done() }
        cancelPending.current = cancel
        let running = false
        const wrapped = () => {
          if (running) return
          if (!alive.current) { cancel(); return }
          running = true
          void operation().then(value => { running = false; if (alive.current) { setError(false); pending.current = null }; resolve(value); done() }).catch(() => {
            running = false
            if (!alive.current) { cancel(); return }
            pending.current = wrapped; setError(true)
          })
        }
        wrapped()
      }))
    })
    return result
  }, [])
  const save = useCallback(async (patch: Record<string, unknown>, planned?: number) => {
    const updated = await run(() => saveCheckpoint(initial.profileId, initial.id, patch, planned))
    if (alive.current) setSession(updated)
  }, [initial.profileId, initial.id, run])
  const answer = useCallback(async (questionId: string, itemId: string, type: 'kana'|'vocab', correct: boolean|null, hinted = false, checkpoint: Record<string, unknown> = {}) => {
    const updated = await run(() => submitGameAnswer(initial.profileId, initial.id, questionId, itemId, type, correct, hinted, checkpoint))
    if (alive.current) setSession(updated)
  }, [initial.profileId, initial.id, run])
  const finish = useCallback(async (): Promise<XpResult> => {
    const result = await run(() => finishGameSession(initial.profileId, initial.id))
    const pet = await db.pets.get(initial.profileId)
    if (!pet) throw new Error('Missing reward recipient')
    if (alive.current) setSession(result.session)
    const wallet = await db.wallets.get(initial.profileId)
    if (useAppStore.getState().profileId === initial.profileId) useAppStore.setState({ totalStars: wallet?.stars ?? 0 })
    return { pet, xpGained: result.receipt.xp, leveledUp: false, evolvedToStage: null }
  }, [initial.profileId, initial.id, run])
  const isAlive = useCallback(() => alive.current && useAppStore.getState().profileId === initial.profileId, [initial.profileId])
  const summary = summarizeAttempts(Object.values(session.attempts), session.planned)
  return <PracticeContext.Provider value={{ session, initial: initial.checkpoint, summary, save, answer, finish, restart, alive: isAlive }}>
    <div className="contents" data-game-session-id={initial.id} data-feature={initial.feature}><RecoveryBoundary recover={() => { void restart().catch(() => setError(true)) }}>{children}</RecoveryBoundary>
    {error && <div role="alert" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-amber-50 p-6"><p>{t('savePending')}</p><button className="min-h-16 px-8" onClick={() => pending.current?.()}>{t('retry')}</button></div>}
    </div>
  </PracticeContext.Provider>
}

export default function PracticeSession({ feature, children }: { feature: SessionRecord['feature']; children: ReactNode }) {
  const profileId = useAppStore(s => s.profileId)
  const adventure = useAppStore(s => s.adventureSession)
  const context = adventure?.id && adventure.pending && featureForMode[adventure.pending.gameMode as keyof typeof featureForMode] === feature ? { levelSessionId: adventure.id, challengeId: adventure.pending.challengeId } : undefined
  const routeKey = context ? `${feature}:${context.levelSessionId}:${context.challengeId}` : `free:${feature}`
  const contextId = context?.levelSessionId
  const challengeId = context?.challengeId
  const [session, setSession] = useState<GameCheckpoint | null>(null)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const t = useT()
  const restart = async (patch: Record<string, unknown> = {}) => {
    if (session) await abandonGameSession(profileId, session.id)
    const next = await openGameSession(profileId, routeKey, feature, context)
    const seeded = await saveCheckpoint(profileId, next.id, patch)
    setSession(seeded)
  }
  useEffect(() => {
    let active = true
    void (async () => {
      let value = await openGameSession(profileId, routeKey, feature, contextId && challengeId ? {levelSessionId: contextId, challengeId} : undefined)
      if (value.status === 'active' && value.planned > 0 && summarizeAttempts(Object.values(value.attempts), value.planned).completed === value.planned) {
        value = (await finishGameSession(profileId, value.id)).session
      }
      if (active) { setSession(value); setFailed(false) }
    })().catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [profileId, routeKey, feature, contextId, challengeId, retry])
  if (failed) return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>{t('sessionUnavailable')}</p><button className="min-h-16 px-8" onClick={() => setRetry(r=>r+1)}>{t('retry')}</button><button className="min-h-16 px-8" onClick={() => { void recoverGameRoute(profileId, routeKey).then(() => setRetry(r=>r+1)).catch(() => {}) }}>{t('newPractice')}</button><a href="#/adventure">{t('back')}</a></div>
  if (!session || session.routeKey !== routeKey) return <p role="status">{t('loading')}</p>
  return <ActivePractice key={session.id} session={session} restart={restart}>{children}</ActivePractice>
}
