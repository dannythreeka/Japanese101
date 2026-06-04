import type { Kana, AgeMode, KanaDifficulty } from '../../types'

export const KANA_EMOJI: Record<string, string> = {
  a:   '🐜', // ari (ant)
  i:   '🐶', // inu (dog)
  u:   '🐴', // uma (horse)
  e:   '🦒', // giraffe
  o:   '🌊', // ocean
  ka:  '🦀', // kani (crab)
  ki:  '👂', // kiku (to listen)
  ku:  '☁️', // kumo (cloud)
  ke:  '🎂', // keeki (cake)
  ko:  '🐨', // koala
  sa:  '🌸', // sakura
  shi: '🍄', // shiitake
  su:  '🍉', // suika (watermelon)
  se:  '📚', // sensei (teacher)
  so:  '🌌', // sora (sky)
  ta:  '🥁', // taiko (drum)
  chi: '🌍', // chikyuu (earth)
  tsu: '🌙', // tsuki (moon)
  te:  '✋', // te (hand)
  to:  '🐅', // tora (tiger)
  na:  '🍆', // nasu (eggplant)
  ni:  '🌈', // niji (rainbow)
  nu:  '🍜', // noodle
  ne:  '🐱', // neko (cat)
  no:  '🌾', // no (field)
  ha:  '🌺', // hana (flower)
  hi:  '☀️', // hi (sun)
  fu:  '🌬️', // fuu (wind)
  he:  '🐍', // hebi (snake)
  ho:  '⭐', // hoshi (star)
  ma:  '🐴', // uma (horse)
  mi:  '👂', // mimi (ear)
  mu:  '🦟', // mushi (bug)
  me:  '👁️', // me (eye)
  mo:  '🍑', // momo (peach)
  ya:  '🏹', // yumi (bow)
  yu:  '🛁', // yubune (bath)
  yo:  '🌃', // yoru (night)
  ra:  '🦁', // raion (lion)
  ri:  '🎀', // ribon (ribbon)
  ru:  '🔵', // ruupu (loop)
  re:  '🧱', // renga (brick)
  ro:  '🤖', // robotto (robot)
  wa:  '🐊', // wani (crocodile)
  wo:  '🎁', // (particle を)
  n:   '🎵', // nasal sound
}

export const ROUND_SIZE = 5

export function buildWritePool(allKana: Kana[], ageMode: AgeMode, kanaDifficulty: KanaDifficulty): Kana[] {
  let base: Kana[]
  if (ageMode === 'young' && (kanaDifficulty === 1 || kanaDifficulty === 'all')) {
    base = allKana.filter(k => k.type === 'seion')
  } else if (kanaDifficulty === 'all') {
    base = allKana
  } else {
    base = allKana.filter(k => k.difficulty <= (kanaDifficulty as number))
  }
  const fallback = allKana.filter(k => k.type === 'seion')
  return base.length >= 4 ? base : fallback
}

export function pickRound(pool: Kana[], count: number): Kana[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Pixel similarity with dilation: score = userPixels-within-dilated-ref / total-userPixels
export function computeWritingScore(
  userImageData: ImageData,
  refImageData: ImageData,
  dilationRadius = 18,
): number {
  const { width, height } = userImageData
  if (width !== refImageData.width || height !== refImageData.height) return 0

  const userMask = new Uint8Array(width * height)
  const refMask = new Uint8Array(width * height)
  let userPixels = 0

  for (let i = 0; i < userImageData.data.length; i += 4) {
    const idx = i >> 2
    if (userImageData.data[i + 3] > 64) {
      userMask[idx] = 1
      userPixels++
    }
    if (refImageData.data[i + 3] > 64) refMask[idx] = 1
  }

  if (userPixels === 0) return 0

  // Box-dilation of ref mask
  const dilated = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!refMask[y * width + x]) continue
      const yMin = Math.max(0, y - dilationRadius)
      const yMax = Math.min(height - 1, y + dilationRadius)
      const xMin = Math.max(0, x - dilationRadius)
      const xMax = Math.min(width - 1, x + dilationRadius)
      for (let dy = yMin; dy <= yMax; dy++) {
        for (let dx = xMin; dx <= xMax; dx++) {
          dilated[dy * width + dx] = 1
        }
      }
    }
  }

  let overlap = 0
  for (let i = 0; i < userMask.length; i++) {
    if (userMask[i] && dilated[i]) overlap++
  }

  return overlap / userPixels
}

export function scoreToStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 0.8) return 3
  if (score >= 0.6) return 2
  if (score >= 0.35) return 1
  return 0
}
