import {expect,type Page} from '@playwright/test'
import type {UnitPack} from '../../src/content/contracts'
export async function records<T>(page:Page,store:string):Promise<T[]>{return page.evaluate(store=>new Promise((resolve,reject)=>{const r=indexedDB.open('Japanese101DB');r.onsuccess=()=>{const db=r.result,tx=db.transaction(store),q=tx.objectStore(store).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);tx.oncomplete=()=>db.close()}}),store)}
/** Test-only queue, in the fresh Playwright browser context. Never creates answers. */
export async function queueQuestions(page:Page,unitId:string,ids:string[]){
  await page.evaluate(({unitId,ids})=>new Promise<void>((resolve,reject)=>{
    const r=indexedDB.open('Japanese101DB');r.onerror=()=>reject(r.error)
    r.onsuccess=()=>{const db=r.result,tx=db.transaction('studyPlans','readwrite'),store=tx.objectStore('studyPlans'),q=store.get(['player',unitId]);q.onsuccess=()=>{if(!q.result){tx.abort();return}store.put({...q.result,questionIds:ids})};tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();reject(tx.error??new Error('Missing study plan'))}}
  }),{unitId,ids})
}
export async function teach(page:Page,pack:UnitPack){
  await page.getByRole('button',{name:'認識新內容',exact:true}).click()
  const nav=page.getByRole('navigation',{name:'認識新內容',exact:true})
  for(let n=0;n<pack.teaching.length;n++){
    await nav.getByRole('button').nth(n).click()
    await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click()
    await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
  }
  await page.getByRole('button',{name:'返回',exact:true}).first().click()
}
export async function play(page:Page){
  await page.getByRole('button',{name:'播放音訊',exact:true}).click()
  await expect(page.getByRole('button',{name:'停止播放',exact:true})).toContainText(/正在播放|播放中/)
  await expect(page.getByRole('button',{name:'播放音訊',exact:true})).toBeVisible({timeout:15000})
}
