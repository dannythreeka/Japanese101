import type { PetState } from '../types';
import { getOrCreatePet, savePetState } from '../db';
import { getNewlyUnlocked } from './cosmetics';

export const XP_PER_LEVEL = 100;
export const XP_PER_CORRECT = 10;
export const PERFECT_BONUS = 20;

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getEvolutionStage(level: number): 0 | 1 | 2 | 3 {
  if (level >= 20) return 3;
  if (level >= 10) return 2;
  if (level >= 5) return 1;
  return 0;
}

export function xpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}

export function calculateXpGain(correct: number, total: number): number {
  if (total === 0 || correct === 0) return 0;
  const base = correct * XP_PER_CORRECT;
  const bonus = correct === total ? PERFECT_BONUS : 0;
  return base + bonus;
}

export interface XpResult {
  pet: PetState;
  xpGained: number;
  leveledUp: boolean;
  evolvedToStage: number | null;
}

export async function addXpToPet(
  xpGain: number,
  newKanaIds: string[] = [],
): Promise<XpResult> {
  const pet = await getOrCreatePet();
  const oldLevel = pet.level;

  const newXp = pet.xp + xpGain;
  const newLevel = getLevel(newXp);
  const newCollection = [...new Set([...pet.collection, ...newKanaIds])];
  const newCosmeticIds = getNewlyUnlocked(oldLevel, newLevel).map((c) => c.id);
  const newCosmetics = [
    ...new Set([...pet.unlockedCosmetics, ...newCosmeticIds]),
  ];

  // evolutionStage is NOT updated here — it is driven by level completion via evolveToStage()
  const updated: PetState = {
    ...pet,
    xp: newXp,
    level: newLevel,
    unlockedCosmetics: newCosmetics,
    collection: newCollection,
    lastPlayed: new Date().toISOString(),
  };

  await savePetState(updated);

  return {
    pet: updated,
    xpGained: xpGain,
    leveledUp: newLevel > oldLevel,
    evolvedToStage: null,
  };
}

/** Set the pet's evolution stage to the given value (only advances, never regresses). */
export async function evolveToStage(stage: number): Promise<PetState> {
  const pet = await getOrCreatePet();
  if (pet.evolutionStage >= stage) return pet;
  const updated: PetState = { ...pet, evolutionStage: stage };
  await savePetState(updated);
  return updated;
}
