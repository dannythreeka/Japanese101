import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadJson(relPath: string): unknown {
  return JSON.parse(readFileSync(resolve(root, relPath), 'utf-8'))
}

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const kanaSchema = loadJson('src/data/schemas/kana.schema.json')
const vocabSchema = loadJson('src/data/schemas/vocabulary.schema.json')
const lessonsSchema = loadJson('src/data/schemas/unit_lessons.schema.json')
const rhythmSchema = loadJson('src/data/schemas/rhythm_tracks.schema.json')

const kanaData = loadJson('src/data/kana.json')
const vocabData = loadJson('src/data/vocabulary.json')
const lessonsData = loadJson('src/data/unit_lessons.json')
const rhythmData = loadJson('src/data/rhythm_tracks.json')

let hasError = false

function validate(name: string, schema: unknown, data: unknown): void {
  const valid = ajv.validate(schema as object, data)
  if (!valid) {
    console.error(`\n❌ ${name} validation FAILED:`)
    for (const err of ajv.errors ?? []) {
      console.error(`   ${err.instancePath || '(root)'} ${err.message}`)
    }
    hasError = true
  } else {
    console.log(`✅ ${name} OK`)
  }
}

validate('kana.json', kanaSchema, kanaData)
validate('vocabulary.json', vocabSchema, vocabData)
validate('unit_lessons.json', lessonsSchema, lessonsData)
validate('rhythm_tracks.json', rhythmSchema, rhythmData)

if (hasError) {
  process.exit(1)
}
