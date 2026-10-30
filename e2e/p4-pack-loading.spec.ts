import {writeFile} from 'node:fs/promises'
import {test,expect} from '@playwright/test'
import {records} from './helpers/unitJourney'
const unitFile=/\/assets\/u\d{2}-[^/]+\.js$/
test('opening U06 loads only its content; menus expose other real units without downloading their questions',async({page,browserName})=>{
 const requested:string[]=[];page.on('request',r=>{if(unitFile.test(new URL(r.url()).pathname))requested.push(new URL(r.url()).pathname)})
 await page.goto('/#/preview/adventure?unit=U06&scene=dojo')
 await expect(page.getByRole('button',{name:'認識新內容',exact:true})).toBeVisible()
 await expect(page.getByRole('link',{name:'U02 · 教室物品：幫小鎮教室找回物品',exact:true})).toBeVisible()
 expect(requested).toHaveLength(1);expect(requested[0]).toMatch(/\/u06-/)
 if(browserName==='chromium'){
  const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.endsWith('.js')).map(e=>({file:new URL(e.name).pathname,bytes:(e as PerformanceResourceTiming).decodedBodySize})))
  expect(resources.every(r=>r.bytes>0)).toBe(true)
  const totalBytes=resources.reduce((n,r)=>n+r.bytes,0);expect(totalBytes).toBeLessThanOrEqual(900000)
  await writeFile('docs/phases/P4/evidence/u06-runtime-script-budget.json',JSON.stringify({scope:'U06 dojo before parent/content review, clean isolated Chromium, service workers blocked',limitBytes:900000,totalBytes,resources},null,2)+'\n')
 }

 await page.getByRole('button',{name:'認識新內容',exact:true}).click();await expect(page.getByRole('heading',{name:'飯與飲料',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual([])
})
test('a failed content chunk gives a recoverable state and a deliberate reload retries without creating attempts',async({page})=>{
 await page.route('**/assets/u06-*.js',route=>route.fulfill({status:503,body:'Temporary isolated curriculum outage'}))
 await page.goto('/#/preview/adventure?unit=U06&scene=dojo')
 await expect(page.getByRole('heading',{name:'教材暫時無法載入 / よみこめません',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual([])
 await page.unroute('**/assets/u06-*.js')
 await page.getByRole('button',{name:'重新載入教材 / よみこみなおす',exact:true}).click()
 await expect(page.getByRole('button',{name:'認識新內容',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual([])
})
test('switching units while their chunk is delayed cannot render or save the old unit',async({page})=>{
 let release!:()=>void,started!:()=>void
 const gate=new Promise<void>(resolve=>{release=resolve}),seen=new Promise<void>(resolve=>{started=resolve})
 await page.route('**/assets/u06-*.js',async route=>{started();await gate;await route.continue()})
 await page.goto('/#/preview/adventure?unit=U06&scene=dojo',{waitUntil:'domcontentloaded'});await seen
 await page.evaluate(()=>{location.hash='/preview/adventure?unit=U02&scene=learn'})
 await expect(page.getByRole('heading',{name:'準備寫字用具',exact:true})).toBeVisible()
 const completed=page.waitForResponse(response=>/\/assets\/u06-[^/]+\.js$/.test(new URL(response.url()).pathname)&&response.ok())
 release();await completed;await page.unroute('**/assets/u06-*.js')
 await expect(page.getByRole('heading',{name:'飯與飲料',exact:true})).not.toBeVisible()
 expect((await records<{unitId:string}>(page,'studyPlans')).map(p=>p.unitId)).toEqual(['U02'])
 expect(await records(page,'learningAttempts')).toEqual([])
})
