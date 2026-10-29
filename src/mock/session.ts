import {MOCK_RULES_VERSION,MOCK_SECTIONS,type MockSectionId} from './blueprint'
import {hasApprovedMockMetadata,type MockPaper} from './contracts'

export interface MockAnswer {questionId:string;choiceIds:string[];savedAt:number}
export interface MockSectionState {
  id:MockSectionId;status:'ready'|'active'|'paused'|'complete'
  startedAt?:number;deadlineAt?:number;completedAt?:number;remainingMs?:number
  answers:Record<string,MockAnswer>
  audio:Record<string,{status:'playing'|'complete';startedAt:number;completedAt?:number;plays:number}>
}
export interface MockSession {
  id:string;profileId:string;paperId:string;paperVersion:string;rulesVersion:string
  mode:'standard'|'preview'|'practice';status:'ready'|'active'|'paused'|'interrupted'|'submitted'
  sectionIndex:number;sections:MockSectionState[];revision:number
  createdAt:number;updatedAt:number;lastObservedAt:number;submittedAt?:number;receiptId?:string
  exclusions:string[];events:{kind:string;at:number;section:MockSectionId}[]
}
export type MockCommand=
  |{type:'start'|'tick'|'submit-section'|'pause'|'resume'|'reveal'|'reload'|'background'|'foreground'|'offline'|'online'|'audio-failed'}
  |{type:'answer';questionId:string;choiceIds:string[]}
  |{type:'audio-start'|'audio-complete';questionId:string}

