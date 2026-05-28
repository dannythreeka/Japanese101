import { create } from 'zustand'
import type { KanaMode, KanaDifficulty } from '../types'

interface AppState {
  // kid settings
  kanaMode: KanaMode
  kanaDifficulty: KanaDifficulty
  sessionStartTime: number | null
  totalStars: number

  // parent
  parentUnlocked: boolean

  setKanaMode: (mode: KanaMode) => void
  setKanaDifficulty: (level: KanaDifficulty) => void
  startSession: () => void
  endSession: () => number   // returns duration ms
  addStars: (n: number) => void
  setParentUnlocked: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  kanaMode: 'hiragana',
  kanaDifficulty: 'level_1',
  sessionStartTime: null,
  totalStars: Number(localStorage.getItem('totalStars') ?? 0),
  parentUnlocked: false,

  setKanaMode: (mode) => set({ kanaMode: mode }),
  setKanaDifficulty: (level) => set({ kanaDifficulty: level }),

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
