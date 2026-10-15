import { useEffect, useState, type ReactNode } from 'react'
import { ensureDefaultProfile, getActiveProfileId, getProfile, setActiveProfileId } from '../db'
import { useAppStore } from '../store/useAppStore'
import { stopSpeaking } from '../lib/tts'
import { stopBgm } from '../lib/audio'

export default function ProfileGate({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState(getActiveProfileId)
  const [ready, setReady] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  const storageError = useAppStore(s => s.storageError)
  useEffect(() => {
    const changed = () => { stopSpeaking(); stopBgm(); setReady(null); setProfileId(getActiveProfileId()); setRevision(r => r + 1) }
    window.addEventListener('profilechanged', changed)
    const storageChanged = (event: StorageEvent) => { if (event.key === 'activeProfileId') changed() }
    window.addEventListener('storage', storageChanged)
    return () => { window.removeEventListener('profilechanged', changed); window.removeEventListener('storage', storageChanged) }
  }, [])
  useEffect(() => {
    let active = true
    void (async () => {
      await ensureDefaultProfile()
      if (!await getProfile(profileId)) { setActiveProfileId('player'); return }
      await useAppStore.getState().hydrateProfile(profileId)
      if (active) { setReady(profileId); setError(false) }
    })().catch(() => { if (active) setError(true) })
    return () => { active = false; stopSpeaking(); stopBgm() }
  }, [profileId, revision])
  if (error) return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>無法開啟學習資料，原有資料仍保留。請確認瀏覽器允許儲存後重試。</p><button className="min-h-16 px-6" onClick={() => setRevision(r => r + 1)}>重試</button></div>
  if (ready !== profileId) return <p role="status">正在讀取玩家資料…</p>
  return <div key={profileId}>{storageError && <div role="alert" className="fixed inset-x-0 top-0 z-50 bg-amber-100 p-4"><p>還沒存好，請重試。</p><button className="min-h-16 px-6" onClick={() => { void useAppStore.getState().retryStorage().catch(() => {}) }}>重試儲存</button></div>}{children}</div>
}
