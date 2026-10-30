import {expect,it} from 'vitest'
import {grammarPrerequisiteErrors} from './inventory'
import {availablePacks} from './packs/registry'
import {u03} from './packs/u03'
import blueprint from '../../docs/content/n5-manifest.json'
it('keeps every real grammar and local teaching chain aligned with the approved ability graph',()=>{
 expect(grammarPrerequisiteErrors(availablePacks,blueprint.skills)).toEqual([])
})
it('rejects a locally renamed prerequisite even if the unit and question IDs still look complete',()=>{
 const p=structuredClone(u03);p.grammar[0].prerequisites=['G06']
 expect(grammarPrerequisiteErrors([p],blueprint.skills).join(' ')).toContain('prerequisites differ from ability blueprint')
})
it('rejects a teaching shortcut around a grammar introduced in the same unit',()=>{
 const p=structuredClone(u03);p.teaching.find(c=>c.grammarIds?.includes('G09'))!.prerequisites=['U03-teach-words-1']
 expect(grammarPrerequisiteErrors([p],blueprint.skills).join(' ')).toContain('teaching bypasses local prerequisite G08')
})
it('accepts a prerequisite reached through a genuine intermediate teaching card',()=>{
 const p=structuredClone(u03),last=p.teaching.find(c=>c.grammarIds?.includes('G09'))!
 p.teaching.push({...structuredClone(last),id:'bridge',grammarIds:[],prerequisites:['U03-teach-G08']});last.prerequisites=['bridge']
 expect(grammarPrerequisiteErrors([p],blueprint.skills)).toEqual([])
})
it('rejects a grammar ability absent from the agreed blueprint',()=>{
 const p=structuredClone(u03);p.grammar[0].id='G-UNKNOWN'
 expect(grammarPrerequisiteErrors([p],blueprint.skills).join(' ')).toContain('unknown ability')
})
