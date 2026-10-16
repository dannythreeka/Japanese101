import { test, expect, type Page } from '@playwright/test'
import pack from '../src/content/packs/u01.json' with {type:'json'}
import type { BattleSession, CoinLedger, InventoryItem, WorldCheckpoint } from '../src/db/journey-models'
import type { Attempt } from '../src/content/contracts'
import {offlineOrigin} from './helpers/offlineOrigin'

async function records<T>(page:Page,store:string):Promise<T[]> {
  return page.evaluate(store=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('Japanese101DB');request.onerror=()=>reject(request.error)
    request.onsuccess=()=>{const db=request.result,tx=db.transaction(store),read=tx.objectStore(store).getAll();read.onsuccess=()=>resolve(read.result);read.onerror=()=>reject(read.error);tx.oncomplete=()=>db.close()}
  }),store) as Promise<T[]>
}
async function open(page:Page){
  await page.goto('/#/preview/adventure');await expect(page.getByRole('heading',{name:'青葉町旅行手帳',exact:true})).toBeVisible()
  const id=await page.evaluate(()=>localStorage.getItem('activeProfileId') ?? 'player')
  const study=(await records<{profileId:string;onboarding?:unknown;taughtCards:string[]}>(page,'studyPlans')).find(s=>s.profileId===id)
  if(study && !study.onboarding && !study.taughtCards.length && !(await records<Attempt>(page,'learningAttempts')).some(a=>a.profileId===id))await page.getByRole('button',{name:'略過，先探索',exact:true}).click()
}
async function place(page:Page,name:string){await page.getByRole('button',{name:'地點清單',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name,exact:true}).click()}
async function teach(page:Page){
  await place(page,'初芽道館');await page.getByRole('button',{name:'認識新內容',exact:true}).click()
  for(let n=0;n<pack.teaching.length;n++){
    if(n)await page.getByRole('navigation',{name:'認識新內容',exact:true}).getByRole('button',{name:String(n+1),exact:true}).click()
    await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click();await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
  }
  await page.getByRole('button',{name:'返回',exact:true}).first().click()
}
async function answer(page:Page,repeat=false){
  const battle=(await records<BattleSession>(page,'battleSessions')).find(b=>b.phase!=='finished')!
  const question=pack.questions.find(q=>q.id===battle.currentQuestionId)!
  if(question.audioPolicy==='required'){await page.getByRole('button',{name:'播放音訊',exact:true}).click();await expect(page.getByRole('button',{name:'播放音訊',exact:true})).toBeVisible({timeout:15000})}
  if(question.kind==='order')for(const id of question.answer)await page.getByRole('group',{name:'可選字詞',exact:true}).getByRole('button',{name:question.choices.find(c=>c.id===id)!.text,exact:true}).click()
  else await page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true}).click()
  const button=page.getByRole('button',{name:'確認答案',exact:true})
  if(repeat)await button.evaluate(el=>{for(let i=0;i<10;i++)(el as HTMLButtonElement).click()});else await button.click()
  await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  return battle
}
async function updateRecord(page:Page,store:string,id:string,changes:Record<string,unknown>){
  await page.evaluate(({store,id,changes})=>new Promise<void>((resolve,reject)=>{const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction(store,'readwrite'),table=tx.objectStore(store),get=table.get(id);get.onsuccess=()=>table.put({...get.result,...changes});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}}),{store,id,changes})
}
test('storage failure keeps the exact selected answer and turn; retry records one attempt and one damage',async({page})=>{
  await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click();await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions'))[0];const question=pack.questions.find(q=>q.id===battle.currentQuestionId)!
  await page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true}).click()
  await page.getByRole('button',{name:'暫停旅程',exact:true}).click();expect(await records(page,'learningAttempts')).toEqual([]);await page.getByRole('dialog').getByRole('button',{name:'繼續冒險',exact:true}).click();await expect(page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true})).toHaveAttribute('aria-pressed','true')
  await page.evaluate(()=>{const original=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(...args:Parameters<IDBObjectStore['add']>){if(this.name==='learningAttempts'){IDBObjectStore.prototype.add=original;throw new DOMException('P2 isolated quota fault','QuotaExceededError')}return original.apply(this,args)}})
  await page.getByRole('button',{name:'確認答案',exact:true}).click();await expect(page.getByRole('heading',{name:'還沒存好',exact:true})).toBeVisible()
  expect(await records(page,'learningAttempts')).toEqual([]);expect((await records<BattleSession>(page,'battleSessions'))[0]).toMatchObject({enemyHp:30,phase:'question'})
  await expect(page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'重試',exact:true}).click();await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  expect((await records<BattleSession>(page,'battleSessions'))[0].enemyHp).toBe(22);expect(await records(page,'learningAttempts')).toHaveLength(1)
})
test('a committed answer with a failed refresh retries only its read and never repeats damage',async({page})=>{
  await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click();await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions'))[0];const question=pack.questions.find(q=>q.id===battle.currentQuestionId)!
  await page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true}).click()
  await page.evaluate(()=>{const put=IDBObjectStore.prototype.put,get=IDBObjectStore.prototype.get;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore['put']>){const request=put.apply(this,args);if(this.name==='skillReviews')request.addEventListener('success',()=>{IDBObjectStore.prototype.put=put;IDBObjectStore.prototype.get=function(...args:Parameters<IDBObjectStore['get']>){if(this.name==='studyPlans'){IDBObjectStore.prototype.get=get;throw new DOMException('P2 read after answer commit fault','UnknownError')}return get.apply(this,args)}},{once:true});return request}})
  await page.getByRole('button',{name:'確認答案',exact:true}).click();await expect(page.getByRole('heading',{name:'操作已處理，但暫時無法讀取最新畫面。請重試讀取。',exact:true})).toBeVisible()
  expect(await records(page,'learningAttempts')).toHaveLength(1);expect((await records<BattleSession>(page,'battleSessions'))[0].enemyHp).toBe(22)
  await page.getByRole('button',{name:'重試',exact:true}).click();await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible();expect(await records(page,'learningAttempts')).toHaveLength(1);expect((await records<BattleSession>(page,'battleSessions'))[0].enemyHp).toBe(22)
})
test('first journey setup stores nickname, grade and comfort without inventing ability; guide can replay',async({page})=>{
  await page.goto('/#/preview/adventure');const guide=page.getByRole('dialog',{name:'歡迎來到青葉町',exact:true});await expect(guide).toBeVisible()
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:width===768?1024:width===1024?768:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);expect(await guide.getByRole('button').evaluateAll(buttons=>buttons.every(b=>{const r=b.getBoundingClientRect();return r.width>=63.9 && r.height>=63.9}))).toBe(true)}
  await guide.getByLabel('旅行者的暱稱',{exact:true}).fill('初次旅行');await guide.getByRole('button',{name:'小五～小六',exact:true}).click();await guide.getByRole('button',{name:'我認識一些假名',exact:true}).click();await guide.getByRole('button',{name:'出發去小鎮',exact:true}).click();await expect(guide).not.toBeVisible()
  await expect(page.locator('header small')).toHaveText('初次旅行');expect(await records(page,'learningAttempts')).toEqual([]);expect(await records(page,'skillReviews')).toEqual([])
  const plan=(await records<{gradeBand:number;onboarding:{comfort:string;skipped:boolean}}>(page,'studyPlans'))[0];expect(plan).toMatchObject({gradeBand:3,onboarding:{comfort:'some',skipped:false}})
  await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await page.getByRole('button',{name:'重看旅行說明',exact:true}).click();await expect(guide).toBeVisible();await page.keyboard.press('Escape');await expect(guide).not.toBeVisible();expect(await records(page,'learningAttempts')).toEqual([])
})
test('a changed catalog in another tab blocks obsolete purchases and preserves the wallet',async({page})=>{
  await open(page)
  // Isolated affordable shop fixture; the full cycle earns its actual 60 coins.
  await updateRecord(page,'coinWallets','player',{profileId:'player',balance:60});await page.reload();await place(page,'小路裝備店')
  await updateRecord(page,'catalogVersions','active',{version:'economy-v0.2',revision:2})
  const hat=page.locator('article').filter({has:page.getByRole('heading',{name:'旅行帽',exact:true})});await hat.getByRole('button',{name:'購買並裝備',exact:true}).click()
  await expect(page.getByRole('heading',{name:'商品已更新，請重新開啟，確認金幣與已購裝備。',exact:true})).toBeVisible()
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(60);expect(await records(page,'inventory')).toEqual([])
  expect((await records<{revision:number}>(page,'catalogVersions'))[0].revision).toBe(2)
})
test('two tabs buying the same item save one debit, one ownership and one receipt',async({page,context})=>{
  await open(page);await updateRecord(page,'coinWallets','player',{profileId:'player',balance:60});await page.goto('/#/preview/adventure?scene=shop');await page.reload()
  const second=await context.newPage();await second.goto('/#/preview/adventure?scene=shop')
  const hats=[page,second].map(tab=>tab.locator('article').filter({has:tab.getByRole('heading',{name:'旅行帽',exact:true})}))
  await Promise.all(hats.map(hat=>expect(hat.getByRole('button',{name:'購買並裝備',exact:true})).toBeEnabled()))
  const buttons=await Promise.all(hats.map(hat=>hat.getByRole('button',{name:'購買並裝備',exact:true}).elementHandle()))
  await Promise.all(buttons.map(button=>button!.evaluate(el=>(el as HTMLButtonElement).click())))
  await Promise.all(hats.map(hat=>expect(hat.getByText('已裝備',{exact:true})).toBeVisible()))
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(20);expect(await records(page,'inventory')).toHaveLength(1);expect(await records(page,'purchaseReceipts')).toHaveLength(1);expect(await records(page,'coinLedger')).toHaveLength(1)
})
test('a saved purchase followed by a read failure is reported accurately and retry never charges again',async({page})=>{
  await open(page);await updateRecord(page,'coinWallets','player',{profileId:'player',balance:60});await page.goto('/#/preview/adventure?scene=shop');await page.reload()
  await page.evaluate(()=>{
    const add=IDBObjectStore.prototype.add,get=IDBObjectStore.prototype.get
    IDBObjectStore.prototype.add=function(...args:Parameters<IDBObjectStore['add']>){const request=add.apply(this,args);if(this.name==='purchaseReceipts')request.addEventListener('success',()=>{IDBObjectStore.prototype.add=add;IDBObjectStore.prototype.get=function(...args:Parameters<IDBObjectStore['get']>){if(this.name==='studyPlans'){IDBObjectStore.prototype.get=get;throw new DOMException('P2 read after commit fault','UnknownError')}return get.apply(this,args)}},{once:true});return request}
  })
  const hat=page.locator('article').filter({has:page.getByRole('heading',{name:'旅行帽',exact:true})});await hat.getByRole('button',{name:'購買並裝備',exact:true}).click()
  await expect(page.getByRole('heading',{name:'操作已處理，但暫時無法讀取最新畫面。請重試讀取。',exact:true})).toBeVisible()
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(20);await page.getByRole('button',{name:'重試',exact:true}).click();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible();expect(await records(page,'purchaseReceipts')).toHaveLength(1);expect(await records(page,'coinLedger')).toHaveLength(1)
})
test('stale map/content/battle versions archive raw records and restart safely without coins',async({page})=>{
  await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions'))[0]
  await updateRecord(page,'battleSessions',battle.id,{rulesVersion:'obsolete-rules'})
  await page.reload();await expect(page.getByRole('heading',{name:'內容已更新，先保留原紀錄再重新開始。',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'繼續冒險',exact:true}).click();await expect(page.getByRole('region',{name:'小鎮探索',exact:true})).toBeVisible()
  expect((await records<BattleSession>(page,'battleSessions'))[0]).toMatchObject({rulesVersion:'obsolete-rules',phase:'finished',status:'retreated'})
  expect(await records(page,'migrationBackups')).toHaveLength(1);expect(await records(page,'coinLedger')).toEqual([])
  await updateRecord(page,'worldCheckpoints','player',{worldVersion:'old-map',position:{x:900,y:900}});await page.reload()
  await page.getByRole('button',{name:'繼續冒險',exact:true}).click();await expect(page.getByTestId('world-player')).toHaveAttribute('data-x','8')
  expect(await records(page,'migrationBackups')).toHaveLength(2)
})
test('four renderers keep keyboard order, real audio gating and no automatic next question',async({page})=>{
  test.setTimeout(90000);await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions'))[0]
  // Isolated renderer fixture; regular town/reward test uses the unmodified queue.
  await updateRecord(page,'battleSessions',battle.id,{questionIds:['U01-Q23','U01-Q29','U01-Q35','U01-Q43']});await page.reload()
  for(let turn=1;turn<=4;turn++){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    if(turn===1){await expect(page.getByRole('group',{name:'可選字詞',exact:true})).toBeVisible();await expect(page.locator('ruby')).toHaveCount(0)}
    if(turn===2)await expect(page.locator('[lang="ja"]').filter({hasText:'はじめまして。'}).first()).toBeVisible()
    if(turn>=3)await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeDisabled()
    await answer(page);expect((await records<BattleSession>(page,'battleSessions'))[0].turn).toBe(turn)
    await page.getByRole('button',{name:'繼續',exact:true}).focus();await page.keyboard.press('Enter')
  }
  expect(await records(page,'learningAttempts')).toHaveLength(4)
})
test('unreviewed independent check has no hints or immediate answer disclosure; locale retains selection',async({page})=>{
  await open(page);await teach(page);await page.getByRole('button',{name:'檢查學會了嗎',exact:true}).click()
  const q=pack.questions.find(q=>q.id==='U01-C01')!
  await expect(page.getByRole('button',{name:'看看提示',exact:true})).toHaveCount(0)
  await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click();await page.getByRole('button',{name:'日本語',exact:true}).click()
  await expect(page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'こたえをきめる',exact:true}).click();await expect(page.getByRole('button',{name:'つづける',exact:true})).toBeVisible()
  await expect(page.getByText(q.explanation,{exact:true})).toHaveCount(0);await expect(page.getByText(q.explanationJa!,{exact:true})).toHaveCount(0)
  expect(await records(page,'coinLedger')).toEqual([]);expect(await records(page,'battleSessions')).toEqual([])
})
test('all six full listening clips play in guarded real-audio turns; missing audio never becomes an incorrect attempt',async({page})=>{
  test.setTimeout(120000);await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions'))[0]
  await updateRecord(page,'battleSessions',battle.id,{questionIds:['U01-Q35','U01-Q36','U01-Q37','U01-Q38','U01-Q43','U01-Q44']});await page.reload()
  await page.getByRole('button',{name:'防守',exact:true}).click();await page.route('**/assets/audio/u01/listening-01.wav',route=>route.abort())
  await page.getByRole('button',{name:'播放音訊',exact:true}).click();await expect(page.getByText('音訊尚未播放成功，請重試。目前不會計算答錯。',{exact:true})).toBeVisible();expect(await records(page,'learningAttempts')).toEqual([])
  await page.unroute('**/assets/audio/u01/listening-01.wav')
  for(let turn=1;turn<=6;turn++){
    if(turn>1)await page.getByRole('button',{name:'防守',exact:true}).click()
    await answer(page);await page.getByRole('button',{name:'繼續',exact:true}).click()
  }
  const attempts=await records<Attempt>(page,'learningAttempts');expect(attempts).toHaveLength(6);expect(attempts.every(a=>a.audioPlayCount===1 && a.firstAnswerCorrect)).toBe(true)
  expect((await records<BattleSession>(page,'battleSessions'))[0].endReason).toBe('questions-complete');expect(await records(page,'coinLedger')).toEqual([])
})
test('town → taught practice → victory → atomic purchase → refresh → parent PIN report',async({page,context},info)=>{
  test.setTimeout(90000);await open(page);await teach(page)
  await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  let battle:BattleSession|undefined
  for(let turn=1;turn<=4;turn++){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click();battle=await answer(page,true)
    const count=(await records<Attempt>(page,'learningAttempts')).length;expect(count).toBe(turn)
    if(turn===1){await page.reload();await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible();expect((await records<Attempt>(page,'learningAttempts')).length).toBe(count)}
    await page.getByRole('button',{name:'繼續',exact:true}).click()
  }
  await expect(page.getByRole('heading',{name:'挑戰成功',exact:true})).toBeVisible()
  await page.goto('/#/preview/adventure');await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await page.getByRole('button',{name:'繼續挑戰',exact:true}).click();await expect(page.getByRole('heading',{name:'挑戰成功',exact:true})).toBeVisible()
  const second=await context.newPage();await second.goto(`/#/preview/adventure?scene=battle&id=${battle!.id}`)
  await expect(second.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true})).toBeVisible()
  // Dispatch both rendered buttons without changing tab focus in between;
  // focus hydration may otherwise correctly replace the second with “return”.
  const claims=await Promise.all([page,second].map(tab=>tab.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).elementHandle()))
  await Promise.all(claims.map(button=>button!.evaluate(el=>(el as HTMLButtonElement).click())))
  await Promise.all([page,second].map(tab=>expect(tab).toHaveURL(/#\/preview\/adventure$/)))
  expect((await records<CoinLedger>(page,'coinLedger')).filter(l=>l.kind==='reward')).toHaveLength(1)
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(60);await second.close()
  await page.goto(`/#/preview/adventure?scene=battle&id=${battle!.id}`);await page.getByRole('button',{name:'回到小鎮',exact:true}).click()
  await expect(page.getByText('金幣已存入背包 +60',{exact:true})).toHaveCount(0)
  expect((await records<CoinLedger>(page,'coinLedger')).filter(l=>l.kind==='reward')).toHaveLength(1)
  await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await expect(page.getByRole('progressbar')).toHaveAttribute('value','4');await page.keyboard.press('Escape')
  await place(page,'小路裝備店');const hat=page.locator('article').filter({has:page.getByRole('heading',{name:'旅行帽',exact:true})})
  await hat.getByRole('button',{name:'試穿看看',exact:true}).click();expect(await records(page,'inventory')).toEqual([])
  await hat.getByRole('button',{name:'購買並裝備',exact:true}).click();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible()
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(20);expect(await records<InventoryItem>(page,'inventory')).toHaveLength(1)
  await page.screenshot({path:info.outputPath('shop-equipped.png'),fullPage:true});await page.reload();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'回到小鎮',exact:true}).click();await expect(page.locator('.journey-map-character .journey-wear--hat')).toHaveCount(1)
  await page.getByRole('button',{name:'家長區',exact:true}).click();await expect(page.getByRole('heading',{name:'學習摘要',exact:true})).toHaveCount(0)
  for(const digit of '1234')await page.getByRole('button',{name:digit,exact:true}).click()
  await expect(page.getByRole('heading',{name:'學習摘要',exact:true})).toBeVisible();await expect(page.getByText('首次獨立答對率：100% · 作答樣本 4',{exact:true})).toBeVisible()
})
test('keyboard stops on cancel/blur, blocked walls reject, places persist safe positions without attempts',async({page})=>{
  await open(page);const player=page.getByTestId('world-player');const region=page.getByRole('region',{name:'小鎮探索',exact:true})
  const world=await page.locator('.journey-world').boundingBox();expect(world).not.toBeNull()
  await page.mouse.click(world!.x+6.5*40,world!.y+16.5*40);await expect(page.getByText('這裡走不到，換一個落點試試。',{exact:true})).toBeVisible();await expect(player).toHaveAttribute('data-x','8')
  await region.focus();await page.keyboard.down('ArrowRight');await expect(player).not.toHaveAttribute('data-x','8');await page.keyboard.up('ArrowRight')
  const x=await player.getAttribute('data-x');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-x',x!)
  await page.keyboard.down('ArrowRight');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));const stopped=await player.getAttribute('data-x');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-x',stopped!);await page.keyboard.up('ArrowRight')
  await page.getByRole('button',{name:'方向控制',exact:true}).click();await page.getByRole('button',{name:'向上走',exact:true}).dispatchEvent('pointerdown');await page.evaluate(()=>window.dispatchEvent(new Event('pointercancel')))
  const y=await player.getAttribute('data-y');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-y',y!)
  await place(page,'花園裡的小晴');await expect(page.getByRole('dialog').getByText('歡迎來到小鎮。我是小晴，正在照顧這片花園。',{exact:true})).toBeVisible();await page.getByRole('button',{name:'播放音訊',exact:true}).click();await expect(page.getByRole('button',{name:'播放音訊',exact:true})).toBeVisible({timeout:15000});await page.keyboard.press('Escape')
  expect(await records(page,'learningAttempts')).toEqual([]);expect((await records<WorldCheckpoint>(page,'worldCheckpoints'))[0].storyFlags).toContain('gardener')
  await page.reload();await expect(player).toHaveAttribute('data-x','16');await expect(player).toHaveAttribute('data-y','12')
})
for(const width of [320,390,768,1024,1440])test(`P2 town/dojo/shop layout ${width}px and 64px targets`,async({page},info)=>{
  await page.setViewportSize({width,height:width===768 ? 1024:width===1024 ? 768:900});await open(page)
  for(const scene of ['town','dojo','shop']){
    if(scene==='dojo')await place(page,'初芽道館')
    if(scene==='shop'){await page.getByRole('button',{name:'回到小鎮',exact:true}).click();await place(page,'小路裝備店')}
    const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,small:[...document.querySelectorAll('main button')].map(b=>b.getBoundingClientRect()).filter(r=>r.width>0 && r.height>0 && (r.width<63.9 || r.height<63.9)).map(r=>({w:r.width,h:r.height}))}))
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);expect(geometry.small).toEqual([])
    await page.screenshot({path:info.outputPath(`${scene}-${width}.png`),fullPage:true})
  }
})

