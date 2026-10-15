import type { PetState } from '../types'
import { db, getOrCreatePet, savePetState } from '../db'
import { getNewlyUnlocked } from './cosmetics'
import { computeEvolutionStageFromLevels } from './petEvolution'

export const XP_PER_LEVEL = 100
export const XP_PER_CORRECT = 10
export const PERFECT_BONUS = 20

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

/** @deprecated Evolution is now level-triggered via applyLevelEvolution */
export function getEvolutionStage(...args: [number]): 0 {
  void args
  return 0
}

export function xpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}

export function calculateXpGain(correct: number, total: number): number {
  if (total === 0 || correct === 0) return 0
  const base = correct * XP_PER_CORRECT
  const bonus = correct === total ? PERFECT_BONUS : 0
  return base + bonus
}

export interface XpResult {
  pet: PetState
  xpGained: number
  leveledUp: boolean
  evolvedToStage: number | null
}

export async function addXpToPet(
  xpGain: number,
  newKanaIds: string[],
  profileId: string,
): Promise<XpResult> {
  return db.transaction('rw', [db.profiles, db.pets], async () => {
  if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
  const pet = await getOrCreatePet(profileId)
  const oldLevel = pet.level

  const newXp = pet.xp + xpGain
  const newLevel = getLevel(newXp)
  const newCollection = [...new Set([...pet.collection, ...newKanaIds])]
  const newCosmeticIds = getNewlyUnlocked(oldLevel, newLevel).map(c => c.id)
  const newCosmetics = [...new Set([...pet.unlockedCosmetics, ...newCosmeticIds])]

  const updated: PetState = {
    ...pet,
    xp: newXp,
    level: newLevel,
    unlockedCosmetics: newCosmetics,
    // evolutionStage is managed by applyLevelEvolution, not XP
    collection: newCollection,
    lastPlayed: new Date().toISOString(),
  }

  await savePetState(updated)

  return {
    pet: updated,
    xpGained: xpGain,
    leveledUp: newLevel > oldLevel,
    evolvedToStage: null,
  }
  })
}

export interface EvolutionResult {
  pet: PetState
  newStage: number | null
}

export async function applyLevelEvolution(completedLevelIds: string[], profileId: string): Promise<EvolutionResult> {
  const pet = await getOrCreatePet(profileId)
  const targetStage = computeEvolutionStageFromLevels(completedLevelIds)
  if (targetStage <= pet.evolutionStage) return { pet, newStage: null }
  const updated: PetState = { ...pet, evolutionStage: targetStage }
  await savePetState(updated)
  return { pet: updated, newStage: targetStage }
}
