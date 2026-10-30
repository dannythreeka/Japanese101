import 'fake-indexeddb/auto'
import {webcrypto} from 'node:crypto'
import {beforeEach,afterEach,it,expect,vi} from 'vitest'
import {AppDB} from '../db'
import {JourneyRepository} from '../db/journey'
import {MockRepository} from '../db/mock'
import {u02} from '../content/packs/u02'
import {u01} from '../content/packs/u01'
import {fixture} from '../mock/__tests__/fixture'
import {defaultPreferences} from '../db/models'
import {CATALOG_VERSION} from '../economy/catalog'
import {BackupService,parseBackup,sha256} from './service'
import {BACKUP_TABLES,GLOBAL_TABLES,canonical,type BackupEnvelope} from './schema'
let source:AppDB,target:AppDB,exported:BackupEnvelope,text:string,service:BackupService
const profile=(id:string)=>({profile_id:id,name:`匿名${id}`,avatar_emoji:'🦊',created_at:1,last_played:1})
beforeEach(async()=>{
  vi.stubGlobal('crypto',webcrypto)
  source=new AppDB(`backup-source-${crypto.randomUUID()}`);target=new AppDB(`backup-target-${crypto.randomUUID()}`);await source.open();await target.open()
  await source.profiles.bulkPut(['A','B'].map(profile));await source.preferences.put(defaultPreferences('A'))
  await source.pets.put({petId:'A',species:'fox',level:1,xp:10,evolutionStage:0,unlockedCosmetics:[],collection:[],lastPlayed:'2026-10-30T00:00:00Z'})
  const journey=new JourneyRepository(u02,source);await journey.openStudy('A');for(const card of u02.teaching)await journey.teach('A',card.id)
  // Real repository writes in isolated storage; these synthetic test interactions are not human/content review evidence.
  let battle=await journey.startBattle('A')
  while(battle.phase!=='finished'){
    battle=await journey.chooseMove('A',battle.id,'attack');const q=u02.questions.find(q=>q.id===battle.currentQuestionId)!
    battle=await journey.submitTurn('A',battle.id,battle.turn,{answerIds:q.answer,hintUsed:false,audioPlayCount:q.audioPolicy==='required'?1:0,responseMs:500})
    battle=await journey.continueBattle('A',battle.id,battle.turn)
  }
  await journey.reward('A',battle.id);await journey.purchase('A','gear-travel-hat','test-purchase',CATALOG_VERSION);await journey.equip('A','gear-travel-hat',true)
  await journey.startBattle('A') // An unfinished battle must survive the backup too.
  const mock=new MockRepository(fixture('MA'),[u01],source,()=>1800000000000),s=await mock.create('A','mock-A');await mock.dispatch('A',s.id,0,'mock-start',{type:'start'})
  await source.table('progress').put({id:'legacy-only',raw:'unassigned'});await source.migrationBackups.put({id:'historical',createdAt:1,tables:{progress:[{id:'old-row',unknown:'keep'}]},localPreferences:{uiLang:'zh'}})
  exported=await new BackupService(source).export({U02:u02.version},'A');text=JSON.stringify(exported);service=new BackupService(target)
})
afterEach(async()=>{vi.restoreAllMocks();source.close();target.close();await source.delete();await target.delete();vi.unstubAllGlobals()})
it('round trips all owned data, unfinished battle, wallet, equipment, mock and unassigned legacy into an empty database',async()=>{
  const preview=await service.preview(text);expect(preview.players.map(p=>p.replaces)).toEqual([false,false])
  const restored=await service.restore(preview,[]);expect(restored.activeProfileId).toBe('A')
  for(const table of BACKUP_TABLES.filter(t=>!GLOBAL_TABLES.includes(t)))expect(JSON.parse(JSON.stringify(await target.table(table).toArray())),table).toEqual(exported.payload.tables[table])
  expect(await target.table('progress').get('legacy-only')).toEqual({id:'legacy-only',raw:'unassigned'})
  expect((await target.equipment.get('A'))?.slots.head).toBe('gear-travel-hat');expect((await target.coinWallets.get('A'))?.balance).toBe(20)
  expect((await target.mockSessions.get('mock-A'))?.status).toBe('active')
  expect((await new JourneyRepository(u02,target).state('A')).battles.some(b=>b.phase!=='finished')).toBe(true)
  expect((await target.migrationBackups.get(restored.archiveId))?.tables.migrationBackups).toEqual([])
})
it('requires explicit replacement of an existing ID and preserves all other players plus the replaced snapshot',async()=>{
  await target.profiles.bulkPut([profile('A'),profile('C')]);await target.coinWallets.bulkPut([{profileId:'A',balance:7},{profileId:'C',balance:99}])
  const preview=await service.preview(text);expect(preview.players.find(p=>p.id==='A')?.replaces).toBe(true)
  await expect(service.restore(preview,[])).rejects.toThrow('replacement-not-approved');expect((await target.coinWallets.get('A'))?.balance).toBe(7)
  const restored=await service.restore(preview,['A'])
  expect((await target.coinWallets.get('A'))?.balance).toBe(20);expect((await target.coinWallets.get('C'))?.balance).toBe(99)
  expect((await target.migrationBackups.get(restored.archiveId))?.tables.coinWallets).toContainEqual({profileId:'A',balance:7})
})
it('rejects a changed database after preview and a changed file even if its checksum was recomputed',async()=>{
  const preview=await service.preview(text);await target.profiles.put(profile('C'))
  await expect(service.restore(preview,[])).rejects.toThrow('local-data-changed')
  const next=await service.preview(text);next.envelope.payload.tables.profiles[0].name='changed-after-review';next.envelope.sha256=await sha256(canonical(next.envelope.payload))
  await expect(service.restore(next,[])).rejects.toThrow('preview-file-changed');expect(await target.profiles.get('A')).toBeUndefined()
})
it('rejects global session IDs owned by another player rather than stealing their session',async()=>{
  await target.profiles.put(profile('C'));const repo=new MockRepository(fixture('MA'),[u01],target,()=>1800000000000);await repo.create('C','mock-A')
  const preview=await service.preview(text);expect(preview.globalCollisions).toContain('mockSessions:["mock-A"]')
  await expect(service.restore(preview,[])).rejects.toThrow('cross-player-id-collision');expect((await target.mockSessions.get('mock-A'))?.profileId).toBe('C')
})
it('rolls back the archive, profile deletion and every earlier write when a later table fails',async()=>{
  await target.profiles.put({...profile('A'),name:'original'});await target.coinWallets.put({profileId:'A',balance:7})
  const before=await new BackupService(target).export({},'A'),preview=await service.preview(text)
  const put=IDBObjectStore.prototype.put;let fail=true
  vi.spyOn(IDBObjectStore.prototype,'put').mockImplementation(function(this:IDBObjectStore,...args:Parameters<IDBObjectStore['put']>){if(this.name==='mockSessions'&&fail){fail=false;throw new DOMException('simulated quota','QuotaExceededError')}return put.apply(this,args)})
  await expect(service.restore(preview,['A'])).rejects.toThrow('quota')
  expect((await new BackupService(target).export({},'A')).payload.tables).toEqual(before.payload.tables)
  await service.restore(preview,['A']);expect((await target.profiles.get('A'))?.name).toBe('匿名A')
})
it('keeps both conflicting legacy histories and never assigns them to imported children',async()=>{
  await target.table('progress').put({id:'legacy-only',raw:'local-history'})
  await service.restore(await service.preview(text),[])
  expect(await target.table('progress').get('legacy-only')).toEqual({id:'legacy-only',raw:'local-history'})
  const archives=await target.migrationBackups.toArray()
  expect(archives.some(a=>a.id.startsWith('restore-legacy-conflict:')&&a.tables.progress.some(r=>(r as {raw:string}).raw==='unassigned'))).toBe(true)
  expect(await target.playerProgress.count()).toBe(0)
})
it('rejects broken format/hash, duplicate identities, foreign owners, and missing referenced receipts before mutation',async()=>{
  await expect(parseBackup('{broken')).rejects.toThrow('invalid-json')
  await expect(parseBackup(JSON.stringify({...exported,sha256:'0'.repeat(64)}))).rejects.toThrow('checksum-mismatch')
  const duplicate=structuredClone(exported);duplicate.payload.tables.profiles.push(duplicate.payload.tables.profiles[0]);await expect(service.preview(JSON.stringify(duplicate))).rejects.toThrow('duplicate-id')
  const foreign=structuredClone(exported);foreign.payload.tables.coinWallets[0].profileId='outsider';await expect(service.preview(JSON.stringify(foreign))).rejects.toThrow('unknown-player')
  const missing=structuredClone(exported);missing.payload.tables.purchaseReceipts=[];await expect(service.preview(JSON.stringify(missing))).rejects.toThrow('invalid-reference')
  const wrong=structuredClone(exported);wrong.payload.tables.mockSessions[0].sections=[];await expect(service.preview(JSON.stringify(wrong))).rejects.toThrow('invalid-data')
  expect(await target.profiles.count()).toBe(0);expect(await target.migrationBackups.count()).toBe(0)
})