test('player switch isolates world, battle, coins, inventory and exported attempts',async({page})=>{
  await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click();await page.getByRole('button',{name:'普通攻擊',exact:true}).click();const a=await answer(page)
  await page.getByRole('button',{name:'切換玩家',exact:true}).click();await page.getByRole('button',{name:'新增玩家',exact:true}).click();await page.locator('#profile-name').fill('P2-B');await page.locator('button').last().click();await expect(page).toHaveURL(/#\/$/)
  await open(page);await expect(page.locator('header small')).toHaveText('P2-B');await expect(page.getByText('金幣 0',{exact:true})).toBeVisible();await expect(page.getByTestId('world-player')).toHaveAttribute('data-x','8')
  await page.goto(`/#/preview/adventure?scene=battle&id=${a.id}`);await expect(page.getByRole('heading',{name:'暫時無法開啟，原有紀錄仍保留。',exact:true})).toBeVisible();expect(await records(page,'coinLedger')).toEqual([])
  await page.getByRole('button',{name:'回到小鎮',exact:true}).click();await page.getByRole('button',{name:'家長區',exact:true}).click();for(const digit of '1234')await page.getByRole('button',{name:digit,exact:true}).click()
  await expect(page.getByText('尚未檢核／樣本不足',{exact:true}).first()).toBeVisible()
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'匯出這位玩家的冒險紀錄',exact:true}).click();const file=await download
  const fs=await import('node:fs/promises');const exported=JSON.parse(await fs.readFile((await file.path())!,'utf8'))
  expect(exported.data.attempts).toEqual([]);expect(exported.data.battles).toEqual([]);expect(exported.data.inventory).toEqual([])
  expect((await records<Attempt>(page,'learningAttempts')).filter(x=>x.profileId==='player')).toHaveLength(1)
})