function time(now:number){if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid mock clock')}
function activeSpec(index:number){const spec=MOCK_SECTIONS[index];if(!spec)throw new Error('Invalid mock section');return spec}
export function createMockSession(id:string,profileId:string,paper:MockPaper,now:number,practice=false):MockSession{
  time(now)
  if(!id.trim()||!profileId.trim())throw new Error('Missing session owner/identity')
  const reviewed=hasApprovedMockMetadata(paper)
  return {id,profileId,paperId:paper.id,paperVersion:paper.version,rulesVersion:MOCK_RULES_VERSION,mode:practice?'practice':reviewed?'standard':'preview',status:'ready',sectionIndex:0,sections:MOCK_SECTIONS.map(s=>({id:s.id,status:'ready',answers:{},audio:{}})),revision:0,createdAt:now,updatedAt:now,lastObservedAt:now,exclusions:practice?['practice-requested']:reviewed?[]:['draft-content'],events:[]}
}
/** Deterministic transition only. The repository must commit the returned state before displaying success/results. */
export function transitionMockSession(input:MockSession,paper:MockPaper,command:MockCommand,now:number):{session:MockSession;accepted:boolean;reason?:string}{
  time(now)
  if(input.status==='submitted')return {session:input,accepted:false,reason:'already-submitted'}
  const s=structuredClone(input),section=s.sections[s.sectionIndex],spec=activeSpec(s.sectionIndex)
  if(!section||section.id!==spec.id)throw new Error('Corrupt section state')
  const event=(kind:string)=>{s.events.push({kind,at:Math.max(now,s.lastObservedAt),section:section.id})}
  const exclude=(reason:string)=>{if(!s.exclusions.includes(reason))s.exclusions.push(reason)}
  const finish=(accepted:boolean,reason?:string)=>{s.revision++;s.updatedAt=Math.max(now,s.updatedAt);s.lastObservedAt=Math.max(now,s.lastObservedAt);return {session:s,accepted,reason}}
  const interrupt=(reason:string)=>{
    if(section.status==='active')section.remainingMs=Math.max(0,(section.deadlineAt??s.lastObservedAt)-Math.max(now,s.lastObservedAt))
    exclude(reason);event(reason);s.status='interrupted';return finish(false,reason)
  }
  if(s.paperId!==paper.id||s.paperVersion!==paper.version||s.rulesVersion!==MOCK_RULES_VERSION)return interrupt('version-changed')
  if(now<s.lastObservedAt)return interrupt('clock-regressed')
  if(s.status==='interrupted'&&command.type!=='resume')return {session:input,accepted:false,reason:'interrupted'}
  const completeSection=(at:number)=>{
    section.status='complete';section.completedAt=at;event('section-complete')
    if(s.sectionIndex===MOCK_SECTIONS.length-1){s.status='submitted';s.submittedAt=at;s.receiptId=`mock-submit:${s.id}`}
    else{s.sectionIndex++;s.status='ready'}
  }
  if(s.status==='active'&&section.status==='active'&&now>=(section.deadlineAt??Infinity)){
    completeSection(section.deadlineAt!);return finish(command.type==='tick','deadline-reached')
  }
  const downgrade=(reason:string)=>{s.mode='practice';exclude(reason);event(reason)}
  const ids=paper.sections.find(p=>p.id===section.id)?.questionIds??[]
  switch(command.type){
    case 'start':
      if(s.status!=='ready'||section.status!=='ready')return {session:input,accepted:false,reason:'not-ready'}
      section.status='active';section.startedAt=now;section.deadlineAt=now+spec.minutes*60000;s.status='active';event('section-start');break
    case 'answer':{
      if(s.status!=='active')return {session:input,accepted:false,reason:'not-active'}
      const q=paper.questions.find(q=>q.id===command.questionId&&ids.includes(q.id))
      if(!q||new Set(command.choiceIds).size!==command.choiceIds.length||command.choiceIds.some(id=>!q.choices.some(c=>c.id===id))||(q.kind==='order'?command.choiceIds.length!==q.choices.length:command.choiceIds.length!==1))return {session:input,accepted:false,reason:'invalid-answer'}
      if(q.audioPolicy==='required'&&section.audio[q.id]?.status!=='complete')return {session:input,accepted:false,reason:'audio-incomplete'}
      section.answers[q.id]={questionId:q.id,choiceIds:[...command.choiceIds],savedAt:now};break
    }
    case 'submit-section':
      if(s.status!=='active')return {session:input,accepted:false,reason:'not-active'}
      completeSection(now);break
    case 'pause':
      if(s.status!=='active')return {session:input,accepted:false,reason:'not-active'}
      downgrade('paused');section.remainingMs=Math.max(0,section.deadlineAt!-now);section.status='paused';s.status='paused';break
    case 'resume':
      if(s.status!=='paused'&&s.status!=='interrupted')return {session:input,accepted:false,reason:'not-paused'}
      downgrade('resumed-as-practice')
      if(section.status==='ready')s.status='ready'
      else{section.status='active';section.deadlineAt=now+(section.remainingMs??0);s.status='active'}
      // Interrupted audio has no completion evidence; a practice replay must start from the beginning.
      for(const [id,a] of Object.entries(section.audio))if(a.status==='playing')delete section.audio[id]
      break
    case 'reveal':downgrade('answers-revealed');break
    case 'audio-start':{
      if(s.status!=='active'||!ids.includes(command.questionId))return {session:input,accepted:false,reason:'not-active-item'}
      const q=paper.questions.find(q=>q.id===command.questionId)
      if(!q?.audioSrc)return {session:input,accepted:false,reason:'not-audio-item'}
      const old=section.audio[q.id]
      if(old?.status==='playing')return {session:input,accepted:false,reason:'audio-already-playing'}
      if(Object.values(section.audio).some(a=>a.status==='playing'))return {session:input,accepted:false,reason:'another-audio-playing'}
      if(old)downgrade('audio-replayed')
      section.audio[q.id]={status:'playing',startedAt:now,plays:(old?.plays??0)+1};event('audio-start');break
    }
    case 'audio-complete':{
      const a=section.audio[command.questionId]
      if(s.status!=='active'||!a||a.status!=='playing')return {session:input,accepted:false,reason:'audio-not-playing'}
      const q=paper.questions.find(q=>q.id===command.questionId),clip=paper.audio.find(c=>c.src===q?.audioSrc)
      if(!clip||now-a.startedAt<Math.ceil(clip.durationSeconds*1000))return {session:input,accepted:false,reason:'audio-not-finished'}
      a.status='complete';a.completedAt=now;event('audio-complete');break
    }
    case 'reload':case 'background':
      if(Object.values(section.audio).some(a=>a.status==='playing'))return interrupt('audio-interrupted')
      event(command.type);break
    case 'audio-failed':
      if(Object.values(section.audio).some(a=>a.status==='playing'))return interrupt('audio-interrupted')
      event('audio-load-failed');break
    case 'foreground':case 'offline':case 'online':event(command.type);break
    case 'tick':break
  }
  return finish(true)
}
