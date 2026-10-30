import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
test('parent journey export survives deferred browser dispatch and contains real owned data',async({page})=>{
 await page.addInitScript(()=>{
  const click=HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click=function(){if(this.download.startsWith('Japanese101-journey-')){setTimeout(click.bind(this),100);return}click.call(this)}
 })
 await page.goto('/#/parent');for(const d of '1234')await page.getByRole('button',{name:d,exact:true}).click()
 await expect(page.getByRole('button',{name:'匯出這位玩家的冒險紀錄',exact:true})).toBeVisible()
 const downloading=page.waitForEvent('download',{timeout:10000})
 await page.getByRole('button',{name:'匯出這位玩家的冒險紀錄',exact:true}).click()
 const file=await downloading;expect(await file.failure()).toBeNull()
 const saved=JSON.parse(await readFile((await file.path())!,'utf8'))
 expect(saved.version).toBe('journey-backup-v1');expect(saved.profileId).toBe('player');expect(saved.data.attempts).toEqual([])
 await expect(page.locator('a[download][hidden]')).toHaveCount(0)
})

test('full and preserved legacy exports keep valid JSON when browser dispatch is deferred',async({page})=>{
 await page.addInitScript(()=>{
  const click=HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click=function(){if(this.download.startsWith('Japanese101-')){setTimeout(click.bind(this),100);return}click.call(this)}
 })
 await page.goto('/#/parent');for(const d of '1234')await page.getByRole('button',{name:d,exact:true}).click()
 await expect(page.getByRole('button',{name:'匯出完整備份',exact:true})).toBeVisible()
 await page.evaluate(()=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open('Japanese101DB');r.onsuccess=()=>{const d=r.result,t=d.transaction('migrationBackups','readwrite');t.objectStore('migrationBackups').put({id:'pre-v5',createdAt:1,tables:{progress:[{id:'isolated-legacy-download',correct:3}]},localPreferences:{}});t.oncomplete=()=>{d.close();resolve()};t.onabort=()=>reject(t.error)}}))
 const fullEvent=page.waitForEvent('download',{timeout:10000});await page.getByRole('button',{name:'匯出完整備份',exact:true}).click();const full=await fullEvent
 expect(await full.failure()).toBeNull();const saved=JSON.parse(await readFile((await full.path())!,'utf8'))
 expect(saved.payload.format).toBe('japanese101-backup-v1');expect(saved.payload.tables.migrationBackups.some((r:{id:string})=>r.id==='pre-v5')).toBe(true)
 const legacyEvent=page.waitForEvent('download',{timeout:10000});await page.getByRole('button',{name:'匯出舊版共用備份',exact:true}).click();const legacy=await legacyEvent
 expect(await legacy.failure()).toBeNull();const old=JSON.parse(await readFile((await legacy.path())!,'utf8'))
 expect(old.tables.progress).toEqual([{id:'isolated-legacy-download',correct:3}])
 await expect(page.locator('a[download][hidden]')).toHaveCount(0)
})
