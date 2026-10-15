import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { usePracticeSession } from './usePracticeSession'
import { acceptChallengeResult, cancelLevelChallenge } from '../db/level-sessions'

export function useAdventureChallenge() {
  const practice = usePracticeSession()
  const adventureSession = useAppStore(s => s.adventureSession)
  const navigate = useNavigate()
  const belongs = !!practice.session.levelSessionId && adventureSession?.id === practice.session.levelSessionId
  const session = belongs ? adventureSession : null
  async function submitResult(...displayOnly: [number, number]) {
    void displayOnly // Scores from the UI never authorize a reward or completion.
    if (!session?.id) return
    await practice.finish()
    const updated = await acceptChallengeResult(practice.session.profileId, session.id, practice.session.id)
    if (!practice.alive()) return
    useAppStore.setState({ adventureSession: updated })
    navigate(`/adventure/level/${session.levelId}`)
  }
  async function cancelChallenge() {
    if (!session?.id) { navigate('/play'); return }
    await cancelLevelChallenge(practice.session.profileId, session.id)
    if (!practice.alive()) return
    useAppStore.setState({ adventureSession: { ...session, pending: null } })
    navigate(`/adventure/level/${session.levelId}`)
  }
  return { isActive: !!session?.pending, session, pending: session?.pending ?? null, submitResult, cancelChallenge }
}
