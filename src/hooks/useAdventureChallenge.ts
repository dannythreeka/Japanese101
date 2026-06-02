import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export function useAdventureChallenge() {
  const { adventureSession, recordChallengeResult, cancelAdventureChallenge } = useAppStore()
  const navigate = useNavigate()

  function submitResult(accuracy: number, xpGained: number) {
    if (!adventureSession?.pending) return
    const { challengeId } = adventureSession.pending
    const { levelId } = adventureSession
    recordChallengeResult(challengeId, accuracy, xpGained)
    navigate(`/adventure/level/${levelId}`)
  }

  function cancelChallenge() {
    if (!adventureSession) return
    const { levelId } = adventureSession
    cancelAdventureChallenge()
    navigate(`/adventure/level/${levelId}`)
  }

  return {
    isActive: !!adventureSession?.pending,
    session: adventureSession,
    pending: adventureSession?.pending ?? null,
    submitResult,
    cancelChallenge,
  }
}
