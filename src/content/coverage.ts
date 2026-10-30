import {validateQuestionBank,type Question,type UnitPack} from './contracts'
export interface CoverageSkill {id:string;canDo:string;prerequisites:string[];minFamilies:number}
const unique=(values:string[])=>[...new Set(values)].sort()
const normalized=(value:string)=>value.normalize('NFKC').replace(/[\p{Z}\s]/gu,'').replace(/[。！？!?]+$/u,'').toLowerCase()
/** Mechanical duplicates only. A different signature does NOT prove semantic independence. */
export function curriculumCoverage(packs:readonly UnitPack[],skills:readonly CoverageSkill[]){
  const questions=packs.flatMap(p=>p.questions),errors=validateQuestionBank(questions)
  const practiceFamilies=new Set(questions.filter(q=>q.partition!=='check').map(q=>q.itemFamilyId))
  const groups=new Map<string,Question[]>(),answerSignatures=new Map<string,string>()
  for(const pack of packs)for(const q of pack.questions){
    const source=q.audioSrc ? pack.listening.find(l=>l.audioSrc===q.audioSrc)?.script??pack.teaching.find(c=>c.audioSrc===q.audioSrc)?.audioScript??q.audioSrc:''
    const signature=JSON.stringify([q.kind,normalized(q.prompt),normalized(q.promptJa??''),normalized(q.material??''),normalized(source),q.image?[q.image.src,q.image.cell]:null,q.choices.map(c=>normalized(c.text)).sort()])
    const group=groups.get(signature)??[];group.push(q);groups.set(signature,group)
    answerSignatures.set(q.id,JSON.stringify(q.answer.map(id=>normalized(q.choices.find(c=>c.id===id)?.text??''))))
  }
  const excluded=new Set<string>(),duplicates:{itemIds:string[];familyIds:string[];crossesPartition:boolean;conflictingAnswers:boolean}[]=[]
  for(const group of groups.values()){
    if(group.length<2)continue
    const familyIds=unique(group.map(q=>q.itemFamilyId)),crossesPartition=new Set(group.map(q=>q.partition)).size>1
    const conflictingAnswers=new Set(group.map(q=>answerSignatures.get(q.id))).size>1
    if(familyIds.length===1&&!crossesPartition&&!conflictingAnswers)continue
    const itemIds=group.map(q=>q.id).sort();duplicates.push({itemIds,familyIds,crossesPartition,conflictingAnswers})
    errors.push(`${itemIds.join(', ')}: ${conflictingAnswers?'same prompt/options have conflicting answers':crossesPartition?'same item content crosses partitions':'same item content split into different families'}`)
    const candidates=group.filter(q=>q.partition==='check').sort((a,b)=>a.id.localeCompare(b.id))
    for(const q of candidates.slice(crossesPartition||conflictingAnswers?0:1))excluded.add(q.id)
  }
  const rows=skills.map(skill=>{
    const teachingIds=unique(packs.flatMap(p=>p.teaching.filter(c=>c.skillIds.includes(skill.id)).map(c=>c.id)))
    // Secondary tags do not create a primary measurement of another ability.
    const practice=questions.filter(q=>q.primarySkillId===skill.id&&q.partition==='practice')
    const checks=questions.filter(q=>q.primarySkillId===skill.id&&q.partition==='check')
    const eligible=checks.filter(q=>q.hintPolicy==='none'&&!practiceFamilies.has(q.itemFamilyId)&&!excluded.has(q.id))
    const candidateFamilies=unique(checks.map(q=>q.itemFamilyId)),eligibleFamilies=unique(eligible.map(q=>q.itemFamilyId))
    const declaredApprovedFamilies=unique(eligible.filter(q=>q.reviewStatus==='APPROVED'&&packs.some(p=>p.id===q.unitId&&p.reviewStatus==='APPROVED'&&p.reviewer&&p.reviewedAt)).map(q=>q.itemFamilyId))
    const missing=[...(!teachingIds.length?['teaching']:[]),...(!practice.length?['primary practice']:[]),...(!checks.length?['primary independent check']:[]),...(eligibleFamilies.length<skill.minFamilies?[`independent families ${eligibleFamilies.length}/${skill.minFamilies}`]:[])]
    return {id:skill.id,canDo:skill.canDo,prerequisites:skill.prerequisites,requiredFamilies:skill.minFamilies,teachingIds,practiceIds:practice.map(q=>q.id),checkIds:checks.map(q=>q.id),candidateFamilies,eligibleFamilies,declaredApprovedFamilies,missing,engineeringCoverage:missing.length?'GAP':'CANDIDATES_PRESENT',humanIndependentReview:'REQUIRED' as const}
  })
  return {actualUnits:packs.map(p=>p.id),questionTypes:unique(questions.filter(q=>q.partition==='practice'&&q.typeId).map(q=>q.typeId!)).map(id=>({id,itemIds:questions.filter(q=>q.partition==='practice'&&q.typeId===id).map(q=>q.id)})),skills:rows,duplicates,errors,summary:{skills:rows.length,withCandidateCoverage:rows.filter(r=>!r.missing.length).length,withGaps:rows.filter(r=>r.missing.length).length,mechanicalDuplicateGroups:duplicates.length},limitations:['Candidate family counts are not a human semantic-independence approval.','Runtime delayed mastery still requires 48 hours, two local dates and four of five independent first answers; this inventory never awards player ability.','Kana glyph placement is not silently counted as an approved delayed assessment of the aggregate kana skills.']}
}
