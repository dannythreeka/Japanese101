import { makeListenGenerator, makeMinimalPairGenerator, makeWordToImageGenerator } from '../src/features/kana-catch/questionGenerators'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readFileSync, readdirSync } from 'fs'
import { validateContent, type ContentInput } from '../src/lib/contentValidation'
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
validate('levels.json', loadJson('schemas/levels.schema.json'), loadJson('data/levels.json'))
function assets(dir: string, prefix = ''): string[] {
  return readdirSync(dir, {withFileTypes:true}).flatMap(entry=>entry.isDirectory()?assets(resolve(dir,entry.name),`${prefix}${entry.name}/`):[`${prefix}${entry.name}`])
}
const scenes = new Set([...readFileSync(resolve(root,'src/features/kotodama/scenes/index.ts'),'utf8').matchAll(/^ {2}(\w+):/gm)].map(m=>m[1]))
const skillJson=loadJson('docs/content/n5-manifest.json') as {skills:{id:string}[]}
if (!hasError) {
  const questions: NonNullable<ContentInput['questions']> = []
  const kana=(kanaData as {kana:ContentInput['kana']}).kana, words=(vocabData as {words:ContentInput['words']}).words, lessons=(lessonsData as {lessons:ContentInput['lessons']}).lessons
  const generators = [['listen',makeListenGenerator(kana,4,new Map())] as const, ...lessons.flatMap(unit=>[
    ...unit.suggested_game_modes.includes('kana_catch_minimal_pair') ? [[`${unit.unit_id}/contrast`,makeMinimalPairGenerator(unit.target_kana_pairs,kana,4,new Map(),words)] as const] : [],
    ...unit.suggested_game_modes.includes('kana_catch_word_to_image') ? [[`${unit.unit_id}/image`,makeWordToImageGenerator(unit.concept_words,words,4,new Map())] as const] : [],
  ])]
  for(const [name,generate] of generators)for(let i=0;i<20;i++){const q=generate();questions.push({id:`${name}:${i}`,itemId:q.targetId,options:q.items.map(item=>({id:item.id,correct:item.id===q.targetId}))})}
  const errors = validateContent({
    kana:(kanaData as ContentInput['kana'] & {kana:ContentInput['kana']}).kana,
    words:(vocabData as {words:ContentInput['words']}).words,
    lessons:(lessonsData as {lessons:ContentInput['lessons']}).lessons,
    levels:loadJson('data/levels.json') as ContentInput['levels'], assets:new Set(assets(resolve(root,'public'))), scenes,
    skills:new Set(skillJson.skills.map(s=>s.id)), questions,
  })
  for(const error of errors)console.error(error)
  hasError=errors.length>0
  if(!hasError)console.log('✅ all level/item/scene/skill/asset relations OK')
}

if (hasError) {
  process.exit(1)
}
