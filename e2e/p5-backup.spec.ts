import {test,expect,type Page} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import {records,teach,queueQuestions} from './helpers/unitJourney'
import type {UnitPack} from '../src/content/contracts'
import type {BackupEnvelope} from '../src/backup/schema'
const pack=JSON.parse(await readFile('src/content/packs/u02.json','utf8')) as UnitPack
const backup=(page:Page)=>page.getByRole('region',{name:'完整備份與還原',exact:true})
async function parent(page:Page){
  await page.goto('/#/parent')
  for(const digit of '1234')await page.getByRole('button',{name:digit,exact:true}).click()
  await expect(backup(page)).toBeVisible()
  await expect(page.getByRole('heading',{name:'家長儀表板',exact:true})).toBeVisible()
  await expect(page.getByText('載入中…',{exact:true})).not.toBeVisible()
}
async function exported(page:Page){
  const downloading=page.waitForEvent('download');await backup(page).getByRole('button',{name:'匯出完整備份',exact:true}).click()
  const download=await downloading;return readFile((await download.path())!,'utf8')
}
async function choose(page:Page,text:string){
  await backup(page).getByLabel('選擇完整備份檔',{exact:true}).setInputFiles({name:'Japanese101-isolated-test.json',mimeType:'application/json',buffer:Buffer.from(text)})
  await expect(backup(page).getByRole('heading',{name:'還原預覽',exact:true})).toBeVisible()
}
async function put(page:Page,table:string,row:unknown){
  await page.evaluate(({table,row})=>new Promise<void>((resolve,reject)=>{const r=indexedDB.open('Japanese101DB');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction(table,'readwrite');tx.objectStore(table).put(row);tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>reject(tx.error)}}),{table,row})
}
test('full backup restores earned coins, equipped purchase, real attempts and an unfinished battle into another browser context',async({page,browser,baseURL})=>{
  test.setTimeout(90000)
  await page.goto('/#/preview/adventure?unit=U02&scene=dojo');await teach(page,pack)
  const questions=pack.questions.filter(q=>q.typeId==='T01').slice(0,4)
  await queueQuestions(page,'U02',questions.map(q=>q.id));await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  for(const q of questions){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
    await page.getByRole('button',{name:'繼續',exact:true}).click()
  }
  await page.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click()
  await expect(page.getByRole('button',{name:'地點清單',exact:true})).toBeVisible()
  await page.goto('/#/preview/adventure?unit=U02&scene=shop')
  const hat=page.locator('article').filter({has:page.getByRole('heading',{name:'旅行帽',exact:true})})
  await hat.getByRole('button',{name:'購買並裝備',exact:true}).click();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible()
  await page.goto('/#/preview/adventure?unit=U02&scene=dojo');await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  await expect(page.getByRole('button',{name:'普通攻擊',exact:true})).toBeVisible()
  // An extra anonymous child and dormant legacy history exist only in this isolated browser.
  await put(page,'profiles',{profile_id:'backup-second',name:'備份測試乙',avatar_emoji:'🐈',created_at:1,last_played:1})
  await put(page,'coinWallets',{profileId:'backup-second',balance:9})
  await parent(page);const text=await exported(page),file=JSON.parse(text) as BackupEnvelope
  expect(file.payload.tables.learningAttempts).toHaveLength(4);expect(file.payload.tables.inventory).toHaveLength(1)
  expect(file.payload.tables.coinWallets).toContainEqual({profileId:'player',balance:20})
  const other=await browser.newContext({baseURL,serviceWorkers:'block'}),restored=await other.newPage()
  try{
    await parent(restored);await choose(restored,text)
    await expect(backup(restored).getByRole('button',{name:'確認還原',exact:true})).toBeDisabled()
    await backup(restored).getByRole('checkbox').check();await backup(restored).getByRole('button',{name:'確認還原',exact:true}).click()
    const dialog=restored.getByRole('dialog',{name:'資料已還原',exact:true});await expect(dialog).toBeVisible()
    for(const table of ['learningAttempts','battleSessions','coinWallets','coinLedger','inventory','equipment','purchaseReceipts','studyPlans','skillReviews'] as const)expect(await records(restored,table),table).toEqual(file.payload.tables[table])
    await dialog.getByRole('button',{name:'重新開啟學習紀錄',exact:true}).click()
    await expect(restored.getByRole('button',{name:'1',exact:true})).toBeVisible()
    await restored.goto('/#/preview/adventure?unit=U02&scene=dojo')
    await expect(restored.getByText('金幣 20',{exact:true})).toBeVisible()
    await restored.getByRole('button',{name:'繼續挑戰',exact:true}).click()
    await expect(restored.getByRole('button',{name:'普通攻擊',exact:true})).toBeVisible()
    expect(await records(restored,'profiles')).toHaveLength(2)
  }finally{await other.close()}
})
test('backup preview is keyboard usable at five widths and 200% text; cancel and invalid file leave records unchanged',async({page,browserName})=>{
  await parent(page);const text=await exported(page);await choose(page,text)
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:width===768?1024:width===1024?768:900})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(await backup(page).getByRole('button').evaluateAll(bs=>bs.every(b=>b.getBoundingClientRect().height>=63.9))).toBe(true)
    if(browserName==='chromium')await backup(page).screenshot({path:`docs/phases/P5/evidence/backup-preview-${width}.png`})
  }
  await page.setViewportSize({width:768,height:1024});await page.addStyleTag({content:'html { font-size: 200% !important; }'})
  expect(await backup(page).evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true)
  const checkbox=backup(page).getByRole('checkbox');await checkbox.focus();await page.keyboard.press('Space');await expect(checkbox).toBeChecked()
  await page.keyboard.press('Tab');await expect(backup(page).getByRole('button',{name:'確認還原',exact:true})).toBeFocused()
  await page.keyboard.press('Tab');await expect(backup(page).getByRole('button',{name:'取消，不修改資料',exact:true})).toBeFocused()
  if(browserName==='chromium')await backup(page).screenshot({path:'docs/phases/P5/evidence/backup-preview-text-200.png'})
  await page.keyboard.press('Enter');await expect(backup(page).getByRole('heading',{name:'還原預覽',exact:true})).not.toBeVisible()
  expect(await records(page,'migrationBackups')).toEqual((JSON.parse(text) as BackupEnvelope).payload.tables.migrationBackups)
  await backup(page).getByLabel('選擇完整備份檔',{exact:true}).setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{broken')})
  await expect(backup(page).getByRole('alert')).toContainText('不是可還原的完整備份')
  expect(await records(page,'profiles')).toEqual((JSON.parse(text) as BackupEnvelope).payload.tables.profiles)
})
test('another tab changing records invalidates the reviewed backup without overwriting its new data',async({page,context})=>{
  await parent(page);const text=await exported(page)
  const other=await context.newPage();await other.goto('/#/preview/adventure?unit=U02&scene=dojo');await expect(other.getByRole('button',{name:'認識新內容',exact:true})).toBeVisible()
  await choose(page,text);await backup(page).getByRole('checkbox').check()
  await put(other,'coinWallets',{profileId:'player',balance:37})
  await backup(page).getByRole('button',{name:'確認還原',exact:true}).click()
  await expect(backup(page).getByRole('alert')).toContainText('本機紀錄有變動')
  expect(await records(page,'coinWallets')).toEqual([{profileId:'player',balance:37}])
  await expect(page.getByRole('dialog',{name:'資料已還原',exact:true})).not.toBeVisible()
})
test('a storage failure during replacement keeps the old player and archives intact and can retry',async({page})=>{
  await parent(page);const text=await exported(page),file=JSON.parse(text) as BackupEnvelope
  await choose(page,text);await backup(page).getByRole('checkbox').check()
  await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){if(this.name==='adventureProgress'){IDBObjectStore.prototype.put=put;throw new DOMException('isolated restore fault','QuotaExceededError')}return put.apply(this,args)}})
  await backup(page).getByRole('button',{name:'確認還原',exact:true}).click()
  await expect(backup(page).getByRole('alert')).toContainText('原有資料已保留')
  for(const table of ['profiles','preferences','adventureProgress','migrationBackups'] as const)expect(await records(page,table)).toEqual(file.payload.tables[table])
  await backup(page).getByRole('button',{name:'確認還原',exact:true}).click();await expect(page.getByRole('dialog',{name:'資料已還原',exact:true})).toBeVisible()
})

test('weekly dates retain all seven labels at 320px with larger fallback font metrics',async({page,browserName})=>{
  await page.setViewportSize({width:320,height:900});await parent(page)
  const chart=page.getByRole('heading',{name:'本週',exact:true}).locator('..')
  await expect(chart.locator('span')).toHaveCount(7)
  // Reproduce wider CI font metrics without relying on a specific host font installation.
  await chart.locator('span').evaluateAll(labels=>labels.forEach(label=>{label.style.fontSize='16px'}))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  expect(await chart.locator('span').evaluateAll(labels=>labels.every(label=>label.scrollWidth<=label.clientWidth))).toBe(true)
  for(const text of await chart.locator('span').allTextContents())expect(text).toMatch(/^\d{1,2}\/\d{1,2}$/)
  await chart.screenshot({path:`docs/phases/P5/evidence/weekly-dates-${browserName}-320.png`})
})
