import { describe, it, expect } from 'vitest'
import { COSMETICS, getNewlyUnlocked, getActiveCosmetic } from './cosmetics'

describe('getNewlyUnlocked', () => {
  it('returns nothing when level unchanged', () => {
    expect(getNewlyUnlocked(5, 5)).toHaveLength(0)
  })

  it('returns cosmetic when crossing its unlock level', () => {
    const result = getNewlyUnlocked(2, 3)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('bow')
  })

  it('returns multiple cosmetics when crossing several unlock levels', () => {
    const result = getNewlyUnlocked(2, 5)
    expect(result.map(c => c.id)).toEqual(['bow', 'flower'])
  })

  it('does not re-unlock already-passed levels', () => {
    expect(getNewlyUnlocked(4, 5)).toHaveLength(1) // only flower
    expect(getNewlyUnlocked(5, 6)).toHaveLength(0)
  })

  it('handles jump past all cosmetics', () => {
    const result = getNewlyUnlocked(0, 20)
    expect(result).toHaveLength(COSMETICS.length)
  })
})

describe('getActiveCosmetic', () => {
  it('returns null when nothing unlocked', () => {
    expect(getActiveCosmetic([])).toBeNull()
  })

  it('returns the single unlocked cosmetic', () => {
    expect(getActiveCosmetic(['bow'])?.id).toBe('bow')
  })

  it('returns highest-level cosmetic when multiple unlocked', () => {
    expect(getActiveCosmetic(['bow', 'flower', 'tophat'])?.id).toBe('tophat')
  })

  it('ignores unknown ids', () => {
    expect(getActiveCosmetic(['unknown_id'])).toBeNull()
  })
})
