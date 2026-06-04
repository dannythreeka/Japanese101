import { create } from 'zustand';
import type { KanaMode, KanaDifficulty, AgeMode, MicMode } from '../types';
import type { UiLang } from '../lib/i18n';

export interface AdventureSession {
  levelId: string;
  pending: {
    challengeId: string;
    gameMode: string;
    configOverrides: Record<string, unknown>;
  } | null;
  results: Record<string, { accuracy: number; xpGained: number }>;
}

interface AppState {
  kanaMode: KanaMode;
  kanaDifficulty: KanaDifficulty;
  ageMode: AgeMode;
  micMode: MicMode;
  uiLang: UiLang;
  disabledUnits: string[];
  sessionStartTime: number | null;
  totalStars: number;
  parentUnlocked: boolean;
  adventureSession: AdventureSession | null;
  activeProfileId: string | null;

  setActiveProfileId: (id: string | null) => void;
  setKanaMode: (mode: KanaMode) => void;
  setKanaDifficulty: (level: KanaDifficulty) => void;
  setAgeMode: (mode: AgeMode) => void;
  setMicMode: (mode: MicMode) => void;
  setUiLang: (lang: UiLang) => void;
  toggleUnit: (unitId: string) => void;
  startSession: () => void;
  endSession: () => number;
  addStars: (n: number) => void;
  setParentUnlocked: (v: boolean) => void;
  initAdventureSession: (levelId: string) => void;
  launchChallenge: (
    challengeId: string,
    gameMode: string,
    overrides: Record<string, unknown>,
  ) => void;
  recordChallengeResult: (
    challengeId: string,
    accuracy: number,
    xpGained: number,
  ) => void;
  cancelAdventureChallenge: () => void;
  clearAdventureSession: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  kanaMode: 'hiragana',
  kanaDifficulty: 1,
  ageMode: (localStorage.getItem('ageMode') as AgeMode | null) ?? 'young',
  micMode: (localStorage.getItem('micMode') as MicMode | null) ?? 'offline',
  uiLang: (localStorage.getItem('uiLang') as UiLang | null) ?? 'ja',
  disabledUnits: JSON.parse(
    localStorage.getItem('disabledUnits') ?? '[]',
  ) as string[],
  sessionStartTime: null,
  totalStars: Number(localStorage.getItem('totalStars') ?? 0),
  parentUnlocked: false,
  adventureSession: null,
  activeProfileId: localStorage.getItem('activeProfileId') ?? null,

  setActiveProfileId: (id) => {
    if (id) {
      localStorage.setItem('activeProfileId', id);
    } else {
      localStorage.removeItem('activeProfileId');
    }
    set({ activeProfileId: id });
  },

  setKanaMode: (mode) => set({ kanaMode: mode }),
  setKanaDifficulty: (level) => set({ kanaDifficulty: level }),
  setAgeMode: (mode) => {
    localStorage.setItem('ageMode', mode);
    set({ ageMode: mode });
  },
  setMicMode: (mode) => {
    localStorage.setItem('micMode', mode);
    set({ micMode: mode });
  },
  setUiLang: (lang) => {
    localStorage.setItem('uiLang', lang);
    set({ uiLang: lang });
  },
  toggleUnit: (unitId: string) => {
    const current = get().disabledUnits;
    const next = current.includes(unitId)
      ? current.filter((id) => id !== unitId)
      : [...current, unitId];
    localStorage.setItem('disabledUnits', JSON.stringify(next));
    set({ disabledUnits: next });
  },

  startSession: () => set({ sessionStartTime: Date.now() }),

  endSession: () => {
    const start = get().sessionStartTime;
    const duration = start ? Date.now() - start : 0;
    set({ sessionStartTime: null });
    return duration;
  },

  addStars: (n) => {
    const next = get().totalStars + n;
    localStorage.setItem('totalStars', String(next));
    set({ totalStars: next });
  },

  setParentUnlocked: (v) => set({ parentUnlocked: v }),

  initAdventureSession: (levelId) => {
    const current = get().adventureSession;
    if (current?.levelId === levelId) return; // keep existing results for replay
    set({ adventureSession: { levelId, pending: null, results: {} } });
  },

  launchChallenge: (challengeId, gameMode, overrides) => {
    const current = get().adventureSession;
    if (!current) return;
    set({
      adventureSession: {
        ...current,
        pending: { challengeId, gameMode, configOverrides: overrides },
      },
    });
  },

  recordChallengeResult: (challengeId, accuracy, xpGained) => {
    const current = get().adventureSession;
    if (!current) return;
    set({
      adventureSession: {
        ...current,
        pending: null,
        results: { ...current.results, [challengeId]: { accuracy, xpGained } },
      },
    });
  },

  cancelAdventureChallenge: () => {
    const current = get().adventureSession;
    if (!current) return;
    set({ adventureSession: { ...current, pending: null } });
  },

  clearAdventureSession: () => set({ adventureSession: null }),
}));
