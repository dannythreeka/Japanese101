import {test,expect} from '@playwright/test'
import {offlineOrigin} from './helpers/offlineOrigin'
test.use({serviceWorkers:'allow'})
test('a slow real offline-app activation does not falsely reject a valid download',async({page,browserName})=>{
 test.setTimeout(90000)
 // Delay the REAL ready registration, not its result or the verified media downloads.
 await page.addInitScript(()=>{
  const container=navigator.serviceWorker,descriptor=Object.getOwnPropertyDescriptor(ServiceWorkerContainer.prototype,'ready')!
  Object.defineProperty(container,'ready',{get(){return descriptor.get!.call(container).then((registration:ServiceWorkerRegistration)=>new Promise(resolve=>setTimeout(()=>resolve(registration),10000)))}})
 })
 const origin=await offlineOrigin()
 try{
  await page.setViewportSize({width:768,height:1024})
  await page.goto(`${origin.origin}/#/preview/adventure?unit=U08`)
  await page.getByRole('button',{name:'旅行手帳',exact:true}).click()
  await page.getByRole('button',{name:'下載離線教材',exact:true}).click()
  // The old product deadline was 8 seconds. The real installation remains valid.
  await page.waitForTimeout(9000)
  await expect(page.getByText('正在準備離線功能…',{exact:true})).toBeVisible()
  await page.screenshot({path:`docs/phases/P4/evidence/offline-preparing-${browserName}-768.png`,fullPage:true})
  await expect(page.getByText('教材尚未存好。請確認連線與可用空間後重試。',{exact:true})).not.toBeVisible()
  await expect(page.getByText('教材下載完成，可離線練習。',{exact:true})).toBeVisible({timeout:60000})
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true)
 }finally{await origin.stop()}
})
