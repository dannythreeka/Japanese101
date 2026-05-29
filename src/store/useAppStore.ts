import { create } from 'zustand'
import type { KanaMode, KanaDifficulty, AgeMode } from '../types'

interface AppState {
  kanaMode: KanaMode
  kanaDifficulty: KanaDifficulty
  ageMode: AgeMode
  sessionStartTime: number | null
  totalStars: number
  parentUnlocked: boolean

  setKanaMode: (mode: KanaMode) => void
  setKanaDifficulty: (level: KanaDifficulty) => void
  setAgeMode: (mode: AgeMode) => void
  startSession: () => void
  endSession: () => number
  addStars: (n: number) => void
  setParentUnlocked: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  kanaMode: 'hiragana',
  kanaDifficulty: 1,
  ageMode: 'young',
  sessionStartTime: null,
  totalStars: Number(localStorage.getItem('totalStars') ?? 0),
  parentUnlocked: false,

  setKanaMode: (mode) => set({ kanaMode: mode }),
  setKanaDifficulty: (level) => set({ kanaDifficulty: level }),
  setAgeMode: (mode) => set({ ageMode: mode }),

  startSession: () => set({ sessionStartTime: Date.now() }),

  endSession: () => {
    const start = get().sessionStartTime
    const duration = start ? Date.now() - start : 0
    set({ sessionStartTime: null })
    return duration
  },

  addStars: (n) => {
    const next = get().totalStars + n
    localStorage.setItem('totalStars', String(next))
    set({ totalStars: next })
  },

  setParentUnlocked: (v) => set({ parentUnlocked: v }),
}))
