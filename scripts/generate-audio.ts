/**
 * VOICEVOX audio generator — 四国めたん ノーマル (Speaker 2)
 *
 * Generates WAV files for all kana, vocabulary words, and game phrases.
 * The app's tts.ts#speakById() prefers these files over Web Speech API.
 *
 * ── Quick start ─────────────────────────────────────────────────────────────
 *   npm run gen:voice:test        # generate "やった！" only (verify setup)
 *   npm run gen:voice             # batch-generate all files
 *
 * ── Options ─────────────────────────────────────────────────────────────────
 *   VOICEVOX_URL=http://localhost:50021  # use local VOICEVOX (recommended for batch)
 *   VOICEVOX_SPEAKER=2                  # speaker ID (2 = 四国めたん ノーマル)
 *   VOICEVOX_DELAY_MS=700               # ms between requests (public API: use ≥600)
 *
 * ── Public API note ──────────────────────────────────────────────────────────
 *   Default: https://voicevox.su-shiki.com/api/  (free, no key needed)
 *   Backup:  https://deprecatedapis.tts.quest/v2/voicevox/audio/ (different format)
 *   For batch generation of 200+ files, local VOICEVOX is more reliable:
 *   → Download: https://voicevox.hiroshiba.jp/  (free, ~500 MB)
 *   → Run engine, then: VOICEVOX_URL=http://localhost:50021 npm run gen:voice
 *
 * ── Output ───────────────────────────────────────────────────────────────────
 *   public/assets/audio/phrase_<slug>.wav  — game phrases
 *   public/assets/audio/kana_<id>.wav      — hiragana (71 characters)
 *   public/assets/audio/word_<id>.wav      — vocabulary words
 *
 * ── License ──────────────────────────────────────────────────────────────────
 *   四国めたん: https://zunko.jp/con_ongen_kiyaku.html
 *   ずんだもん: https://zunko.jp/con_ongen_kiyaku.html
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const OUT_DIR   = path.join(ROOT, 'public', 'assets', 'audio')

// ── Config ───────────────────────────────────────────────────────────────────

const VOICEVOX_BASE = process.env.VOICEVOX_URL ?? 'https://voicevox.su-shiki.com/api'
const SPEAKER_ID    = Number(process.env.VOICEVOX_SPEAKER ?? '2')  // 2 = 四国めたん ノーマル
const DELAY_MS      = Number(process.env.VOICEVOX_DELAY_MS ?? '700')
const MAX_RETRIES   = 3
const IS_LOCAL      = VOICEVOX_BASE.includes('localhost') || VOICEVOX_BASE.includes('127.0.0.1')

// Fixed game phrases — slug → text
const GAME_PHRASES: Record<string, string> = {
  yatta:     'やった！',
  mouichido: 'もういちど！',
  sugoi:     'すごい！',
  niceone:   'いいね！',
  gambare:   'がんばれ！',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface KanaEntry  { id: string; hiragana: string }
interface VocabEntry { id: string; kana: string }
interface Item       { id: string; text: string; label: string }

// ── VOICEVOX API ─────────────────────────────────────────────────────────────

async function synthesize(text: string, outPath: string, attempt = 1): Promise<void> {
  try {
    // Step 1: audio_query
    const qRes = await fetch(
      `${VOICEVOX_BASE}/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`,
      { method: 'POST', signal: AbortSignal.timeout(15_000) },
    )
    if (!qRes.ok) throw new Error(`audio_query HTTP ${qRes.status}`)
    const query = await qRes.json() as Record<string, unknown>

    // Tune for learner clarity: slightly slower, more expressive
    query.speedScale      = 0.87
    query.intonationScale = 1.15
    query.pitchScale      = 0.02   // slightly higher pitch (child-friendly)

    // Step 2: synthesis
    const sRes = await fetch(
      `${VOICEVOX_BASE}/synthesis?speaker=${SPEAKER_ID}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(query),
        signal:  AbortSignal.timeout(30_000),
      },
    )
    if (!sRes.ok) throw new Error(`synthesis HTTP ${sRes.status}`)

    const buf = Buffer.from(await sRes.arrayBuffer())
    fs.writeFileSync(outPath, buf)

  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const wait = attempt * 1200
      console.warn(`    ↻ retry ${attempt}/${MAX_RETRIES - 1} in ${wait}ms — ${(err as Error).message}`)
      await sleep(wait)
      return synthesize(text, outPath, attempt + 1)
    }
    throw err
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Data loading ─────────────────────────────────────────────────────────────

function loadItems(): Item[] {
  const kanaRaw  = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/kana.json'), 'utf-8'))
  const vocabRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/vocabulary.json'), 'utf-8'))

  const kanaList: KanaEntry[]  = kanaRaw.kana   ?? []
  const vocabList: VocabEntry[] = vocabRaw.words ?? []

  return [
    ...Object.entries(GAME_PHRASES).map(([slug, text]) => ({
      id: `phrase_${slug}`, text, label: 'phrase',
    })),
    ...kanaList.map(k  => ({ id: `kana_${k.id}`,   text: k.hiragana, label: 'kana' })),
    ...vocabList.map(v => ({ id: `word_${v.id}`,   text: v.kana,     label: 'word' })),
  ]
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const testMode = process.argv.includes('--test')

  fs.mkdirSync(OUT_DIR, { recursive: true })

  if (testMode) {
    // Single test: generate "やった！"
    console.log('═══════════════════════════════════════════')
    console.log('  VOICEVOX Test — やった！')
    console.log(`  URL:     ${VOICEVOX_BASE}`)
    console.log(`  Speaker: ${SPEAKER_ID} (四国めたん ノーマル = 2)`)
    console.log('═══════════════════════════════════════════')
    const outPath = path.join(OUT_DIR, 'phrase_yatta.wav')
    try {
      await synthesize('やった！', outPath)
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1)
      console.log(`✅ 成功！ ${outPath} (${kb} KB)`)
      console.log('\n次のステップ: npm run gen:voice でまとめて生成')
    } catch (err) {
      console.error(`❌ 失敗: ${(err as Error).message}`)
      console.error('\n【ヒント】ローカル VOICEVOX エンジンを試してみよう:')
      console.error('  1. https://voicevox.hiroshiba.jp/ からダウンロード')
      console.error('  2. 起動後: VOICEVOX_URL=http://localhost:50021 npm run gen:voice:test')
      process.exit(1)
    }
    return
  }

  // Batch mode
  const allItems = loadItems()
  const toGenerate = allItems.filter(({ id }) => {
    const outPath = path.join(OUT_DIR, `${id}.wav`)
    return !fs.existsSync(outPath)
  })

  console.log('═══════════════════════════════════════════')
  console.log(`  VOICEVOX Batch Generator`)
  console.log(`  URL:      ${VOICEVOX_BASE}`)
  console.log(`  Speaker:  ${SPEAKER_ID} (四国めたん ノーマル = 2)`)
  console.log(`  Delay:    ${IS_LOCAL ? '0' : DELAY_MS}ms between requests`)
  console.log(`  Total:    ${allItems.length} items (${toGenerate.length} to generate, ${allItems.length - toGenerate.length} already exist)`)
  console.log('═══════════════════════════════════════════')

  if (toGenerate.length === 0) {
    console.log('✅ All files already exist. Delete files to regenerate.')
    return
  }

  if (!IS_LOCAL && toGenerate.length > 10) {
    const estMin = Math.ceil((toGenerate.length * (DELAY_MS + 3000)) / 60_000)
    console.log(`⏱  Estimated time: ~${estMin} minutes (public API)`)
    console.log('   Tip: Use local VOICEVOX for faster batch generation\n')
  }

  let ok = 0
  let fail = 0

  for (const { id, text, label } of toGenerate) {
    const outPath = path.join(OUT_DIR, `${id}.wav`)
    try {
      await synthesize(text, outPath)
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1)
      console.log(`  ✓ [${label}] ${id}  "${text}"  (${kb} KB)`)
      ok++
      if (!IS_LOCAL) await sleep(DELAY_MS)
    } catch (err) {
      console.error(`  ✗ [${label}] ${id}  "${text}" — ${(err as Error).message}`)
      fail++
    }
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`  Done: ${ok} generated, ${fail} failed, ${allItems.length - toGenerate.length} skipped`)
  if (fail > 0) {
    console.log('  Failed files: re-run to retry (already-generated files are skipped)')
  }
  console.log('═══════════════════════════════════════════')
  if (fail > 0) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
