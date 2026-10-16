import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, expect, it } from 'vitest'
import { AppDB } from './index'
const names:string[]=[]
afterEach(async()=>{for(const name of names.splice(0))await Dexie.delete(name)})
async function legacy() {
  const name=`journey-upgrade-${crypto.randomUUID()}`;names.push(name)
  const old=new Dexie(name)
  old.version(5).stores({progress:'id',sessions:'id',pets:'petId',adventureProgress:'id',profiles:'profile_id',playerProgress:'[profileId+id], profileId',playerSessions:'id, profileId',preferences:'profileId',wallets:'profileId',gameCheckpoints:'id, profileId',levelSessions:'id, profileId',rewardReceipts:'id, profileId',dailyClaims:'[profileId+date+taskId], profileId',migrationBackups:'id'})
  await old.open()
  await old.table('profiles').put({profile_id:'A',name:'keep',created_at:1,last_played:1,avatar_emoji:'🦊'})
  await old.table('playerProgress').put({profileId:'A',id:'kana-a',correct:3})
  await old.table('wallets').put({profileId:'A',stars:99})
  await old.table('pets').put({petId:'A',species:'fox',xp:123})
  await old.table('progress').put({id:'shared',original:'must remain'})
  old.close();return name
}
it('v5→v6 backs up exact original player data and never converts stars or pet XP to coins',async()=>{
  const name=await legacy();const next=new AppDB(name);await next.open()
  expect((await next.migrationBackups.get('pre-v6'))?.tables.wallets).toEqual([{profileId:'A',stars:99}])
  expect((await next.wallets.get('A'))?.stars).toBe(99)
  expect((await next.pets.get('A'))?.xp).toBe(123)
  expect(await next.progress.get('shared')).toMatchObject({original:'must remain'})
  expect(await next.coinWallets.count()).toBe(0)
  expect(await next.learningAttempts.count()).toBe(0)
  next.close();await next.open()
  expect((await next.migrationBackups.get('pre-v6'))?.tables.playerProgress).toEqual([{profileId:'A',id:'kana-a',correct:3}])
  next.close()
})
it('failed v6 backup leaves the v5 schema and original player records intact',async()=>{
  const name=await legacy();const next=new AppDB(name)
  next.migrationBackups.hook('creating',()=>{throw new DOMException('quota fault','QuotaExceededError')})
  await expect(next.open()).rejects.toBeDefined();next.close()
  const recovered=new Dexie(name);await recovered.open()
  expect(recovered.verno).toBe(5)
  expect(await recovered.table('wallets').get('A')).toEqual({profileId:'A',stars:99})
  expect(await recovered.table('playerProgress').get(['A','kana-a'])).toMatchObject({correct:3})
  recovered.close()
})
