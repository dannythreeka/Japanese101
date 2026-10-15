import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export function validateBlueprint(data) {
  const errors = []
  function unique(list, label) {
    const ids = list.map(x => x.id)
    if (new Set(ids).size !== ids.length) errors.push(`${label}: duplicate ID`)
    return new Set(ids)
  }
  function graph(list, label) {
    const ids = unique(list, label)
    const byId = new Map(list.map(x => [x.id, x]))
    const active = new Set(), done = new Set()
    function visit(id) {
      if (!ids.has(id)) { errors.push(`${label}: missing prerequisite ${id}`); return }
      if (active.has(id)) { errors.push(`${label}: cycle at ${id}`); return }
      if (done.has(id)) return
      active.add(id)
      for (const dep of byId.get(id).prerequisites) visit(dep)
      active.delete(id)
      done.add(id)
    }
    for (const id of ids) visit(id)
    return ids
  }
  const unitIds = graph(data.units, 'units')
  const skillIds = graph(data.skills, 'skills')
  const grammarIds = unique(data.grammar, 'grammar')
  const typeIds = unique(data.questionTypes, 'questionTypes')
  for (let n = 1; n <= 24; n++) if (!unitIds.has(`U${String(n).padStart(2, '0')}`)) errors.push(`missing unit ${n}`)
  for (let n = 1; n <= 14; n++) if (!typeIds.has(`T${String(n).padStart(2, '0')}`)) errors.push(`missing type ${n}`)
  if (data.units.length !== 24 || typeIds.size !== 14) errors.push('expected 24 units / 14 types')
  for (const skill of data.skills) {
    for (const field of ['canDo', 'teaching', 'practice', 'delayedCheck']) {
      if (typeof skill[field] !== 'string' || !skill[field].trim()) errors.push(`${skill.id}: missing ${field}`)
    }
    if (skill.minFamilies < 5) errors.push(`${skill.id}: requires five families`)
  }
  const grammarOwner = new Map()
  for (const unit of data.units) {
    for (const id of [...unit.skillIds, ...unit.entrySkills]) if (!skillIds.has(id)) errors.push(`${unit.id}: unknown skill ${id}`)
    for (const id of unit.grammarIds) {
      if (!grammarIds.has(id) || !skillIds.has(id)) errors.push(`${unit.id}: unknown grammar ${id}`)
      if (grammarOwner.has(id)) errors.push(`${id}: duplicate introduction`)
      grammarOwner.set(id, unit.id)
    }
    if (unit.grammarIds.length !== unit.quotas.newGrammar) errors.push(`${unit.id}: grammar quota mismatch`)
    const counts = Object.values(unit.typeCounts)
    if (counts.length !== 14 || counts.some(x => !Number.isInteger(x) || x < 1) || counts.reduce((a,b) => a+b, 0) !== unit.quotas.practice) errors.push(`${unit.id}: question type quotas`)
    for (const id of Object.keys(unit.typeCounts)) if (!typeIds.has(id)) errors.push(`${unit.id}: unknown type ${id}`)
    for (const value of Object.values(unit.quotas)) if (!Number.isInteger(value) || value < 0) errors.push(`${unit.id}: invalid quota`)
  }
  for (const g of data.grammar) if (grammarOwner.get(g.id) !== g.unitId) errors.push(`${g.id}: wrong introduction unit`)
  function quotas(units, expected, label) {
    for (const [key, min] of Object.entries(expected)) {
      const actual = units.reduce((sum, unit) => sum + unit.quotas[key], 0)
      if (actual < min) errors.push(`${label}: ${key} ${actual} < ${min}`)
    }
  }
  quotas(data.units, { newVocabulary: 600, newKanji: 100, newGrammar: 60, reading: 96, listening: 144, practice: 1200 }, 'v1')
  quotas(data.units.filter(x => ['U01','U02','U03','U04'].includes(x.id)), { newVocabulary: 100, newKanji: 20, newGrammar: 10, reading: 16, listening: 24, practice: 200 }, 'P3')
  if (data.status === 'APPROVED' && (!data.reviewer || !data.reviewedAt)) errors.push('APPROVED requires actual reviewer and date')
  return errors
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(readFileSync(new URL('../docs/content/n5-manifest.json', import.meta.url), 'utf8'))
  const errors = validateBlueprint(data)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`Blueprint structure PASS: ${data.units.length} units, ${data.skills.length} skills, 14 types. Human review: ${data.status}`)
}
