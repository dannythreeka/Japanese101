import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validateBlueprint } from './blueprint.mjs'

const fixture = () => ({...JSON.parse(readFileSync(new URL('../docs/content/n5-manifest.json', import.meta.url), 'utf8')),status:'DRAFT',reviewer:null,reviewedAt:null})
test('valid draft passes without claiming human approval', () => assert.deepEqual(validateBlueprint(fixture()), []))
test('actual owner gate attestation is valid without weakening the false approval fixture',()=>assert.deepEqual(validateBlueprint(JSON.parse(readFileSync(new URL('../docs/content/n5-manifest.json',import.meta.url),'utf8'))),[]))
for (const [name, mutate, expected] of [
  ['duplicate unit', d => { d.units[1].id = 'U01' }, /duplicate/],
  ['unit cycle', d => { d.units[0].prerequisites = ['U24'] }, /cycle/],
  ['skill cycle', d => { d.skills[0].prerequisites = ['G60'] }, /cycle/],
  ['missing skill', d => { d.units[0].skillIds.push('missing') }, /unknown skill/],
  ['missing can-do', d => { d.skills[0].canDo = '' }, /missing canDo/],
  ['insufficient families', d => { d.skills[0].minFamilies = 4 }, /five families/],
  ['missing type', d => { d.questionTypes.pop() }, /missing type/],
  ['incorrect quota', d => { d.units[0].quotas.newVocabulary = 0 }, /newVocabulary/],
  ['false approval', d => { d.status = 'APPROVED' }, /requires actual reviewer/],
]) test(name, () => { const data = fixture(); mutate(data); assert.match(validateBlueprint(data).join('\n'), expected) })