test('200% text keeps town controls and shop accessible without horizontal page overflow',async({page},info)=>{
  await page.setViewportSize({width:390,height:900});await open(page)
  for(const scene of ['town','shop']){
    if(scene==='shop'){await page.goto('/#/preview/adventure?scene=shop');await expect(page.getByRole('heading',{name:'小路裝備店',exact:true})).toBeVisible()}
    await page.evaluate(()=>{const values=[...document.querySelectorAll('main,main *,dialog,dialog *')].map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}));for(const {e,size,line} of values){(e as HTMLElement).style.fontSize=size*2+'px';if(Number.isFinite(line))(e as HTMLElement).style.lineHeight=line*2+'px'}})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({path:info.outputPath(`${scene}-text200.png`),fullPage:true})
    if(scene==='town')await page.reload()
  }
})
test('long reading battle supports all five widths, scene collapse, keyboard and 200% text',async({page},info)=>{
  test.setTimeout(90000);await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click();const battle=(await records<BattleSession>(page,'battleSessions'))[0]
  await updateRecord(page,'battleSessions',battle.id,{questionIds:['U01-Q31']});await page.reload();await page.getByRole('button',{name:'防守',exact:true}).click()
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:width===768?1024:width===1024?768:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    const tooSmall=await page.locator('main button:visible').evaluateAll(buttons=>buttons.map(b=>b.getBoundingClientRect()).filter(r=>r.width<63.9 || r.height<63.9).length);expect(tooSmall).toBe(0)
    await page.screenshot({path:info.outputPath(`reading-battle-${width}.png`),fullPage:true})
  }
  await page.setViewportSize({width:390,height:900});const collapse=page.getByRole('button',{name:'收合對戰場景',exact:true});await collapse.focus();await page.keyboard.press('Enter');await expect(page.locator('.journey-battle-stage')).toHaveCount(0)
  await page.evaluate(()=>{const values=[...document.querySelectorAll('main,main *')].map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}));for(const {e,size,line} of values){(e as HTMLElement).style.fontSize=size*2+'px';if(Number.isFinite(line))(e as HTMLElement).style.lineHeight=line*2+'px'}})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:info.outputPath('reading-battle-text200.png'),fullPage:true});expect(await records(page,'learningAttempts')).toEqual([])
})
test('review console exposes all content and gear directions without granting approval or writing attempts',async({page})=>{
  await page.goto('/#/__review/content');await expect(page.getByRole('heading',{name:'U01 教材與美術審閱',exact:true})).toBeVisible();await page.getByRole('combobox').selectOption('U01-Q43');await expect(page.getByRole('img',{name:'兩位孩子在小鎮相遇。',exact:true})).toBeVisible()
  for(const name of ['帽子','背包','圍巾','up'])await page.getByRole('button',{name,exact:true}).click()
  expect(await records(page,'learningAttempts')).toEqual([]);expect(await records(page,'inventory')).toEqual([]);expect(await records(page,'coinLedger')).toEqual([])
  expect(pack.reviewStatus).toBe('DRAFT')
})
test('tomorrow review appears after same-day learning and its durable queue survives reopening',async({page})=>{
  test.setTimeout(90000);await page.clock.install({time:new Date('2026-10-16T02:00:00Z')});await open(page);await teach(page);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  for(let turn=1;turn<=4;turn++){await page.getByRole('button',{name:'普通攻擊',exact:true}).click();await answer(page);await page.getByRole('button',{name:'繼續',exact:true}).click()}
  expect((await records<{level:number;dueDate:string}>(page,'skillReviews'))[0]).toMatchObject({level:0,dueDate:'2026-10-17'})
  await page.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click();await expect(page).toHaveURL(/#\/preview\/adventure$/);await page.clock.setSystemTime(new Date('2026-10-17T02:00:00Z'));await page.reload()
  await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await expect(page.getByText('導師邀請你複習 (1)',{exact:true})).toBeVisible();await page.getByRole('button',{name:'初芽道館',exact:true}).click();await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  const battle=(await records<BattleSession>(page,'battleSessions')).find(b=>b.phase!=='finished')!;await page.reload();expect((await records<BattleSession>(page,'battleSessions')).find(b=>b.id===battle.id)?.questionIds).toEqual(battle.questionIds)
  await page.getByRole('button',{name:'防守',exact:true}).click();await answer(page);expect((await records<{level:number;dueDate:string}>(page,'skillReviews'))[0]).toMatchObject({level:1,dueDate:'2026-10-20'})
})
test('twenty world/audio visits release RAF, intervals and playback timeout on departure',async({page})=>{
  test.setTimeout(90000)
  await page.addInitScript(()=>{
    const rafs=new Set<number>(),intervals=new Set<number>(),longTimeouts=new Set<number>(),playing=new Set<HTMLMediaElement>()
    type Callback=(...args:unknown[])=>void
    const timers=window as unknown as {setTimeout:(handler:string|Callback,delay?:number,...args:unknown[])=>number;clearTimeout:(id?:number)=>void;setInterval:(handler:string|Callback,delay?:number,...args:unknown[])=>number;clearInterval:(id?:number)=>void}
    const raf=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window),interval=timers.setInterval.bind(window),clearInt=timers.clearInterval.bind(window),timeout=timers.setTimeout.bind(window),clearTime=timers.clearTimeout.bind(window)
    window.requestAnimationFrame=callback=>{let id=0;id=raf(time=>{rafs.delete(id);callback(time)});rafs.add(id);return id}
    window.cancelAnimationFrame=id=>{rafs.delete(id);cancel(id)}
    timers.setInterval=(handler,delay,...args)=>{const id=interval(handler,delay,...args);intervals.add(id);return id}
    timers.clearInterval=id=>{intervals.delete(Number(id));clearInt(id)}
    timers.setTimeout=(handler,delay,...args)=>{if(typeof handler!=='function' || (delay ?? 0)<40000)return timeout(handler,delay,...args);let id=0;id=timeout(()=>{longTimeouts.delete(id);handler.apply(window,args)},delay);longTimeouts.add(id);return id}
    timers.clearTimeout=id=>{longTimeouts.delete(Number(id));clearTime(id)}
    const play=HTMLMediaElement.prototype.play,pause=HTMLMediaElement.prototype.pause
    HTMLMediaElement.prototype.play=function(){this.addEventListener('ended',()=>playing.delete(this),{once:true});const result=play.call(this);void result.then(()=>{if(!this.paused)playing.add(this)}).catch(()=>{});return result}
    HTMLMediaElement.prototype.pause=function(){playing.delete(this);pause.call(this)}
    Object.assign(window,{__p2Resources:()=>({raf:rafs.size,intervals:intervals.size,playbackTimeouts:longTimeouts.size,playing:playing.size,speaking:window.speechSynthesis?.speaking ?? false})})
  })
  const resources=()=>page.evaluate(()=>(window as unknown as {__p2Resources:()=>Record<string,number|boolean>}).__p2Resources())
  await page.goto('/#/__review/ui');await expect(page.getByRole('heading',{name:'UI review',exact:true})).toBeVisible();const baseline=await resources()
  for(let n=0;n<20;n++){
    await open(page);const player=page.getByTestId('world-player');const x=await player.getAttribute('data-x');await page.getByRole('region',{name:'小鎮探索',exact:true}).focus();const key=n%2 ? 'ArrowLeft':'ArrowRight';await page.keyboard.down(key);await expect(player).not.toHaveAttribute('data-x',x!);await page.keyboard.up(key)
    await place(page,'初芽道館');await page.getByRole('button',{name:'認識新內容',exact:true}).click();await page.getByRole('button',{name:'播放音訊',exact:true}).click();await page.goto('/#/__review/ui');await expect(page.getByRole('heading',{name:'UI review',exact:true})).toBeVisible();await expect.poll(resources).toEqual(baseline)
  }
})

