/**
 * VOICEVOX batch audio generator — §H Option B
 *
 * Prerequisites:
 *   1. Download and run VOICEVOX Engine: https://voicevox.hiroshiba.jp/
 *      Default: http://localhost:50021
 *   2. `npm install` (tsx is already a dev dependency)
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts
 *
 * Outputs:
 *   public/assets/audio/kana_<id>.wav   — one per hiragana (71 kana)
 *   public/assets/audio/word_<id>.wav   — one per vocabulary word
 *
 * License note: audio files produced by VOICEVOX ずんだもん (speaker 3)
 * are licensed under the VOICEVOX character terms of use.
 * See: https://zunko.jp/con_ongen_kiyaku.html
 * Tag audio assets as: license = "VOICEVOX_ずんだもん"
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'audio')

const VOICEVOX_BASE = process.env.VOICEVOX_URL ?? 'http://localhost:50021'
// Speaker IDs: 3 = ずんだもん (ノーマル), 2 = 四国めたん, 1 = 四国めたん (あまあま)
const SPEAKER_ID = Number(process.env.VOICEVOX_SPEAKER ?? '3')

interface KanaEntry {
  id: string
  hiragana: string
}
interface VocabEntry {
  id: string
  word: string
}

async function synthesize(text: string, outPath: string): Promise<void> {
  // Step 1: create audio query
  const queryRes = await fetch(
    `${VOICEVOX_BASE}/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`,
    { method: 'POST' },
  )
  if (!queryRes.ok) throw new Error(`audio_query failed: ${queryRes.status}`)
  const query = await queryRes.json()

  // Slow down slightly for learner clarity
  query.speedScale = 0.88
  query.intonationScale = 1.2

  // Step 2: synthesize
  const synthRes = await fetch(
    `${VOICEVOX_BASE}/synthesis?speaker=${SPEAKER_ID}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) },
  )
  if (!synthRes.ok) throw new Error(`synthesis failed: ${synthRes.status}`)

  const buf = Buffer.from(await synthRes.arrayBuffer())
  fs.writeFileSync(outPath, buf)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Load kana
  const kanaRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/kana.json'), 'utf-8'))
  const kanaList: KanaEntry[] = (Array.isArray(kanaRaw) ? kanaRaw[1] : []) as KanaEntry[]

  // Load vocabulary
  const vocabRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/vocabulary.json'), 'utf-8'))
  const vocabList: VocabEntry[] = (Array.isArray(vocabRaw) ? vocabRaw[1] : []) as VocabEntry[]

  const items: Array<{ id: string; text: string }> = [
    ...kanaList.map(k => ({ id: `kana_${k.id}`, text: k.hiragana })),
    ...vocabList.map(v => ({ id: `word_${v.id}`, text: v.word })),
  ]

  console.log(`Generating ${items.length} audio files → ${OUT_DIR}`)
  console.log(`VOICEVOX: ${VOICEVOX_BASE}  speaker: ${SPEAKER_ID}`)

  let ok = 0
  let skip = 0
  for (const { id, text } of items) {
    const outPath = path.join(OUT_DIR, `${id}.wav`)
    if (fs.existsSync(outPath)) { skip++; continue }
    try {
      await synthesize(text, outPath)
      console.log(`  ✓ ${id}  "${text}"`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${id}  "${text}" — ${(err as Error).message}`)
    }
  }
  console.log(`\nDone: ${ok} generated, ${skip} skipped (already exist).`)
}

main().catch(err => { console.error(err); process.exit(1) })
