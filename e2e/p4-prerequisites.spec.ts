import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import {records} from './helpers/unitJourney'
import type {UnitPack} from '../src/content/contracts'

for(const unit of ['U01','U06'])test(`${unit} genuine old UI save upgrades without changing answers, money or equipment`,async({page})=>{
 const fixture=JSON.parse(await readFile(`docs/phases/P4/evidence/prerequisite-${unit.toLowerCase()}-old.json`,'utf8'))
 const pack=JSON.parse(await readFile(`src/content/packs/${unit.toLowerCase()}.json`,'utf8')) as UnitPack
 expect(fixture.provenance.build.sha).toBe('d35221c850d92c3b41a1010d2fadba3617e24ec6')
 expect(pack.version).not.toBe(fixture.provenance.contentVersion)
 // Only the fresh, isolated Playwright context receives the frozen QA backup.
 await page.goto('/#/parent');await expect(page.getByRole('button',{name:'1',exact:true})).toBeVisible()
 await page.evaluate(tables=>new Promise<void>((resolve,reject)=>{
  const r=indexedDB.open('Japanese101DB');r.onerror=()=>reject(r.error)
  r.onsuccess=()=>{const db=r.result,tx=db.transaction(Object.keys(tables),'readwrite')
   for(const [name,rows] of Object.entries(tables)){const store=tx.objectStore(name);store.clear();for(const row of rows as object[])store.put(row)}
   tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();reject(tx.error)}
  }
 }),fixture.backup.payload.tables)
 await page.goto(`/#/preview/adventure?unit=${unit}&scene=dojo`)
 await expect(page.getByText('內容已更新，先保留原紀錄再重新開始。',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'繼續冒險',exact:true}).click()
 await expect(page.getByRole('button',{name:'地點清單',exact:true})).toBeVisible()
 const original=fixture.backup.payload.tables
 for(const table of ['learningAttempts','coinWallets','coinLedger','inventory','equipment','purchaseReceipts','firstWins','skillReviews'])expect(await records(page,table)).toEqual(original[table])
 const plans=await records<{unitId:string;contentVersion:string;taughtCards:string[]}>(page,'studyPlans')
 expect(plans.find(p=>p.unitId===unit)).toMatchObject({contentVersion:pack.version,taughtCards:[]})
 const oldActive=original.battleSessions.find((b:{phase:string})=>b.phase!=='finished')
 const battles=await records<{id:string}>(page,'battleSessions')
 expect(battles.find(b=>b.id===oldActive.id)).toMatchObject({status:'retreated',phase:'finished',endReason:'version-recovery'})
 const oldWon=original.battleSessions.find((b:{status:string})=>b.status==='won')
 expect(battles.find(b=>b.id===oldWon.id)).toEqual(oldWon)
 const archives=await records<{tables:{studyPlans?:unknown[];battleSessions?:unknown[]}}>(page,'migrationBackups')
 expect(archives.some(a=>JSON.stringify(a.tables.studyPlans)===JSON.stringify(original.studyPlans)&&JSON.stringify(a.tables.battleSessions)===JSON.stringify([oldActive]))).toBe(true)
 await page.reload();await expect(page.getByRole('button',{name:'地點清單',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual(original.learningAttempts)
 expect(await records(page,'migrationBackups')).toEqual(archives)
})

test('U01 grammar three cannot be acknowledged before grammar two',async({page})=>{
 const pack=JSON.parse(await readFile('src/content/packs/u01.json','utf8')) as UnitPack
 await page.goto('/#/preview/adventure?scene=dojo')
 await page.getByRole('button',{name:'認識新內容',exact:true}).click()
 const nav=page.getByRole('navigation',{name:'認識新內容',exact:true})
 const g2=pack.teaching.findIndex(c=>c.grammarIds?.includes('G02'))
 const g3=pack.teaching.findIndex(c=>c.grammarIds?.includes('G03'))
 for(let n=0;n<g2;n++){
  await nav.getByRole('button').nth(n).click();await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click()
  await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
 }
 await nav.getByRole('button').nth(g3).click()
 await expect(page.getByRole('button',{name:'讀過了，記在手帳',exact:true})).toBeDisabled()
 await nav.getByRole('button').nth(g2).click();await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click()
 await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
 await nav.getByRole('button').nth(g3).click();await expect(page.getByRole('button',{name:'讀過了，記在手帳',exact:true})).toBeEnabled()
 await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click();await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual([])
})
