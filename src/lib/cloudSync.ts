import { getActiveProfileId, getAdventureProgress, getPetState, getAllProgress, saveAdventureProgress, savePetState, saveProgress } from '../db'
import type { ProgressRecord } from '../types'
import type { AdventureProgress } from '../types/adventure'
import type { PetState } from '../types'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const TOKEN_KEY = 'sync_token'

export function getSyncToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSyncToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSyncToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export async function login(username: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { token: string }
    return data.token
  } catch {
    return null
  }
}

export interface SyncPayload {
  profileId: string
  adventure_progress: AdventureProgress | null
  pet_state: PetState | null
  kana_progress: ProgressRecord[]
  updated_at: number
}

async function buildLocalPayload(): Promise<SyncPayload> {
  const profileId = getActiveProfileId()
  const [adventure, pet, kana] = await Promise.all([
    getAdventureProgress(profileId),
    getPetState(profileId),
    getAllProgress(),
  ])
  return { profileId, adventure_progress: adventure, pet_state: pet, kana_progress: kana, updated_at: Date.now() }
}

export async function pushSync(): Promise<'ok' | 'auth' | 'error'> {
  const token = getSyncToken()
  if (!token) return 'auth'
  try {
    const payload = await buildLocalPayload()
    const res = await fetch(`${API_URL}/api/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) return 'auth'
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}

export async function pullSync(): Promise<'ok' | 'nodata' | 'auth' | 'error'> {
  const token = getSyncToken()
  if (!token) return 'auth'
  const profileId = getActiveProfileId()
  try {
    const res = await fetch(`${API_URL}/api/sync/pull?profileId=${encodeURIComponent(profileId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) return 'auth'
    if (!res.ok) return 'error'
    const data = (await res.json()) as SyncPayload | null
    if (!data) return 'nodata'
    await applyRemoteData(data)
    return 'ok'
  } catch {
    return 'error'
  }
}

async function applyRemoteData(remote: SyncPayload): Promise<void> {
  if (remote.adventure_progress) await saveAdventureProgress(remote.adventure_progress)
  if (remote.pet_state) await savePetState(remote.pet_state)
  for (const record of remote.kana_progress) await saveProgress(record as ProgressRecord)
}
