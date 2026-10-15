import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { GameCheckpoint } from '../db/models'
import { summarizeAttempts } from '../lib/attempts'
import type { XpResult } from '../lib/pet'

interface PracticeContextValue {
  session: GameCheckpoint
  initial: Record<string, unknown>
  summary: ReturnType<typeof summarizeAttempts>
  save: (patch: Record<string, unknown>, planned?: number) => Promise<void>
  answer: (questionId: string, itemId: string, type: 'kana' | 'vocab', correct: boolean | null, hinted?: boolean, checkpoint?: Record<string, unknown>) => Promise<void>
  finish: () => Promise<XpResult>
  restart: (initial?: Record<string, unknown>) => Promise<void>
  alive: () => boolean
}
export const PracticeContext = createContext<PracticeContextValue | null>(null)
export function usePracticeSession() {
  const context = useContext(PracticeContext)
  if (!context) throw new Error('Missing practice session provider')
  return context
}

export function useCheckpointState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const practice = usePracticeSession()
  const [value, setValue] = useState<T>(() => key in practice.initial ? practice.initial[key] as T : typeof initial === 'function' ? (initial as () => T)() : initial)
  const ref = useRef(value)
  const save = practice.save
  useEffect(() => {
    if (!(key in practice.initial)) void save({ [key]: ref.current }).catch(() => {})
  }, [key, practice.initial, save])
  const update = useCallback((next: SetStateAction<T>) => {
    const updated = typeof next === 'function' ? (next as (value: T) => T)(ref.current) : next
    ref.current = updated
    setValue(updated)
    void save({ [key]: updated }).catch(() => {})
  }, [key, save])
  return [value, update]
}

