import type {Attempt, UnitPack} from '../content/contracts'
import {attemptErrors} from '../content/contracts'
import type {LearningCheck} from '../db/journey-models'
import {currentCheck} from '../db/journey-compatibility'

/** Diagnostic credit only; never fabricates teaching timestamps or stable mastery. */
export function passedPlacementSkills(pack:UnitPack, checks:LearningCheck[], attempts:Attempt[]):string[]{
  if(!['KANA-HIRA','KANA-KATA'].includes(pack.id))return []
  const latest=new Map<string,Attempt>()
  for(const check of checks){
    if(check.purpose!=='kana-placement' || check.phase!=='finished' || !currentCheck(check,pack))continue
    if(!check.questionIds.every((_,index)=>attempts.some(a=>a.id===`${check.id}:check-${index}` && a.profileId===check.profileId && !attemptErrors(a).length)))continue
    check.questionIds.forEach((id,index)=>{
      const question=pack.questions.find(q=>q.id===id)!
      const a=attempts.find(a=>a.id===`${check.id}:check-${index}` && a.profileId===check.profileId)
      if(!a || attemptErrors(a).length || a.mode!=='check' || a.itemId!==question.itemId || a.itemVersion!==question.version || a.primarySkillId!==question.primarySkillId || a.itemFamilyId!==question.itemFamilyId)return
      const old=latest.get(a.primarySkillId)
      if(!old || a.submittedAt>old.submittedAt || a.submittedAt===old.submittedAt && a.id>old.id)latest.set(a.primarySkillId,a)
    })
  }
  return [...latest].filter(([,a])=>{
    const question=pack.questions.find(q=>q.itemId===a.itemId)!
    return a.outcome==='correct' && a.firstAnswerCorrect===true && !a.hintUsed && a.retryCount===0 && a.audioPlayCount>0 && JSON.stringify(a.answerIds)===JSON.stringify(question.answer)
  }).map(([skill])=>skill)
}
export function eligibleTeachingIds(pack:UnitPack,taught:string[],passed:string[]):string[]{
  return [...new Set([...taught,...pack.teaching.filter(card=>card.skillIds.length>0 && card.skillIds.every(id=>passed.includes(id))).map(c=>c.id)])]
}
