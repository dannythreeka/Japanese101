import {validateQuestionBank,type Question,type UnitPack} from '../content/contracts'
import {MOCK_BLUEPRINT_VERSION,MOCK_PAPER_IDS,MOCK_SECTIONS} from './blueprint'
import type {MockPaper} from './contracts'
const clean=(s:string)=>s.normalize('NFKC').replace(/[\p{Z}\s]/gu,'').replace(/[。！？!?]+$/u,'').toLowerCase()
/** Mechanical separation is necessary, but cannot approve the semantic independence or accuracy of an authored form. */
export function mockInventoryErrors(papers:readonly MockPaper[],daily:readonly UnitPack[],requireAll=false):string[]{
  const errors:string[]=[],dailyQuestions=daily.flatMap(p=>p.questions)
  errors.push(...validateQuestionBank([...dailyQuestions,...papers.flatMap(p=>p.questions)]))
  const paperIds=new Set<string>(),families=new Map<string,string>(),content=new Map<string,string>(),materials=new Map<string,string>(),audioScripts=new Map<string,string>()
  const knownTeaching=new Set(daily.flatMap(p=>p.teaching.map(t=>t.id)))
  const knownSkills=new Set(daily.flatMap(p=>p.teaching.flatMap(t=>t.skillIds)))
  function track(map:Map<string,string>,key:string,owner:string,label:string){
    if(!key)return
    const old=map.get(key)
    if(old && old!==owner)errors.push(`${owner}: ${label} shared with ${old}`)
    else map.set(key,owner)
  }
  function questionContent(q:Question,script:string){return JSON.stringify([q.kind,clean(q.prompt),clean(q.promptJa??''),clean(q.material??''),clean(script),q.image?[q.image.src,q.image.cell]:null,q.choices.map(c=>clean(c.text)).sort()])}
  for(const pack of daily)for(const q of pack.questions){
    const script=q.audioSrc?pack.listening.find(a=>a.audioSrc===q.audioSrc)?.script??pack.teaching.find(c=>c.audioSrc===q.audioSrc)?.audioScript??'':''
    families.set(q.itemFamilyId,'daily');content.set(questionContent(q,script),'daily')
    if(q.material)materials.set(clean(q.material),'daily')
    if(script)audioScripts.set(clean(script),'daily')
  }
  for(const paper of papers){
    if(!MOCK_PAPER_IDS.includes(paper.id))errors.push(`${paper.id}: unknown paper`)
    if(paperIds.has(paper.id))errors.push(`${paper.id}: duplicate paper`);paperIds.add(paper.id)
    if(!paper.version.trim()||paper.blueprintVersion!==MOCK_BLUEPRINT_VERSION)errors.push(`${paper.id}: invalid version`)
    if(paper.questions.length!==80)errors.push(`${paper.id}: needs 80 original questions`)
    if(paper.sections.map(s=>s.id).join(',')!==MOCK_SECTIONS.map(s=>s.id).join(','))errors.push(`${paper.id}: section order/count`)
    const allAssignments=paper.sections.flatMap(s=>s.questionIds)
    if(new Set(allAssignments).size!==allAssignments.length)errors.push(`${paper.id}: duplicate section assignment`)
    if(allAssignments.length!==paper.questions.length||allAssignments.some(id=>!paper.questions.some(q=>q.id===id)))errors.push(`${paper.id}: missing/orphan section item`)
    for(const spec of MOCK_SECTIONS){
      const section=paper.sections.find(s=>s.id===spec.id),questions=paper.questions.filter(q=>section?.questionIds.includes(q.id))
      if(section?.questionIds.length!==spec.count)errors.push(`${paper.id}/${spec.id}: requires ${spec.count} questions`)
      for(const [type,count] of Object.entries(spec.types))if(questions.filter(q=>q.typeId===type).length!==count)errors.push(`${paper.id}/${type}: requires ${count} questions`)
      for(const q of questions){
        if(!q.typeId||!(q.typeId in spec.types))errors.push(`${q.id}: incorrect section type`)
        if(spec.id==='listening'&&(!q.audioSrc||q.audioPolicy!=='required'))errors.push(`${q.id}: listening requires authored audio`)
        if(spec.id!=='listening'&&q.audioPolicy==='required')errors.push(`${q.id}: non-listening section requires audio`)
      }
    }
    const assets=new Set<string>()
    for(const a of paper.audio){
      if(assets.has(a.src))errors.push(`${a.id}: repeated audio path`);assets.add(a.src)
      if(!a.src.startsWith(`/assets/audio/mock/${paper.id.toLowerCase()}/`)||a.src.includes('..')||!a.script.trim()||!a.credit.trim()||!a.roles.length||!a.roles.every(r=>r.trim())||!Number.isFinite(a.durationSeconds)||a.durationSeconds<=0||!Number.isSafeInteger(a.bytes)||a.bytes<=44||![a.sha256,a.scriptSha256].every(h=>/^[a-f0-9]{64}$/.test(h)))errors.push(`${a.id}: incomplete audio provenance`)
      if(!paper.questions.some(q=>q.audioSrc===a.src))errors.push(`${a.id}: unused audio`)
      track(audioScripts,clean(a.script),paper.id,'audio script')
    }
    for(const q of paper.questions){
      if(q.unitId!==paper.id||q.partition!=='mock'||q.hintPolicy!=='none')errors.push(`${q.id}: invalid mock ownership/partition/hint policy`)
      if(!q.promptJa||!q.explanationJa||!q.difficulty)errors.push(`${q.id}: missing bilingual authoring metadata`)
      if(q.teachingIds.some(id=>!knownTeaching.has(id)))errors.push(`${q.id}: unknown teaching prerequisite`)
      if(q.skillIds.some(id=>!knownSkills.has(id)))errors.push(`${q.id}: untaught skill`)
      const audio=q.audioSrc?paper.audio.find(a=>a.src===q.audioSrc):undefined
      if(q.audioSrc&&!audio)errors.push(`${q.id}: missing audio source`)
      track(families,q.itemFamilyId,paper.id,'item family')
      track(content,questionContent(q,audio?.script??''),`${paper.id}/${q.id}`,'question content')
      if(q.material)track(materials,clean(q.material),paper.id,'reading material')
    }
  }
  if(requireAll)for(const id of MOCK_PAPER_IDS)if(!paperIds.has(id))errors.push(`${id}: missing authored paper`)
  return errors
}
