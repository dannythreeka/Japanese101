import type {UnitPack} from './contracts'
import {unitPackErrors} from './contracts'
export interface UnitBlueprint {
  id:string;skillIds:string[];grammarIds:string[];quotas:{newVocabulary:number;newKanji:number;newGrammar:number;reading:number;listening:number;practice:number};typeCounts:Record<string,number>
}
/** The approved ability graph owns prerequisites; author drafts must not silently fork it. */
export function grammarPrerequisiteErrors(packs:readonly UnitPack[],skills:readonly {id:string;prerequisites:string[]}[]):string[]{
  const errors:string[]=[],known=new Map(skills.map(s=>[s.id,s]))
  for(const pack of packs){
    const cards=new Map(pack.teaching.map(c=>[c.id,c])),local=new Set(pack.grammar.map(g=>g.id))
    for(const grammar of pack.grammar){
      const spec=known.get(grammar.id)
      if(!spec){errors.push(`${pack.id}/${grammar.id}: unknown ability`);continue}
      if(!Array.isArray(grammar.prerequisites)||grammar.prerequisites.some(p=>typeof p!=='string')||new Set(grammar.prerequisites).size!==grammar.prerequisites.length||JSON.stringify([...grammar.prerequisites].sort())!==JSON.stringify([...spec.prerequisites].sort()))errors.push(`${pack.id}/${grammar.id}: prerequisites differ from ability blueprint`)
      for(const card of pack.teaching.filter(c=>c.grammarIds?.includes(grammar.id)))for(const dep of spec.prerequisites.filter(id=>local.has(id))){
        if(card.grammarIds?.includes(dep))continue
        const seen=new Set<string>(),pending=[...(card.prerequisites??[])];let found=false
        while(pending.length){const id=pending.pop()!;if(seen.has(id))continue;seen.add(id);const prior=cards.get(id);if(prior?.grammarIds?.includes(dep)){found=true;break}pending.push(...(prior?.prerequisites??[]))}
        if(!found)errors.push(`${pack.id}/${card.id}: teaching bypasses local prerequisite ${dep}`)
      }
    }
  }
  return errors
}
/** Cross-unit counting uses actual authored packs; a blueprint row is never playable inventory. */
export function curriculumErrors(packs:readonly UnitPack[],blueprints:readonly UnitBlueprint[]):string[]{
  const errors:string[]=[]
  const vocab=new Map<string,string>(),kanji=new Map<string,string>(),grammar=new Map<string,string>(),ids=new Set<string>()
  for(const pack of packs){
    errors.push(...unitPackErrors(pack))
    if(ids.has(pack.id))errors.push(`${pack.id}: duplicate unit`);ids.add(pack.id)
    const spec=blueprints.find(b=>b.id===pack.id)
    if(!spec){errors.push(`${pack.id}: missing blueprint`);continue}
    for(const [name,actual,expected] of [['vocabulary',pack.vocabulary.length,spec.quotas.newVocabulary],['kanji',pack.kanji.length,spec.quotas.newKanji],['grammar',pack.grammar.length,spec.quotas.newGrammar],['reading',pack.readings.length,spec.quotas.reading],['listening',pack.listening.length,spec.quotas.listening],['practice',pack.questions.filter(q=>q.partition==='practice').length,spec.quotas.practice]])if(actual!==expected)errors.push(`${pack.id}: ${name} quota ${actual} != ${expected}`)
    for(const [type,count] of Object.entries(spec.typeCounts))if(pack.questions.filter(q=>q.partition==='practice'&&q.typeId===type).length!==count)errors.push(`${pack.id}: ${type} distribution mismatch`)
    for(const [field,ref,seen,key] of [['vocabulary','vocabularyIds',vocab,'reading'],['kanji','kanjiIds',kanji,'text'],['grammar','grammarIds',grammar,'id']] as const){
      const entries=pack[field] as {id:string;text?:string;reading?:string}[]
      const known=new Set(entries.map(e=>e.id))
      for(const entry of entries){
        const value=String(entry[key]).normalize('NFKC')
        if(seen.has(value))errors.push(`${entry.id}: ${field} already introduced by ${seen.get(value)}`)
        seen.set(value,entry.id)
        if(!pack.teaching.some(c=>c[ref]?.includes(entry.id)))errors.push(`${entry.id}: missing teaching entry`)
      }
      for(const card of pack.teaching)if(card[ref]?.some(id=>!known.has(id)))errors.push(`${card.id}: unknown ${ref}`)
    }
    if(JSON.stringify([...pack.grammar.map(g=>g.id)].sort())!==JSON.stringify([...spec.grammarIds].sort()))errors.push(`${pack.id}: grammar IDs differ from blueprint`)
    for(const card of pack.teaching)if(card.skillIds.some(id=>!spec.skillIds.includes(id)))errors.push(`${card.id}: unassigned teaching skill`)
    for(const q of pack.questions){
      if(q.skillIds.some(id=>!spec.skillIds.includes(id)))errors.push(`${q.id}: unassigned skill`)
      if(!q.promptJa || !q.explanationJa || q.partition==='practice'&&!q.hintJa)errors.push(`${q.id}: missing Japanese text`)
      if(!q.difficulty)errors.push(`${q.id}: missing difficulty`)
      if(q.partition==='practice' && (!q.typeId || !(q.typeId in spec.typeCounts)))errors.push(`${q.id}: unassigned practice type`)
      if(/^G\d+$/.test(q.primarySkillId) && !pack.teaching.some(c=>q.teachingIds.includes(c.id)&&c.grammarIds?.includes(q.primarySkillId)))errors.push(`${q.id}: missing grammar prerequisite`)
    }
    for(const material of pack.readings)if(!pack.questions.some(q=>q.materialId===material.id))errors.push(`${material.id}: unused reading`)
    for(const material of pack.listening)if(!pack.questions.some(q=>q.audioId===material.id))errors.push(`${material.id}: unused listening`)
  }
  return errors
}
