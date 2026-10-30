import type { UnitPack } from '../contracts'
import { u01 } from './u01'
import { u02 } from './u02'
import { u03 } from './u03'
import { u04 } from './u04'
import { u05 } from './u05'
import { u06 } from './u06'
import { hiraganaPack, katakanaPack } from './kana'

// Only actual playable packs belong here. The 24-unit blueprint is not a content inventory.
export const availablePacks: readonly UnitPack[] = [hiraganaPack, katakanaPack, u01, u02, u03, u04, u05, u06]
export function findPack(id: string): UnitPack | undefined {
  return availablePacks.find(pack => pack.id === id)
}
