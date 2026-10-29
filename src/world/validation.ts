import { unitPackErrors, type UnitPack } from '../content/contracts'
import { findPath, town, WORLD_VERSION } from './map'
import { BATTLE_RULES_VERSION } from '../battle/rules'
import { CATALOG_VERSION, catalog } from '../economy/catalog'
import { journeyManifest } from './manifest'
export interface ArtAsset {id:string;src:string;columns:number;rows:number;width:number;height:number;bytes:number;sha256:string;reviewStatus:string;frameWindows?:{x:number;y:number;w:number;h:number}[]}
export function journeyErrors(manifest:typeof journeyManifest,pack:UnitPack,assets:ArtAsset[],skillIds:string[],formal=false):string[]{
  const errors=unitPackErrors(pack);const assetIds=new Set(assets.map(a=>a.id));const ids=new Set<string>()
  const need=(id:string,label:string)=>{if(!assetIds.has(id))errors.push(`${label}: missing asset ${id}`)}
  if(assetIds.size!==assets.length)errors.push('assets: duplicate ID')
  for(const a of assets)if(a.columns*a.rows>1){
    if(a.frameWindows?.length!==a.columns*a.rows)errors.push(`${a.id}: missing frame windows`)
    for(const f of a.frameWindows ?? [])if(![f.x,f.y,f.w,f.h].every(Number.isInteger) || f.x<0 || f.y<0 || f.w<=0 || f.h<=0 || f.x+f.w>a.width || f.y+f.h>a.height)errors.push(`${a.id}: invalid frame window`)
  }
  if(manifest.worldVersion!==WORLD_VERSION || manifest.mapId!==town.id)errors.push('world: version/map mismatch')
  if(manifest.rulesVersion!==BATTLE_RULES_VERSION || manifest.catalogVersion!==CATALOG_VERSION)errors.push('rules/catalog: version mismatch')
  for(const destination of town.destinations){if(!findPath(town.spawn,destination.point))errors.push(`${destination.id}: unreachable`);if(destination.asset)need(destination.asset,destination.id)}
  for(const required of ['home','dojo','shop'])if(!manifest.entrances.includes(required))errors.push(`${required}: missing entrance`)
  for(const id of [...manifest.entrances,...manifest.npcs])if(!town.destinations.some(d=>d.id===id))errors.push(`${id}: missing destination/NPC`)
  if(manifest.npcs.length!==2)errors.push('town: expected two residents')
  for(const [actor,id] of Object.entries(manifest.actors)){
    need(id,actor);const a=assets.find(a=>a.id===id)
    if(a && actor!=='mentor' && (a.columns!==3 || a.rows!==(actor==='opponent' ? 1:5)))errors.push(`${id}: missing direction/pose frames`)
  }
  for(const item of catalog){
    const ref=manifest.equipment[item.id as keyof typeof manifest.equipment]
    if(!ref || ref.slot!==item.slot)errors.push(`${item.id}: equipment slot mismatch`)
    if(ref){need(ref.asset,item.id);const a=assets.find(a=>a.id===ref.asset);if(a && (a.rows!==2 || a.columns!==2))errors.push(`${item.id}: missing equipment directions`)}
  }
  for(const q of pack.questions){
    for(const skill of q.skillIds)if(!skillIds.includes(skill))errors.push(`${q.id}: unknown skill ${skill}`)
    if(q.image && !assets.some(a=>a.src===q.image!.src))errors.push(`${q.id}: missing context image`)
  }
  for(const card of pack.teaching)for(const skill of card.skillIds)if(!skillIds.includes(skill))errors.push(`${card.id}: unknown teaching skill ${skill}`)
  for(const encounter of manifest.encounters){
    if(ids.has(encounter.id))errors.push(`${encounter.id}: duplicate encounter`);ids.add(encounter.id)
    if(encounter.mapId!==town.id || !town.destinations.some(d=>d.id===encounter.destinationId && d.kind==='dojo'))errors.push(`${encounter.id}: unknown map/dojo`)
    if(encounter.unitId!==pack.id || encounter.contentVersion!==pack.version)errors.push(`${encounter.id}: content version mismatch`)
    for(const id of encounter.teachingIds)if(!pack.teaching.some(t=>t.id===id))errors.push(`${encounter.id}: missing teaching ${id}`)
    for(const [mode,questions] of [['practice',encounter.practiceIds],['check',encounter.checkIds]] as const){
      if(!questions.length)errors.push(`${encounter.id}: empty ${mode}`)
      for(const id of questions)if(!pack.questions.some(q=>q.id===id && q.partition===mode))errors.push(`${encounter.id}: invalid ${mode} question ${id}`)
      for(const q of pack.questions.filter(q=>q.partition===mode))if(!questions.includes(q.id))errors.push(`${q.id}: missing encounter entry`)
    }
    if(['attack','guard','partner'].some(move=>!encounter.moves.includes(move)))errors.push(`${encounter.id}: missing move`)
  }
  if(!manifest.encounters.length)errors.push('world: missing encounter')
  if(formal){if(pack.reviewStatus!=='APPROVED')errors.push(`${pack.id}: human review required`);for(const a of assets)if(a.reviewStatus!=='APPROVED')errors.push(`${a.id}: human visual review required`)}
  return errors
}
