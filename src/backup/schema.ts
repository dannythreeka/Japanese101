import {attemptErrors} from '../content/contracts'
import {MOCK_SECTIONS} from '../mock/blueprint'

export type Row=Record<string,unknown>
export const TABLE_KEYS={
  profiles:['profile_id'],pets:['petId'],adventureProgress:['id'],playerProgress:['profileId','id'],playerSessions:['id'],preferences:['profileId'],wallets:['profileId'],gameCheckpoints:['id'],levelSessions:['id'],rewardReceipts:['id'],dailyClaims:['profileId','date','taskId'],
  learningAttempts:['id'],worldCheckpoints:['profileId'],studyPlans:['profileId','unitId'],skillReviews:['profileId','skillId'],battleSessions:['id'],coinWallets:['profileId'],coinLedger:['id'],inventory:['profileId','itemId'],equipment:['profileId'],purchaseReceipts:['id'],firstWins:['profileId','challengeId'],learningChecks:['id'],mockSessions:['id'],mockCommandReceipts:['id'],catalogVersions:['id'],migrationBackups:['id'],progress:['id'],sessions:['id'],
} as const
export type BackupTable=keyof typeof TABLE_KEYS
export const BACKUP_TABLES=Object.keys(TABLE_KEYS) as BackupTable[]
export const GLOBAL_TABLES:readonly BackupTable[]=['catalogVersions','migrationBackups','progress','sessions']
export const ownerKey=(table:BackupTable)=>table==='profiles'?'profile_id':table==='pets'?'petId':table==='adventureProgress'?'id':GLOBAL_TABLES.includes(table)?null:'profileId'
export const rowKey=(table:BackupTable,row:Row)=>JSON.stringify(TABLE_KEYS[table].map(k=>row[k]))
export interface BackupPayload {format:'japanese101-backup-v1';schemaVersion:9;exportedAt:number;contentVersions:Record<string,string>;activeProfileId:string|null;tables:Record<BackupTable,Row[]>}
export interface BackupEnvelope {payload:BackupPayload;sha256:string}
export class BackupError extends Error {readonly code:string;constructor(code:string,detail=''){super(detail?`${code}: ${detail}`:code);this.code=code}}
export const object=(v:unknown):v is Row=>!!v&&typeof v==='object'&&!Array.isArray(v)
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=1000
const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0
const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(text)
const one=(v:unknown,values:readonly unknown[])=>values.includes(v)
const all=(row:Row,keys:string[],check:(v:unknown)=>boolean)=>keys.every(k=>check(row[k]))
const optional=(r:Row,k:string,check:(v:unknown)=>boolean)=>r[k]===undefined||check(r[k])
const boolean=(v:unknown)=>typeof v==='boolean'
const dict=(v:unknown,check:(v:unknown)=>boolean)=>object(v)&&Object.values(v).every(check)
const day=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))
const zone=(v:unknown)=>{try{if(!text(v))return false;new Intl.DateTimeFormat('en',{timeZone:v}).format(0);return true}catch{return false}}

