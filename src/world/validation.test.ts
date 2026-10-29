import { expect, it } from 'vitest'
import { journeyErrors } from './validation'
import { journeyManifest } from './manifest'
import { u01 } from '../content/packs/u01'
import art from '../../public/assets/img/journey/manifest.json'
import blueprint from '../../docs/content/n5-manifest.json'
const skills=blueprint.skills.map(s=>s.id)
it('traces all draft unit encounters, assets and four renderers without false release approval',()=>{
  expect(journeyErrors(journeyManifest,u01,art.assets,skills)).toEqual([])
  expect(new Set(u01.questions.map(q=>q.kind)).size).toBe(4)
  expect(journeyErrors(journeyManifest,u01,art.assets,skills,true).join(' ')).toContain('human review required')
})
it('rejects missing entrance/NPC/question/skill, slots, poses, references and stale versions with IDs',()=>{
  const m=structuredClone(journeyManifest);m.entrances=['home','shop'];m.npcs[0]='absent';m.catalogVersion='old';m.equipment['gear-travel-hat'].slot='neck';m.encounters[0].practiceIds[0]='absent-question';m.encounters[0].teachingIds[0]='absent-teaching'
  const assets=structuredClone(art.assets);assets.find(a=>a.id==='fox-sheet')!.rows=2
  const pack=structuredClone(u01);pack.questions[0].primarySkillId='bad-skill';pack.questions[0].skillIds=['bad-skill'];pack.questions[42].image!.src='/assets/img/missing.webp'
  const errors=journeyErrors(m,pack,assets,skills).join(' ')
  for(const issue of ['dojo: missing entrance','absent: missing destination','version mismatch','gear-travel-hat: equipment slot','fox-sheet: missing direction','absent-question','absent-teaching','bad-skill','U01-Q43: missing context'])expect(errors).toContain(issue)
})
