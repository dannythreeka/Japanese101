import type {Attempt,UnitPack} from '../content/contracts'
import type {JourneyTables} from '../db/journey-models'
/** Session ownership wins over item IDs, including historical item ID collisions. */
export function attemptUnit(a:Attempt,data:Pick<JourneyTables,'battles'|'checks'>,packs:readonly UnitPack[]):string|undefined{
  const session=[...data.battles,...data.checks].find(s=>s.id===a.sessionId&&s.profileId===a.profileId)
  if(session)return session.unitId
  const candidates=packs.filter(p=>p.questions.some(q=>q.itemId===a.itemId))
  return candidates.length===1?candidates[0].id:undefined
}
export function teachingEvidence(skill:string,data:Pick<JourneyTables,'plans'>,packs:readonly UnitPack[]){
  const eligible=data.plans.filter(p=>packs.some(pack=>pack.id===p.unitId&&pack.teaching.some(c=>c.skillIds.includes(skill)))&&Number.isFinite(p.taughtAt[skill])).sort((a,b)=>a.taughtAt[skill]-b.taughtAt[skill])
  return {taughtAt:eligible[0]?.taughtAt[skill],timeZone:eligible[0]?.timeZone ?? 'Asia/Taipei'}
}
