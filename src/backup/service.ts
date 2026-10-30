import {AppDB,db as defaultDB} from '../db'
import {CATALOG_VERSION,CATALOG_REVISION} from '../economy/catalog'
import {BACKUP_TABLES,GLOBAL_TABLES,TABLE_KEYS,BackupError,canonical,object,ownerKey,rowKey,validateBackupPayload,type BackupEnvelope,type BackupPayload,type BackupTable,type Row} from './schema'
const MAX_BYTES=25*1024*1024
export interface RestorePreview {
  envelope:BackupEnvelope;localFingerprint:string
  players:{id:string;name:string;currentName?:string;replaces:boolean;records:number}[]
  legacySharedRecords:number;archiveRecords:number;globalCollisions:string[]
}
export async function sha256(value:string):Promise<string>{return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('')}
export async function parseBackup(text:string):Promise<BackupEnvelope>{
  if(new TextEncoder().encode(text).length>MAX_BYTES)throw new BackupError('file-too-large')
  let input:unknown
  try{input=JSON.parse(text)}catch{throw new BackupError('invalid-json')}
  if(!object(input)||typeof input.sha256!=='string'||!/^[a-f0-9]{64}$/.test(input.sha256))throw new BackupError('unsupported-format')
  const payload=validateBackupPayload(input.payload)
  if(await sha256(canonical(payload))!==input.sha256)throw new BackupError('checksum-mismatch')
  return {payload,sha256:input.sha256}
}
/** JSON round-trip mirrors a downloaded backup and removes optional undefined properties, never reads browser credentials. */
async function snapshot(db:AppDB):Promise<BackupPayload['tables']>{
  const entries=await Promise.all(BACKUP_TABLES.map(async name=>[name,await db.table(name).toArray()] as const))
  return JSON.parse(JSON.stringify(Object.fromEntries(entries))) as BackupPayload['tables']
}
function collisionList(local:BackupPayload['tables'],incoming:BackupPayload['tables']):string[]{
  const collisions:string[]=[]
  for(const table of BACKUP_TABLES){
    const owner=ownerKey(table);if(!owner||TABLE_KEYS[table].length!==1)continue
    const keys=new Map(local[table].map(row=>[rowKey(table,row),row]))
    for(const row of incoming[table]){const old=keys.get(rowKey(table,row));if(old&&old[owner]!==row[owner])collisions.push(`${table}:${rowKey(table,row)}`)}
  }
  return collisions
}
export class BackupService {
  private readonly database:AppDB
  private readonly previews=new WeakMap<RestorePreview,{sha256:string;localFingerprint:string}>()
  constructor(database:AppDB=defaultDB){this.database=database}
  async export(contentVersions:Record<string,string>,activeProfileId:string|null):Promise<BackupEnvelope>{
    const d=this.database,tables=await d.transaction('r',BACKUP_TABLES.map(n=>d.table(n)),()=>snapshot(d))
    const payload=validateBackupPayload({format:'japanese101-backup-v1',schemaVersion:9,exportedAt:Date.now(),contentVersions,activeProfileId:tables.profiles.some(p=>p.profile_id===activeProfileId)?activeProfileId:null,tables})
    return {payload,sha256:await sha256(canonical(payload))}
  }
  async preview(text:string):Promise<RestorePreview>{
    const envelope=await parseBackup(text),d=this.database,local=await d.transaction('r',BACKUP_TABLES.map(n=>d.table(n)),()=>snapshot(d))
    const incoming=envelope.payload.tables
    const preview={envelope,localFingerprint:canonical(local),players:incoming.profiles.map(p=>{
      const current=local.profiles.find(old=>old.profile_id===p.profile_id)
      return {id:String(p.profile_id),name:String(p.name),currentName:current?String(current.name):undefined,replaces:!!current,records:BACKUP_TABLES.reduce((n,t)=>{const owner=ownerKey(t);return n+(owner?incoming[t].filter(r=>r[owner]===p.profile_id).length:0)},0)}
    }),legacySharedRecords:incoming.progress.length+incoming.sessions.length,archiveRecords:incoming.migrationBackups.length,globalCollisions:collisionList(local,incoming)}
    this.previews.set(preview,{sha256:envelope.sha256,localFingerprint:preview.localFingerprint})
    return preview
  }
  async restore(preview:RestorePreview,replaceProfileIds:readonly string[]):Promise<{profileIds:string[];activeProfileId:string|null;archiveId:string}>{
    // Revalidate the concrete reviewed file, so a caller cannot edit the preview payload after validation.
    const issued=this.previews.get(preview)
    if(!issued)throw new BackupError('preview-expired')
    const envelope=await parseBackup(JSON.stringify(preview.envelope)),d=this.database
    if(envelope.sha256!==issued.sha256)throw new BackupError('preview-file-changed')
    const expectedFingerprint=issued.localFingerprint,approved=new Set(replaceProfileIds)
    return d.transaction('rw',BACKUP_TABLES.map(n=>d.table(n)),async()=>{
      const local=await snapshot(d),incoming=envelope.payload.tables
      if(canonical(local)!==expectedFingerprint)throw new BackupError('local-data-changed')
      const profileIds=incoming.profiles.map(p=>String(p.profile_id)),targets=new Set(profileIds)
      const conflicts=profileIds.filter(id=>local.profiles.some(p=>p.profile_id===id))
      if(conflicts.some(id=>!approved.has(id))||[...approved].some(id=>!conflicts.includes(id)))throw new BackupError('replacement-not-approved')
      if(collisionList(local,incoming).length)throw new BackupError('cross-player-id-collision')
      const archiveId=`restore-before:${crypto.randomUUID()}`
      // The previous data is saved in the SAME transaction as replacement, so a later failure rolls both back.
      await d.migrationBackups.add({id:archiveId,createdAt:Date.now(),tables:{...local,migrationBackups:[]},localPreferences:{}})
      for(const table of BACKUP_TABLES){
        if(GLOBAL_TABLES.includes(table))continue
        const owner=ownerKey(table)!
        for(const row of local[table].filter(r=>targets.has(String(r[owner])))){
          const values=TABLE_KEYS[table].map(key=>row[key])
          await d.table(table).delete((values.length===1?values[0]:values) as string|string[])
        }
        if(incoming[table].length)await d.table(table).bulkPut(incoming[table])
      }
      // Keep unassignable legacy data inert. Conflicting records are archived rather than overwriting either history.
      const legacyConflicts:Partial<Record<BackupTable,Row[]>>={}
      for(const table of ['progress','sessions'] as const){
        const old=new Map(local[table].map(r=>[rowKey(table,r),r]))
        for(const row of incoming[table]){
          const present=old.get(rowKey(table,row))
          if(!present)await d.table(table).add(row)
          else if(canonical(present)!==canonical(row))(legacyConflicts[table]??=[]).push(row)
        }
      }
      if(Object.keys(legacyConflicts).length)await d.migrationBackups.add({id:`restore-legacy-conflict:${crypto.randomUUID()}`,createdAt:Date.now(),tables:legacyConflicts,localPreferences:{}})
      for(const archive of incoming.migrationBackups){
        const existing=await d.migrationBackups.get(String(archive.id))
        if(!existing)await d.table('migrationBackups').add(archive)
        else if(canonical(JSON.parse(JSON.stringify(existing)))!==canonical(archive))await d.table('migrationBackups').add({...archive,id:`restore-archive:${crypto.randomUUID()}`,originalArchiveId:archive.id})
      }
      // Catalog policy belongs to this installed app. Preserve old metadata in an archive, not as current prices.
      if(!local.catalogVersions.length)await d.catalogVersions.put({id:'active',version:CATALOG_VERSION,revision:CATALOG_REVISION})
      if(canonical(local.catalogVersions)!==canonical(incoming.catalogVersions)&&incoming.catalogVersions.length)await d.migrationBackups.add({id:`restore-catalog:${crypto.randomUUID()}`,createdAt:Date.now(),tables:{catalogVersions:incoming.catalogVersions},localPreferences:{}})
      return {profileIds,activeProfileId:envelope.payload.activeProfileId??profileIds[0]??null,archiveId}
    })
  }
}