/** Canonical JSON rejects non-JSON values and prototype keys before any database mutation. */
export function canonical(value:unknown,depth=0):string{
  if(depth>70)throw new BackupError('invalid-data','nesting limit')
  if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value)
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value)
  if(Array.isArray(value))return `[${value.map(v=>canonical(v,depth+1)).join(',')}]`
  if(object(value))return `{${Object.keys(value).sort().map(k=>{if(['__proto__','prototype','constructor'].includes(k))throw new BackupError('invalid-data','unsafe key');return `${JSON.stringify(k)}:${canonical(value[k],depth+1)}`}).join(',')}}`
  throw new BackupError('invalid-data','non-JSON value')
}
function mockSessionValid(r:Row):boolean{
  if(!all(r,['id','profileId','paperId','paperVersion','rulesVersion'],text)||!all(r,['revision','sectionIndex','createdAt','updatedAt','lastObservedAt'],integer)||!one(r.mode,['standard','preview','practice'])||!one(r.status,['ready','active','paused','interrupted','submitted'])||!strings(r.exclusions)||!Array.isArray(r.events)||!Array.isArray(r.sections)||r.sections.length!==3||Number(r.sectionIndex)>2)return false
  if(!r.events.every(e=>object(e)&&text(e.kind)&&integer(e.at)&&MOCK_SECTIONS.some(s=>s.id===e.section)))return false
  for(let n=0;n<3;n++){
    const s=r.sections[n]
    if(!object(s)||s.id!==MOCK_SECTIONS[n].id||!one(s.status,['ready','active','paused','complete'])||!['startedAt','deadlineAt','completedAt','remainingMs'].every(k=>optional(s,k,integer))||!object(s.answers)||!object(s.audio))return false
    if(s.status!=='ready'&&(!integer(s.startedAt)||!integer(s.deadlineAt)))return false
    if(s.status==='complete'&&(!integer(s.completedAt)||Number(s.completedAt)<Number(s.startedAt)))return false
    if(!Object.entries(s.answers).every(([id,a])=>object(a)&&a.questionId===id&&strings(a.choiceIds)&&a.choiceIds.length>0&&new Set(a.choiceIds).size===a.choiceIds.length&&integer(a.savedAt)&&Number(a.savedAt)>=Number(s.startedAt)&&Number(a.savedAt)<=Number(s.completedAt??s.deadlineAt)))return false
    if(!Object.values(s.audio).every(a=>object(a)&&one(a.status,['playing','complete'])&&integer(a.startedAt)&&integer(a.plays)&&Number(a.plays)>0&&(a.status!=='complete'||integer(a.completedAt)&&Number(a.completedAt)>=Number(a.startedAt))))return false
  }
  if(r.status==='submitted'&&(!integer(r.submittedAt)||r.receiptId!==`mock-submit:${r.id}`||!r.sections.every(s=>object(s)&&s.status==='complete')))return false
  return true
}
function validRow(table:BackupTable,r:Row):boolean{
  switch(table){
    case 'profiles':return all(r,['name','avatar_emoji'],text)&&all(r,['created_at','last_played'],integer)
    case 'pets':return one(r.species,['fox','cat','dragon'])&&all(r,['level','xp','evolutionStage'],integer)&&strings(r.unlockedCosmetics)&&strings(r.collection)&&text(r.lastPlayed)&&Number.isFinite(Date.parse(r.lastPlayed))
    case 'adventureProgress':return text(r.current_level_id)&&strings(r.unlocked_regions)&&strings(r.collected_medals)&&dict(r.completed_levels,v=>object(v)&&text(v.completed_at)&&one(v.stars,[1,2,3])&&finite(v.best_accuracy)&&Number(v.best_accuracy)>=0&&Number(v.best_accuracy)<=1&&integer(v.times_played))
    case 'playerProgress':return one(r.type,['kana','vocab'])&&all(r,['correct','incorrect','lastSeen','nextReview','streak'],integer)
    case 'playerSessions':return all(r,['date','durationMs','correct','total'],integer)&&Number(r.correct)<=Number(r.total)&&text(r.feature)&&optional(r,'completionRate',v=>finite(v)&&Number(v)>=0&&Number(v)<=1)
    case 'preferences':return one(r.kanaMode,['hiragana','katakana','both'])&&one(r.kanaDifficulty,[1,2,3,'all'])&&one(r.ageMode,['young','advanced'])&&one(r.micMode,['off','offline','enhanced'])&&boolean(r.enhancedConsent)&&one(r.uiLang,['zh','ja'])&&strings(r.disabledUnits)&&boolean(r.sfxEnabled)&&finite(r.sfxVolume)&&Number(r.sfxVolume)>=0&&Number(r.sfxVolume)<=1&&one(r.writeDifficulty,[1,2,3])&&(r.micMode!=='enhanced'||r.enhancedConsent===true)
    case 'wallets':return finite(r.stars)&&Number(r.stars)>=0
    case 'gameCheckpoints':return all(r,['feature','routeKey','contentVersion'],text)&&all(r,['startedAt','updatedAt','planned'],integer)&&one(r.status,['active','finished','abandoned'])&&object(r.checkpoint)&&dict(r.attempts,a=>object(a)&&all(a,['questionInstanceId','itemId'],text)&&(a.firstAnswerCorrect===null||boolean(a.firstAnswerCorrect))&&all(a,['hintUsed','completed','skipped'],boolean)&&integer(a.retryCount))
    case 'levelSessions':return all(r,['levelId','contentVersion'],text)&&all(r,['startedAt','updatedAt'],integer)&&one(r.status,['active','completed'])&&(r.pending===null||object(r.pending)&&all(r.pending,['challengeId','gameMode'],text)&&object(r.pending.configOverrides))&&dict(r.results,v=>object(v)&&finite(v.accuracy)&&Number(v.accuracy)>=0&&Number(v.accuracy)<=1&&finite(v.xpGained)&&Number(v.xpGained)>=0)
    case 'rewardReceipts':return all(r,['xp','stars','createdAt'],integer)
    case 'dailyClaims':return day(r.date)&&text(r.taskId)
    case 'learningAttempts':return attemptErrors(r).length===0
    case 'worldCheckpoints':return all(r,['mapId','worldVersion'],text)&&object(r.position)&&all(r.position,['x','y'],finite)&&one(r.facing,['up','down','left','right'])&&strings(r.storyFlags)&&integer(r.updatedAt)
    case 'studyPlans':return all(r,['unitId','contentVersion'],text)&&strings(r.taughtCards)&&new Set(r.taughtCards).size===r.taughtCards.length&&dict(r.taughtAt,integer)&&day(r.date)&&zone(r.timeZone)&&one(r.gradeBand,[1,2,3])&&strings(r.questionIds)&&integer(r.updatedAt)&&optional(r,'onboarding',o=>object(o)&&one(o.comfort,['new','some','review'])&&boolean(o.skipped)&&integer(o.updatedAt))
    case 'skillReviews':return all(r,['skillId','lastAttemptId'],text)&&integer(r.level)&&day(r.dueDate)&&zone(r.timeZone)&&optional(r,'learningVersion',text)
    case 'battleSessions':return all(r,['challengeId','unitId','contentVersion','rulesVersion'],text)&&all(r,['createdAt','updatedAt','playerHp','enemyHp','turn'],integer)&&Number(r.turn)>=1&&one(r.phase,['choosing','question','feedback','finished'])&&one(r.status,['active','won','lost','retreated'])&&boolean(r.partnerUsed)&&strings(r.questionIds)&&r.questionIds.length>0&&strings(r.loadoutSnapshot)&&optional(r,'move',v=>one(v,['attack','guard','partner']))&&optional(r,'currentQuestionId',text)&&optional(r,'lastAttemptId',text)
    case 'coinWallets':return integer(r.balance)
    case 'coinLedger':return one(r.kind,['reward','purchase'])&&Number.isSafeInteger(r.amount)&&integer(r.balanceAfter)&&integer(r.createdAt)&&(r.kind==='reward'?text(r.battleId)&&Number(r.amount)>=0:text(r.purchaseId)&&Number(r.amount)<=0)
    case 'inventory':return text(r.itemId)&&text(r.purchaseId)&&integer(r.acquiredAt)
    case 'equipment':return object(r.slots)&&Object.entries(r.slots).every(([k,v])=>['head','back','neck'].includes(k)&&text(v))
    case 'purchaseReceipts':return all(r,['itemId','catalogVersion'],text)&&all(r,['price','createdAt'],integer)
    case 'firstWins':return all(r,['challengeId','battleId'],text)
    case 'learningChecks':return all(r,['unitId','contentVersion'],text)&&strings(r.questionIds)&&r.questionIds.length>0&&all(r,['index','createdAt','updatedAt'],integer)&&Number(r.index)<r.questionIds.length&&one(r.phase,['question','acknowledge','review','finished'])&&optional(r,'purpose',v=>v==='kana-placement')&&optional(r,'group',integer)
    case 'mockSessions':return mockSessionValid(r)
    case 'mockCommandReceipts':return all(r,['sessionId','fingerprint'],text)&&boolean(r.accepted)&&all(r,['revision','createdAt'],integer)&&optional(r,'reason',text)
    case 'catalogVersions':return r.id==='active'&&text(r.version)&&integer(r.revision)
    case 'migrationBackups':return integer(r.createdAt)&&dict(r.tables,v=>Array.isArray(v)&&v.every(object))&&object(r.tables)&&Object.keys(r.tables).every(t=>BACKUP_TABLES.includes(t as BackupTable))&&dict(r.localPreferences,v=>typeof v==='string')
    case 'progress':case 'sessions':return true // Inert legacy-shared rows are preserved, never assigned or promoted.
  }
}
export function validateBackupPayload(input:unknown):BackupPayload{
  canonical(input)
  if(!object(input)||input.format!=='japanese101-backup-v1'||input.schemaVersion!==9)throw new BackupError('unsupported-format')
  if(!integer(input.exportedAt)||!dict(input.contentVersions,text)||!(input.activeProfileId===null||text(input.activeProfileId))||!object(input.tables))throw new BackupError('invalid-data','header')
  const tables=input.tables
  if(Object.keys(tables).length!==BACKUP_TABLES.length||Object.keys(tables).some(t=>!BACKUP_TABLES.includes(t as BackupTable)))throw new BackupError('invalid-data','table list')
  let total=0
  for(const table of BACKUP_TABLES){
    const rows=tables[table]
    if(!Array.isArray(rows)||!rows.every(object)||(total+=rows.length)>100000)throw new BackupError('invalid-data',table)
    const keys=new Set<string>()
    for(const row of rows){
      if(!TABLE_KEYS[table].every(k=>text(row[k]))||!validRow(table,row))throw new BackupError('invalid-data',table)
      const key=rowKey(table,row);if(keys.has(key))throw new BackupError('duplicate-id',table);keys.add(key)
    }
  }
  const result=input as unknown as BackupPayload,profiles=new Set(result.tables.profiles.map(p=>p.profile_id))
  if(input.activeProfileId!==null&&!profiles.has(input.activeProfileId))throw new BackupError('unknown-player','activeProfileId')
  for(const table of BACKUP_TABLES){const owner=ownerKey(table);if(owner)for(const row of result.tables[table])if(!profiles.has(row[owner]))throw new BackupError('unknown-player',table)}
  const references:[BackupTable,string,BackupTable][]=[['inventory','purchaseId','purchaseReceipts'],['firstWins','battleId','battleSessions'],['mockCommandReceipts','sessionId','mockSessions']]
  for(const [from,field,to] of references){const target=new Map(result.tables[to].map(r=>[r.id,r]));for(const row of result.tables[from]){const ref=target.get(row[field]);if(!ref||ref.profileId!==row.profileId)throw new BackupError('invalid-reference',`${from}.${field}`)}}
  for(const equipment of result.tables.equipment)for(const item of Object.values(equipment.slots as Row))if(!result.tables.inventory.some(r=>r.profileId===equipment.profileId&&r.itemId===item))throw new BackupError('invalid-reference','equipment')
  for(const row of result.tables.coinLedger){const table=row.kind==='reward'?'battleSessions':'purchaseReceipts',id=row.kind==='reward'?row.battleId:row.purchaseId;if(!result.tables[table].some(r=>r.id===id&&r.profileId===row.profileId))throw new BackupError('invalid-reference','coinLedger')}
  return result
}
