import type {UnitPack} from '../content/contracts'
import {BATTLE_RULES_VERSION} from '../battle/rules'
import {catalog} from '../economy/catalog'
import {town,walkable,WORLD_VERSION} from '../world/map'
const object=(v:unknown):v is Record<string,unknown>=>!!v && typeof v==='object' && !Array.isArray(v)
const list=(v:unknown):v is string[]=>Array.isArray(v) && v.every(x=>typeof x==='string')
const unique=(v:string[])=>new Set(v).size===v.length
export function currentWorld(v:unknown):boolean {
  return object(v) && v.worldVersion===WORLD_VERSION && v.mapId===town.id && object(v.position) && walkable(v.position as unknown as {x:number;y:number}) && ['up','down','left','right'].includes(String(v.facing)) && list(v.storyFlags) && unique(v.storyFlags) && v.storyFlags.every(id=>town.destinations.some(d=>d.id===id))
}
export function currentStudy(v:unknown,pack:UnitPack):boolean{
  if(!object(v) || v.contentVersion!==pack.version || !list(v.taughtCards) || !unique(v.taughtCards) || !v.taughtCards.every(id=>pack.teaching.some(c=>c.id===id)) || !object(v.taughtAt) || !Object.values(v.taughtAt).every(n=>typeof n==='number' && Number.isFinite(n)) || !list(v.questionIds) || !v.questionIds.every(id=>pack.questions.some(q=>q.id===id)) || typeof v.gradeBand!=='number' || ![1,2,3].includes(v.gradeBand) || typeof v.timeZone!=='string')return false
  try{new Intl.DateTimeFormat('en',{timeZone:v.timeZone}).format(0);return true}catch{return false}
}
export function currentBattle(v:unknown,pack:UnitPack):boolean{
  if(!object(v) || v.contentVersion!==pack.version || v.rulesVersion!==BATTLE_RULES_VERSION || !['choosing','question','feedback','finished'].includes(String(v.phase)) || !['active','won','lost','retreated'].includes(String(v.status)))return false
  for(const [key,max] of [['playerHp',40],['enemyHp',30],['turn',8]] as const)if(typeof v[key]!=='number' || !Number.isInteger(v[key]) || v[key]<(key==='turn'?1:0) || v[key]>max)return false
  if(!list(v.questionIds) || !v.questionIds.length || !unique(v.questionIds) || !v.questionIds.every(id=>pack.questions.some(q=>q.id===id && q.partition==='practice')) || !list(v.loadoutSnapshot) || !unique(v.loadoutSnapshot) || !v.loadoutSnapshot.every(id=>catalog.some(i=>i.id===id)))return false
  if(typeof v.partnerUsed!=='boolean' || v.phase==='finished' && v.status==='active' || v.status==='won' && v.enemyHp!==0)return false
  if(v.status==='active' && (Number(v.playerHp)<=0 || Number(v.enemyHp)<=0))return false
  if((v.phase==='question' || v.phase==='feedback') && (!v.questionIds.includes(String(v.currentQuestionId)) || !['attack','guard','partner'].includes(String(v.move))))return false
  return true
}
export function currentCheck(v:unknown,pack:UnitPack):boolean{
  return object(v) && v.contentVersion===pack.version && ['question','acknowledge','review','finished'].includes(String(v.phase)) && list(v.questionIds) && v.questionIds.length>0 && unique(v.questionIds) && v.questionIds.every(id=>pack.questions.some(q=>q.id===id && q.partition==='check')) && typeof v.index==='number' && Number.isInteger(v.index) && v.index>=0 && v.index<v.questionIds.length
}
