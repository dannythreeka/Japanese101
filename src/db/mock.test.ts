import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import {beforeEach,afterEach,it,expect,vi} from 'vitest'
import {AppDB,db as globalDB,resetProfileProgress} from './index'
import {MockRepository} from './mock'
import {u01} from '../content/packs/u01'
import {fixture} from '../mock/__tests__/fixture'
const paper=fixture('MA'),epoch=1800000000000
let d:AppDB,repo:MockRepository,now:number
beforeEach(async()=>{
  now=epoch;d=new AppDB(`mock-test-${crypto.randomUUID()}`);await d.open()
  await d.profiles.bulkPut(['A','B'].map(profile_id=>({profile_id,name:profile_id,avatar_emoji:'🦊',created_at:1,last_played:1})))
  repo=new MockRepository(paper,[u01],d,()=>now)
})
afterEach(async()=>{vi.restoreAllMocks();d.close();await d.delete()})
it('keeps one unfinished form per player, rejects cross-player commands and does not create learning or money',async()=>{
  const a=await repo.create('A','first'),same=await repo.create('A','other-id'),b=await repo.create('B','second')
  expect(same.id).toBe(a.id);expect(b.profileId).toBe('B')
  await expect(repo.read('B',a.id)).rejects.toThrow('belong')
  await expect(repo.dispatch('B',a.id,0,'cross',{type:'start'})).rejects.toThrow('belong')
  expect(await d.learningAttempts.count()).toBe(0);expect(await d.coinLedger.count()).toBe(0)
})
it('serializes two tabs, makes repeated command IDs idempotent and rejects changed payloads',async()=>{
  const s=await repo.create('A','exam'),command={type:'start' as const}
  const results=await Promise.all(Array.from({length:10},()=>repo.dispatch('A',s.id,0,'start-once',command)))
  expect(results.filter(r=>!r.replayed)).toHaveLength(1);expect(await d.mockCommandReceipts.count()).toBe(1)
  const active=await repo.read('A',s.id),q=paper.questions[0]
  const race=await Promise.allSettled([repo.dispatch('A',s.id,active.revision,'answer-a',{type:'answer',questionId:q.id,choiceIds:q.answer}),repo.dispatch('A',s.id,active.revision,'answer-b',{type:'answer',questionId:q.id,choiceIds:[q.choices.find(c=>c.id!==q.answer[0])!.id]})])
  expect(race.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(race.filter(r=>r.status==='rejected')).toHaveLength(1)
  await expect(repo.dispatch('A',s.id,0,'start-once',{type:'reveal'})).rejects.toThrow('identity conflict')
  expect(Object.keys((await repo.read('A',s.id)).sections[0].answers)).toHaveLength(1)
})
it('rolls back state and receipt together when storage fails, then safely retries the same command',async()=>{
  const s=await repo.create('A','exam')
  vi.spyOn(d.mockCommandReceipts,'add').mockRejectedValueOnce(new Error('quota fault'))
  await expect(repo.dispatch('A',s.id,0,'start',{type:'start'})).rejects.toThrow('quota')
  expect(await repo.read('A',s.id)).toMatchObject({status:'ready',revision:0});expect(await d.mockCommandReceipts.count()).toBe(0)
  await expect(repo.result('A',s.id)).rejects.toThrow('committed')
  expect((await repo.dispatch('A',s.id,0,'start',{type:'start'})).session.status).toBe('active')
})
it('evaluates deadline at transaction time, persists expiry and never stores a late answer',async()=>{
  const s=await repo.create('A','exam'),active=(await repo.dispatch('A',s.id,0,'start',{type:'start'})).session
  now=active.sections[0].deadlineAt!
  const q=paper.questions[0],late=await repo.dispatch('A',s.id,active.revision,'late',{type:'answer',questionId:q.id,choiceIds:q.answer})
  expect(late.accepted).toBe(false);expect(late.reason).toBe('deadline-reached')
  expect((await repo.read('A',s.id)).sections[0]).toMatchObject({status:'complete',answers:{},completedAt:now})
  expect((await repo.dispatch('A',s.id,active.revision,'late',{type:'answer',questionId:q.id,choiceIds:q.answer})).replayed).toBe(true)
})
it('does not return results before commit, preserves a single final receipt and creates a separate redo',async()=>{
  let s=await repo.create('A','exam')
  for(let n=0;n<3;n++){
    s=(await repo.dispatch('A',s.id,s.revision,`start-${n}`,{type:'start'})).session;now++
    if(n===2){vi.spyOn(d.mockCommandReceipts,'add').mockRejectedValueOnce(new Error('receipt fault'));await expect(repo.dispatch('A',s.id,s.revision,`submit-${n}`,{type:'submit-section'})).rejects.toThrow('receipt');await expect(repo.result('A',s.id)).rejects.toThrow('committed')}
    s=(await repo.dispatch('A',s.id,s.revision,`submit-${n}`,{type:'submit-section'})).session;now++
  }
  expect((await repo.result('A',s.id)).total).toEqual({correct:0,incorrect:0,unanswered:80,total:80})
  const duplicate=await repo.dispatch('A',s.id,s.revision-1,'another-submit',{type:'submit-section'})
  expect(duplicate.reason).toBe('already-submitted');expect(duplicate.session.receiptId).toBe(s.receiptId)
  expect((await repo.create('A','redo')).id).toBe('redo');expect(await d.mockSessions.count()).toBe(2)
})
it('preserves v8 profiles, wallets and old records while adding empty v9 mock tables',async()=>{
  const name=`mock-migration-${crypto.randomUUID()}`,old=new Dexie(name)
  old.version(8).stores({profiles:'profile_id',coinWallets:'profileId',learningAttempts:'id,profileId'})
  await old.open();await old.table('profiles').put({profile_id:'A',name:'Keep me'});await old.table('coinWallets').put({profileId:'A',balance:73});await old.table('learningAttempts').put({id:'historical',profileId:'A',raw:'preserve'});old.close()
  const upgraded=new AppDB(name)
  try{await upgraded.open();expect((await upgraded.profiles.get('A'))?.name).toBe('Keep me');expect((await upgraded.coinWallets.get('A'))?.balance).toBe(73);expect(await upgraded.learningAttempts.get('historical')).toMatchObject({raw:'preserve'});expect(await upgraded.mockSessions.count()).toBe(0);expect(await upgraded.mockCommandReceipts.count()).toBe(0)}finally{upgraded.close();await upgraded.delete()}
})
it('explicit player reset removes only that player mock sessions and receipts',async()=>{
  globalDB.close();await globalDB.delete();await globalDB.open()
  try{
    await globalDB.profiles.bulkPut(['A','B'].map(profile_id=>({profile_id,name:profile_id,avatar_emoji:'🦊',created_at:1,last_played:1})))
    const globalRepo=new MockRepository(paper,[u01],globalDB,()=>now)
    for(const id of ['A','B']){const s=await globalRepo.create(id,id);await globalRepo.dispatch(id,s.id,0,`start-${id}`,{type:'start'})}
    await resetProfileProgress('A',false)
    expect((await globalDB.mockSessions.toArray()).map(s=>s.profileId)).toEqual(['B']);expect((await globalDB.mockCommandReceipts.toArray()).map(s=>s.profileId)).toEqual(['B'])
  }finally{globalDB.close();await globalDB.delete()}
})
