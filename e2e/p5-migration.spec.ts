import {test,expect} from '@playwright/test'
import {records} from './helpers/unitJourney'
// Frozen v8 schema from 4d928cc. No application code runs until the real browser has seeded it.
const v8:Record<string,string>={
  progress:'id, type, nextReview, lastSeen',sessions:'id, date, feature',pets:'petId',adventureProgress:'id',profiles:'profile_id, created_at',
  playerProgress:'[profileId+id], profileId, [profileId+nextReview]',playerSessions:'id, profileId, [profileId+date]',preferences:'profileId',wallets:'profileId',gameCheckpoints:'id, profileId, [profileId+routeKey], status',levelSessions:'id, profileId, [profileId+levelId], status',rewardReceipts:'id, profileId',dailyClaims:'[profileId+date+taskId], profileId',migrationBackups:'id',
  learningAttempts:'id, profileId, [profileId+primarySkillId], sessionId',worldCheckpoints:'profileId',studyPlans:'[profileId+unitId], profileId',skillReviews:'[profileId+skillId], profileId, [profileId+dueDate]',battleSessions:'id, profileId, [profileId+challengeId], status',coinWallets:'profileId',coinLedger:'id, profileId',inventory:'[profileId+itemId], profileId',equipment:'profileId',purchaseReceipts:'id, profileId',firstWins:'[profileId+challengeId], profileId',learningChecks:'id, profileId, [profileId+unitId]',catalogVersions:'id',
}
test('real browser v8 to v9 upgrade preserves legacy/player money and adds empty mock storage',async({page})=>{
  await page.route('**/__empty',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated migration fixture</title>'}))
  await page.goto('/__empty')
  await page.evaluate(schema=>new Promise<void>((resolve,reject)=>{
    const r=indexedDB.open('Japanese101DB',80)
    r.onerror=()=>reject(r.error)
    r.onupgradeneeded=()=>{
      const key=(value:string)=>value.startsWith('[')?value.slice(1,-1).split('+'):value
      for(const [name,definition] of Object.entries(schema)){
        const [primary,...indexes]=definition.split(',').map(s=>s.trim()),store=r.result.createObjectStore(name,{keyPath:key(primary)})
        for(const index of indexes)store.createIndex(index,key(index))
      }
    }
    r.onsuccess=()=>{
      const db=r.result,tx=db.transaction(['profiles','coinWallets','progress'],'readwrite')
      tx.objectStore('profiles').put({profile_id:'player',name:'隔離升級測試',avatar_emoji:'🦊',created_at:1,last_played:1})
      tx.objectStore('coinWallets').put({profileId:'player',balance:47})
      tx.objectStore('progress').put({id:'unassigned-history',type:'kana',raw:'preserve-legacy'})
      tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>reject(tx.error)
    }
  }),v8)
  await page.goto('/#/preview/adventure?unit=U05&scene=dojo')
  await expect(page.locator('header small')).toHaveText('隔離升級測試')
  await expect(page.getByText('金幣 47',{exact:true})).toBeVisible()
  expect(await records(page,'progress')).toEqual([{id:'unassigned-history',type:'kana',raw:'preserve-legacy'}])
  expect(await records(page,'mockSessions')).toEqual([]);expect(await records(page,'mockCommandReceipts')).toEqual([])
  await page.getByRole('button',{name:'認識新內容',exact:true}).click()
  await expect(page.getByRole('heading',{name:'介紹自己的家人',exact:true})).toBeVisible()
  await page.reload();await expect(page.locator('header small')).toHaveText('隔離升級測試')
  expect(await records(page,'coinWallets')).toEqual([{profileId:'player',balance:47}])
})
