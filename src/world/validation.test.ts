import { expect, it } from 'vitest'
import { journeyErrors } from './validation'
import { journeyManifest } from './manifest'
import { u01 } from '../content/packs/u01'
import {availablePacks} from '../content/packs/registry'
import u02Art from '../../public/assets/img/u02/manifest.json'
import art from '../../public/assets/img/journey/manifest.json'
import blueprint from '../../docs/content/n5-manifest.json'
const allArt=[...art.assets,...u02Art.assets]
const skills=[...blueprint.skills.map(s=>s.id),...availablePacks.filter(p=>p.id.startsWith('KANA-')).flatMap(p=>p.teaching.flatMap(c=>c.skillIds))]
it('traces all draft unit encounters, assets and four renderers without false release approval',()=>{
  expect(journeyErrors(journeyManifest,availablePacks,allArt,skills)).toEqual([])
  expect(new Set(u01.questions.map(q=>q.kind)).size).toBe(4)
  expect(journeyErrors(journeyManifest,availablePacks,allArt,skills,true).join(' ')).toContain('human review required')
})
it('rejects missing entrance/NPC/question/skill, slots, poses, references and stale versions with IDs',()=>{
  const m=structuredClone(journeyManifest);m.entrances=['home','shop'];m.npcs[0]='absent';m.catalogVersion='old';m.equipment['gear-travel-hat'].slot='neck';m.encounters[0].practiceIds[0]='absent-question';m.encounters[0].teachingIds[0]='absent-teaching'
  const assets=structuredClone(allArt);assets.find(a=>a.id==='fox-sheet')!.rows=2
  const pack=structuredClone(u01);pack.questions[0].primarySkillId='bad-skill';pack.questions[0].skillIds=['bad-skill'];pack.questions[42].image!.src='/assets/img/missing.webp'
  const errors=journeyErrors(m,[pack,...availablePacks.filter(p=>p.id!=='U01')],assets,skills).join(' ')
  for(const issue of ['dojo: missing entrance','absent: missing destination','version mismatch','gear-travel-hat: equipment slot','fox-sheet: missing direction','absent-question','absent-teaching','bad-skill','U01-Q43: missing context'])expect(errors).toContain(issue)
})

it('rejects a registered unit without a reachable encounter and unknown encounter content',()=>{
  const manifest=structuredClone(journeyManifest);manifest.encounters=manifest.encounters.filter(e=>e.unitId!=='U02')
  expect(journeyErrors(manifest,availablePacks,allArt,skills)).toContain('U02: missing encounter')
  expect(journeyErrors(journeyManifest,[u01],allArt,skills).join(' ')).toContain('missing unit U02')
})
