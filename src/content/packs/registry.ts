import type { UnitPack } from '../contracts'
import { u01 } from './u01'
import { hiraganaPack, katakanaPack } from './kana'

// Only actual playable packs belong here. The 24-unit blueprint is not a content inventory.
export const availablePacks: readonly UnitPack[] = [hiraganaPack, katakanaPack, u01]
export function findPack(id: string): UnitPack | undefined {
  return availablePacks.find(pack => pack.id === id)
}