test.describe('P2 verified offline town and unit pack',()=>{
  test.use({serviceWorkers:'allow'})
  test('real origin outage and cold page restore allow exploring, WAV, combat, purchase and equip',async({page,context,browserName},info)=>{
    test.setTimeout(120000);const isolated=await offlineOrigin()
    try{
      await page.goto(`${isolated.origin}/#/preview/adventure`);await expect(page.getByRole('heading',{name:'青葉町旅行手帳',exact:true})).toBeVisible();await page.getByRole('button',{name:'略過，先探索',exact:true}).click();await teach(page)
      await page.getByRole('button',{name:'回到小鎮',exact:true}).click();await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await page.getByRole('button',{name:'下載離線教材',exact:true}).click()
      await expect(page.getByText('教材下載完成，可離線練習。',{exact:true})).toBeVisible({timeout:60000});await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true)
      await isolated.stop();if(browserName!=='webkit')await context.setOffline(true)
      const url=page.url();await page.close();const reopened=await context.newPage();await reopened.goto(url);await expect(reopened.getByRole('region',{name:'小鎮探索',exact:true})).toBeVisible()
      await place(reopened,'花園裡的小晴');await reopened.getByRole('button',{name:'播放音訊',exact:true}).click();await expect(reopened.getByRole('button',{name:'播放音訊',exact:true})).toBeVisible({timeout:15000});await reopened.keyboard.press('Escape')
      await place(reopened,'初芽道館');await reopened.getByRole('button',{name:'認識新內容',exact:true}).click();await reopened.getByRole('button',{name:'播放音訊',exact:true}).click();await expect(reopened.getByRole('button',{name:'播放音訊',exact:true})).toBeVisible({timeout:15000});await reopened.getByRole('button',{name:'返回',exact:true}).first().click()
      await reopened.getByRole('button',{name:'練習對戰',exact:true}).click()
      for(let turn=1;turn<=4;turn++){await reopened.getByRole('button',{name:'普通攻擊',exact:true}).click();await answer(reopened);await reopened.getByRole('button',{name:'繼續',exact:true}).click()}
      await reopened.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click();await place(reopened,'小路裝備店');const hat=reopened.locator('article').filter({has:reopened.getByRole('heading',{name:'旅行帽',exact:true})});await hat.getByRole('button',{name:'購買並裝備',exact:true}).click();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible()
      expect((await records<{balance:number}>(reopened,'coinWallets'))[0].balance).toBe(20);await reopened.reload();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible();await reopened.screenshot({path:info.outputPath('offline-equipped.png'),fullPage:true})
    }finally{await isolated.stop()}
  })
})
