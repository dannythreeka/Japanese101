import { offlineOrigin } from './helpers/offlineOrigin'
import { test, expect, type Page } from '@playwright/test'
import levelsJson from '../data/levels.json' with { type: 'json' }
import type { LevelsData } from '../src/types/adventure'
import type { GameCheckpoint } from '../src/db/models'
import type { Kana } from '../src/types'

async function records<T>(page:Page,store:string):Promise<T[]> {
  return page.evaluate(store=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('Japanese101DB')
    request.onerror=()=>reject(request.error)
    request.onsuccess=()=>{const db=request.result,tx=db.transaction(store),read=tx.objectStore(store).getAll();read.onsuccess=()=>resolve(read.result);read.onerror=()=>reject(read.error);tx.oncomplete=()=>db.close()}
  }),store) as Promise<T[]>
}
async function game(page:Page,feature:string){
  const mounted=page.locator(`[data-feature="${feature}"][data-game-session-id]`)
  await expect(mounted).toBeAttached()
  let result:GameCheckpoint|undefined
  await expect.poll(async()=>{
    const id=await mounted.getAttribute('data-game-session-id')
    result=(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===id)
    return !!result?.planned
  }).toBe(true)
  return result!
}
async function createPlayer(page:Page,name:string,origin=''){
  await page.goto(`${origin}/#/profiles/new`);await page.locator('#profile-name').fill(name);await page.locator('button').last().click();await expect(page).toHaveURL(/#\/$/)
}
async function audioMock(page:Page,mic:'off'|'denied'|'no-device'='off'){
  await page.addInitScript(mode=>{
    // Browser audio callbacks are deterministic here. Real playback/permission requires device evidence.
    window.__p1MediaCalls=0
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>{window.__p1MediaCalls++;return Promise.reject(new DOMException('QA simulated',mode==='no-device'?'NotFoundError':'NotAllowedError'))}}})
    class AudioMock {
      src='';onended:(()=>void)|null=null;onerror:(()=>void)|null=null;oncanplaythrough:(()=>void)|null=null
      constructor(src=''){this.src=src}
      play(){queueMicrotask(()=>this.onended?.());return Promise.resolve()}
      pause(){} load(){} removeAttribute(){}
    }
    Object.defineProperty(window,'Audio',{configurable:true,value:AudioMock})
  },mic)
}
declare global { interface Window { __p1MediaCalls:number } }

test('first answers survive retry/refresh, ten clicks and two-page finalization pay once',async({page,context},info)=>{
  await audioMock(page);await createPlayer(page,'P1-score')
  await page.goto('/#/play/kana')
  let current=await game(page,'kana')
  const id=current.id
  for(let i=0;i<10;i++) {
    current=(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===id)!
    const rounds=current.checkpoint.rounds as {correct:Kana;choices:Kana[]}[]
    if(i<4){
      const wrong=rounds[i].choices.find(k=>k.id!==rounds[i].correct.id)!
      await page.getByRole('button',{name:wrong.romaji,exact:true}).click()
      await page.getByRole('button',{name:'確認答案',exact:true}).click()
      await page.getByRole('button',{name:'再試一次',exact:true}).click()
    }
    if(i===4){await page.reload();await expect(page.getByText('5/10',{exact:true})).toBeVisible()}
    await page.getByRole('button',{name:rounds[i].correct.romaji,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).evaluate(el=>{for(let n=0;n<10;n++)(el as HTMLButtonElement).click()})
    if(i===9){
      const second=await context.newPage();await second.goto('/#/play/kana');await expect(second.getByText('完成了！',{exact:true})).toBeVisible();await second.close()
    }
    await page.getByRole('button',{name:'下一題',exact:true}).evaluate(el=>{for(let n=0;n<10;n++)(el as HTMLButtonElement).click()})
  }
  await expect(page.getByText('首次獨立答對率: 60% (6/10)',{exact:true})).toBeVisible()
  await expect(page.getByText('練習完成率: 100%',{exact:true})).toBeVisible()
  const receipts=await records<{id:string;stars:number}>(page,'rewardReceipts')
  expect(receipts.filter(r=>r.id===`game:${id}`)).toHaveLength(1)
  expect(receipts.find(r=>r.id===`game:${id}`)?.stars).toBe(6)
  await page.screenshot({path:info.outputPath('first-answer-result.png'),fullPage:true})
})

test('direct completion/locked URLs never reward; stale sessions recover without erasure',async({page})=>{
  await audioMock(page);await createPlayer(page,'P1-recovery')
  await page.goto('/#/adventure/level/lv_00_tamago/complete')
  await expect(page.getByRole('alert')).toBeVisible();expect(await records(page,'rewardReceipts')).toHaveLength(0)
  await page.goto('/#/adventure/level/lv_10_saidan')
  await expect(page.getByRole('heading',{name:'しんかの祭壇',exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:'開始玩',exact:true})).toHaveCount(0)
  await expect(page.getByRole('button',{name:'開始！',exact:true})).toBeDisabled()
  expect(await records(page,'levelSessions')).toEqual([])
  expect(await records(page,'rewardReceipts')).toHaveLength(0)
  await page.goto('/#/play/kana');const old=await game(page,'kana')
  await page.evaluate(id=>new Promise<void>((resolve,reject)=>{
    const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction('gameCheckpoints','readwrite'),table=tx.objectStore('gameCheckpoints'),get=table.get(id);get.onsuccess=()=>table.put({...get.result,contentVersion:'expired'});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}
  }),old.id)
  await page.reload();await expect(page.getByRole('alert')).toBeVisible()
  await page.getByRole('button',{name:'保留紀錄並開始新練習',exact:true}).click()
  const next=await game(page,'kana');expect(next.id).not.toBe(old.id)
  expect((await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)?.status).toBe('abandoned')
})

for(const mic of ['off','denied','no-device'] as const) test(`L0–L10 complete via actual UI with microphone ${mic} (audio mocked)`,async({page},info)=>{
  test.setTimeout(420_000)
  page.setDefaultTimeout(12_000)
  await audioMock(page,mic);await createPlayer(page,`P1-${mic}`)
  if(mic!=='off')await page.evaluate(()=>new Promise<void>(resolve=>{
    const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction('preferences','readwrite');tx.objectStore('preferences').put({profileId:localStorage.getItem('activeProfileId'),micMode:'offline',enhancedConsent:false});tx.oncomplete=()=>{db.close();resolve()}}
  }))
  await page.reload()
  for(const level of (levelsJson as unknown as LevelsData).levels){
    console.info(`QA ${mic}: ${level.level_id}`)
    await page.goto(`/#/adventure/level/${level.level_id}`)
    for(const challenge of level.challenges.filter(c=>c.required_for_completion!==false)){
      const challengeIndex=level.challenges.findIndex(c=>c.challenge_id===challenge.challenge_id)
      await page.locator('[data-challenge-id]').nth(challengeIndex).getByRole('button').click()
      if(challenge.game_mode==='dakuten_drag'){
        const session=await game(page,'dakuten_drag'),questions=session.checkpoint.questions as {item:{mark_at:number[]};baseChars:string[];targetChars:string[]}[]
        for(const question of questions){
          await page.locator('button[aria-pressed]').click()
          for(const pos of question.item.mark_at){
            const tile=page.getByRole('button',{name:`${question.baseChars[pos]} ${pos+1}`,exact:true})
            await tile.click();await expect(tile).toHaveText(question.targetChars[pos])
          }
          await page.getByRole('button',{name:'下一題',exact:true}).click()
        }
      }else{
        let session=await game(page,'kana_catch')
        const total=session.planned
        for(let i=0;i<total;i++){
          await expect.poll(async()=>{
            session=(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===session.id)!
            return !!session.checkpoint[`q:${i}`]
          }).toBe(true)
          const question=session.checkpoint[`q:${i}`] as {targetId:string;items:{id:string;display:string}[]}
          const target=question.items.find(x=>x.id===question.targetId)!
          console.info(`QA ${level.level_id}/${challenge.challenge_id} q${i+1}/${total}`)
          await page.locator('canvas + div').getByRole('button',{name:target.display,exact:true}).click()
          if(i+1<total)await page.getByRole('button',{name:'下一題 →',exact:true}).click()
        }
      }
      await page.getByRole('button',{name:'回冒險',exact:true}).click()
    }
    await page.getByRole('button',{name:'完成關卡！',exact:true}).click()
    await expect(page).toHaveURL(new RegExp(`${level.level_id}/complete`))
    await expect(page.getByRole('heading',{name:'關卡完成！',exact:true})).toBeVisible()
  }
  expect(await page.evaluate(()=>window.__p1MediaCalls)).toBe(0)
  const levels=await records<{completed_levels:Record<string,unknown>}>(page,'adventureProgress')
  expect(Object.keys(levels.at(-1)!.completed_levels)).toHaveLength(11)
  await page.screenshot({path:info.outputPath(`all-levels-${mic}.png`),fullPage:true})
})

test('storage failure retains pending answer until retry; B starts isolated',async({page},info)=>{
  await audioMock(page);await createPlayer(page,'P1-A');await page.goto('/#/play/kana')
  const a=await game(page,'kana'),rounds=a.checkpoint.rounds as {correct:Kana}[]
  await page.evaluate(()=>{
    const original=IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put=function(value,...args){
      if(this.name==='gameCheckpoints'&&value.attempts?.['q:0']){IDBObjectStore.prototype.put=original;throw new DOMException('QA storage fault','QuotaExceededError')}
      return original.call(this,value,...args)
    }
  })
  await page.getByRole('button',{name:rounds[0].correct.romaji,exact:true}).click()
  await page.getByRole('button',{name:'確認答案',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('還沒存好')
  expect((await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===a.id)?.attempts).toEqual({})
  await page.screenshot({path:info.outputPath('save-failed.png'),fullPage:true})
  await page.getByRole('button',{name:'重試',exact:true}).click()
  await page.getByRole('button',{name:'下一題',exact:true}).click()
  await createPlayer(page,'P1-B');await page.goto('/#/play/kana')
  const b=await game(page,'kana');expect(b.profileId).not.toBe(a.profileId)
  expect(b.attempts).toEqual({})
  expect((await records<{profileId:string}>(page,'playerProgress')).filter(r=>r.profileId===b.profileId)).toEqual([])
  await page.goto('/#/profiles');await page.getByRole('button',{name:'P1-A',exact:true}).click()
  await page.goto('/#/play/kana');await expect(page.getByText('2/10',{exact:true})).toBeVisible()
})

test('20 game entries/leaves release animation frames and timers in the same document',async({page},info)=>{
  test.setTimeout(90_000)
  await audioMock(page)
  await page.addInitScript(()=>{
    const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window)
    const timeout=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window)
    const frames=new Set<number>(),timers=new Set<number>()
    const stacks = new Map<number,string>()
    window.requestAnimationFrame=callback=>{const id=raf(time=>{frames.delete(id);callback(time)});frames.add(id);return id}
    window.cancelAnimationFrame=id=>{frames.delete(id);cancel(id)}
    window.setTimeout=((handler:TimerHandler,ms?:number,...args:unknown[])=>{const id=timeout(()=>{timers.delete(id);if(typeof handler==='function')handler(...args)},ms);timers.add(id);stacks.set(id, `${ms}: ${new Error().stack}`);return id}) as typeof setTimeout
    window.clearTimeout=id=>{timers.delete(Number(id));clear(id)}
    Object.defineProperty(window,'__p1Resources',{value:()=>({frames:frames.size,timers:timers.size,stacks:[...timers].map(id=>stacks.get(id))})})
  })
  await createPlayer(page,'P1-life')
  for(let i=0;i<20;i++){
    await page.evaluate(()=>{location.hash='/play/kana-catch'})
    await expect(page.getByRole('heading',{name:'接住假名！',exact:true}).or(page.locator('canvas'))).toBeVisible()
    if(await page.getByText('怎麼玩？',{exact:true}).isVisible())await page.getByRole('button').nth(1).click()
    const setup=page.getByRole('button').filter({hasText:'平假名'})
    if(await setup.count())await setup.first().click()
    await expect(page.locator('canvas')).toBeVisible()
    await expect.poll(()=>page.evaluate(()=>window.__p1Resources().frames)).toBeGreaterThan(0)
    await page.evaluate(()=>{location.hash='/'})
    await expect(page.getByRole('button',{name:/開始冒險|繼續冒險/})).toBeVisible()
    await expect.poll(()=>page.evaluate(()=>window.__p1Resources().frames)).toBe(0)
  }
  await expect.poll(()=>page.evaluate(()=>window.__p1Resources().timers),{timeout:15000}).toBe(0)
  expect(await page.evaluate(()=>window.__p1MediaCalls)).toBe(0)
  await page.screenshot({path:info.outputPath('lifecycle-return.png'),fullPage:true})
})
declare global {interface Window {__p1Resources:()=>{frames:number;timers:number}}}

test.describe('verified offline application and material pack',()=>{
  test.use({serviceWorkers:'allow'})
  test('download all assets then close page and reopen offline with real WAV playback',async({page,context,browser,browserName},info)=>{
    test.setTimeout(90_000)
    const isolated=await offlineOrigin()
    try {
    await createPlayer(page,'P1-local',isolated.origin)
    await page.getByRole('button',{name:'下載離線教材',exact:true}).click()
    await expect(page.getByText('教材下載完成，可離線練習。',{exact:true})).toBeVisible({timeout:60_000})
    await page.evaluate(async()=>{await navigator.serviceWorker.ready})
    await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true)
    await isolated.stop()
    expect(isolated.listening).toBe(false)
    const negative=await browser.newContext({serviceWorkers:'block'})
    try{await expect((await negative.newPage()).goto(isolated.origin,{timeout:10000})).rejects.toThrow()}finally{await negative.close()}
    // WebKit's offline flag rejects SW responses upstream (#42775). The stopped origin is the real outage for every engine.
    if(browserName!=='webkit')await context.setOffline(true)
    const url=page.url();await page.close()
    const reopened=await context.newPage();await reopened.goto(url)
    await expect(reopened.getByText('教材下載完成，可離線練習。',{exact:true})).toBeVisible()
    const manifest=await reopened.evaluate(async()=>{const res=await fetch('/offline-manifest.json');return res.json()})
    const result=await reopened.evaluate(async assets=>{
      let failures=0
      for(const asset of assets){try{const response=await fetch('/'+asset.path);if(!response.ok||!(await response.arrayBuffer()).byteLength)failures++}catch{failures++}}
      return failures
    },manifest.assets as {path:string}[])
    expect(result).toBe(0)
    await reopened.goto(`${isolated.origin}/#/play/quiz`)
    await reopened.getByRole('button',{name:'再聽一次',exact:true}).click()
    await expect(reopened.locator('.grid button').first()).toBeEnabled({timeout:15000})
    await reopened.screenshot({path:info.outputPath('offline-listen-ready.png'),fullPage:true})
    } finally { await isolated.stop() }
  })
})


test('offline to enhanced requires a new explicit parent consent; denial/cancel never opts in',async({page})=>{
  await audioMock(page);await createPlayer(page,'P1-consent')
  await page.goto('/#/parent')
  for(const digit of ['1','2','3','4'])await page.getByRole('button',{name:digit,exact:true}).click()
  await page.getByRole('button',{name:'離線模式',exact:true}).click()
  await page.getByRole('button',{name:'允許',exact:true}).click()
  await expect(page.getByRole('dialog')).toContainText('無法取得麥克風授權')
  await page.getByRole('button',{name:'取消',exact:true}).click()
  await page.evaluate(()=>Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}}))
  await page.getByRole('button',{name:'離線模式',exact:true}).click()
  await page.getByRole('button',{name:'允許',exact:true}).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button',{name:'線上辨識（選用）',exact:true}).click()
  await expect(page.getByRole('dialog')).toContainText('可能將語音傳送')
  await page.getByRole('button',{name:'取消',exact:true}).click()
  expect((await records<{micMode:string}>(page,'preferences')).at(-1)?.micMode).toBe('offline')
  await page.getByRole('button',{name:'線上辨識（選用）',exact:true}).click()
  await page.getByRole('button',{name:'允許',exact:true}).click()
  await expect.poll(async()=> (await records<{micMode:string;enhancedConsent:boolean}>(page,'preferences')).at(-1)).toMatchObject({micMode:'enhanced',enhancedConsent:true})
})

test('blocked IndexedDB and malformed checkpoints show recovery instead of a blank screen',async({page,context})=>{
  const denied=await context.newPage()
  await denied.addInitScript(()=>{IDBFactory.prototype.open=function(){throw new DOMException('QA storage blocked','SecurityError')}})
  await denied.goto('/#/')
  await expect(denied.getByRole('alert')).toContainText('原有資料仍保留')
  await denied.close()
  await audioMock(page);await createPlayer(page,'P1-bad');await page.goto('/#/play/kana')
  const old=await game(page,'kana')
  await page.evaluate(id=>new Promise<void>(resolve=>{
    const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction('gameCheckpoints','readwrite'),table=tx.objectStore('gameCheckpoints'),read=table.get(id);read.onsuccess=()=>table.put({...read.result,checkpoint:{rounds:null}});tx.oncomplete=()=>{db.close();resolve()}}
  }),old.id)
  await page.reload();await expect(page.getByRole('alert')).toContainText('原有學習紀錄仍保留')
  await page.getByRole('button',{name:'保留紀錄並開始新練習',exact:true}).click()
  await expect(page.locator('[data-game-session-id]')).not.toHaveAttribute('data-game-session-id',old.id)
  expect((await game(page,'kana')).id).not.toBe(old.id)
  expect((await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)?.checkpoint.rounds).toBeNull()
})

test('parent can export preserved legacy-shared data without assigning it to a child',async({page})=>{
  await createPlayer(page,'P1-backup')
  await page.evaluate(()=>new Promise<void>(resolve=>{
    const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction('migrationBackups','readwrite');tx.objectStore('migrationBackups').put({id:'pre-v5',createdAt:1,tables:{progress:[{id:'legacy-qa',correct:3}]},localPreferences:{}});tx.oncomplete=()=>{db.close();resolve()}}
  }))
  await page.goto('/#/parent')
  for(const digit of ['1','2','3','4'])await page.getByRole('button',{name:digit,exact:true}).click()
  const downloadPromise=page.waitForEvent('download')
  await page.getByRole('button',{name:'匯出舊版共用備份',exact:true}).click()
  const download=await downloadPromise
  expect(await download.failure()).toBeNull()
  expect(download.suggestedFilename()).toBe('Japanese101-legacy-shared-backup.json')
  expect(await records(page,'playerProgress')).toEqual([])
  expect((await records<{tables:{progress:{id:string}[]}}>(page,'migrationBackups'))[0].tables.progress[0].id).toBe('legacy-qa')
})

test('catch exit resumes its saved question; explicit mode change preserves history in a new session',async({page})=>{
  await audioMock(page);await createPlayer(page,'P1-free')
  await page.goto('/#/play/kana-catch')
  await page.getByRole('button').filter({hasText:'平假名'}).first().click()
  const old=await game(page,'kana_catch')
  await expect.poll(async()=>!!(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)?.checkpoint['q:0']).toBe(true)
  const question=(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)!.checkpoint['q:0'] as {targetId:string;items:{id:string;display:string}[]}
  const wrong=question.items.find(item=>item.id!==question.targetId)!,correct=question.items.find(item=>item.id===question.targetId)!
  await page.locator('canvas + div').getByRole('button',{name:wrong.display,exact:true}).click()
  await expect.poll(async()=> (await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)?.attempts['q:0']?.firstAnswerCorrect).toBe(false)
  await page.locator('canvas + div').getByRole('button',{name:correct.display,exact:true}).click()
  await page.getByRole('button',{name:'下一題 →',exact:true}).click()
  await page.getByRole('button',{name:'返回',exact:true}).click()
  await expect(page).toHaveURL(/#\/play$/)
  await page.goto('/#/play/kana-catch')
  expect((await game(page,'kana_catch')).id).toBe(old.id)
  await expect(page.getByText('1/10',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'先跳過，稍後複習',exact:true}).click()
  await expect(page.getByText('2/10',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'換模式',exact:true}).click()
  await expect(page.locator('canvas')).toHaveCount(0)
  expect((await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===old.id)).toMatchObject({status:'abandoned',attempts:{'q:0':{firstAnswerCorrect:false,completed:true}}})
  const freshId=await page.locator('[data-game-session-id]').getAttribute('data-game-session-id')
  expect(freshId).not.toBe(old.id)
  await page.evaluate(id=>new Promise<void>(resolve=>{
    const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result,tx=db.transaction('gameCheckpoints','readwrite'),table=tx.objectStore('gameCheckpoints'),read=table.get(id!);read.onsuccess=()=>table.put({...read.result,checkpoint:{gameState:'playing',subMode:'unknown',paramsOverride:{roundLength:0}}});tx.oncomplete=()=>{db.close();resolve()}}
  }),freshId)
  await page.reload();await expect(page.getByRole('alert')).toBeVisible()
  await page.getByRole('button',{name:'重試',exact:true}).click()
  await expect(page.getByRole('button').filter({hasText:'平假名'}).first()).toBeVisible()
})

test('late parent permission from A stops its stream and never enables B',async({page})=>{
  await createPlayer(page,'P1-lateA')
  await page.goto('/#/parent')
  // Use the same document for the pending permission and profile switch.
  await page.evaluate(()=>{
    window.__p1Stopped=0
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>new Promise(resolve=>{window.__p1Release=()=>resolve({getTracks:()=>[{stop(){window.__p1Stopped++}}]})})}})
  })
  for(const digit of ['1','2','3','4'])await page.getByRole('button',{name:digit,exact:true}).click()
  await page.getByRole('button',{name:'離線模式',exact:true}).click()
  await page.getByRole('button',{name:'允許',exact:true}).click()
  await page.evaluate(()=>{location.hash='/profiles/new'})
  await page.locator('#profile-name').fill('P1-lateB');await page.locator('button').last().click()
  await expect(page).toHaveURL(/#\/$/)
  await page.evaluate(()=>window.__p1Release())
  await expect.poll(()=>page.evaluate(()=>window.__p1Stopped)).toBe(1)
  await page.evaluate(()=>{location.hash='/parent'})
  for(const digit of ['1','2','3','4'])await page.getByRole('button',{name:digit,exact:true}).click()
  await expect(page.getByText('言靈遊戲不可使用',{exact:true})).toBeVisible()
  const active=await page.evaluate(()=>localStorage.getItem('activeProfileId'))
  expect((await records<{profileId:string;micMode:string}>(page,'preferences')).find(p=>p.profileId===active)?.micMode??'off').toBe('off')
})
declare global {interface Window {__p1Release:()=>void;__p1Stopped:number}}

test('keyboard can confirm a choice and place every required dakuten mark',async({page},info)=>{
  await audioMock(page);await createPlayer(page,'P1-keys');await page.goto('/#/play/kana')
  const kana=await game(page,'kana'),rounds=kana.checkpoint.rounds as {correct:Kana}[]
  const choice=page.getByRole('button',{name:rounds[0].correct.romaji,exact:true})
  await choice.focus();await page.keyboard.press('Enter');await expect(choice).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'確認答案',exact:true}).focus();await page.keyboard.press('Space')
  await page.getByRole('button',{name:'下一題',exact:true}).focus();await page.keyboard.press('Enter')
  await expect(page.getByText('2/10',{exact:true})).toBeVisible()
  await page.goto('/#/play/dakuten-drag')
  const drag=await game(page,'dakuten_drag'),questions=drag.checkpoint.questions as {item:{mark_at:number[]};baseChars:string[];targetChars:string[]}[]
  const symbol=page.locator('button[aria-pressed]');await symbol.focus();await page.keyboard.press('Enter')
  await expect(symbol).toHaveAttribute('aria-pressed','true')
  for(const pos of questions[0].item.mark_at){
    const tile=page.getByRole('button',{name:`${questions[0].baseChars[pos]} ${pos+1}`,exact:true})
    await tile.focus();await page.keyboard.press('Space');await expect(tile).toHaveText(questions[0].targetChars[pos])
  }
  await page.getByRole('button',{name:'下一題',exact:true}).focus()
  await page.screenshot({path:info.outputPath('keyboard-dakuten-next.png'),fullPage:true})
  await page.keyboard.press('Enter');await expect(page.getByText(`2/${questions.length}`,{exact:true})).toBeVisible()
})

test('level settlement failure shows recovery and never celebrates or pays before commit',async({page},info)=>{
  await audioMock(page);await createPlayer(page,'P1-final')
  await page.goto('/#/adventure/level/lv_00_tamago')
  await page.locator('[data-challenge-id="c1_listen_basic"]').getByRole('button').click()
  const session=await game(page,'kana_catch')
  for(let i=0;i<session.planned;i++){
    await expect.poll(async()=>!!(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===session.id)?.checkpoint[`q:${i}`]).toBe(true)
    const current=(await records<GameCheckpoint>(page,'gameCheckpoints')).find(s=>s.id===session.id)!.checkpoint[`q:${i}`] as {targetId:string;items:{id:string;display:string}[]}
    await page.locator('canvas + div').getByRole('button',{name:current.items.find(x=>x.id===current.targetId)!.display,exact:true}).click()
    if(i+1<session.planned)await page.getByRole('button',{name:'下一題 →',exact:true}).click()
  }
  await page.getByRole('button',{name:'回冒險',exact:true}).click()
  const before=(await records<{petId:string;xp:number}>(page,'pets')).find(p=>p.petId===session.profileId)!.xp
  await page.evaluate(()=>{
    const original=IDBObjectStore.prototype.add
    IDBObjectStore.prototype.add=function(value,...args){
      if(this.name==='rewardReceipts'&&String(value.id).startsWith('level:')){IDBObjectStore.prototype.add=original;throw new DOMException('QA settlement fault','QuotaExceededError')}
      return original.call(this,value,...args)
    }
  })
  await page.getByRole('button',{name:'完成關卡！',exact:true}).click()
  await expect(page).toHaveURL(/lv_00_tamago\/complete/)
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('heading',{name:'關卡完成！',exact:true})).toHaveCount(0)
  expect((await records<{petId:string;xp:number}>(page,'pets')).find(p=>p.petId===session.profileId)!.xp).toBe(before)
  expect((await records<{id:string}>(page,'rewardReceipts')).filter(r=>r.id.startsWith('level:'))).toHaveLength(0)
  await page.screenshot({path:info.outputPath('settlement-failed-no-reward.png'),fullPage:true})
  await page.getByRole('button',{name:'重試',exact:true}).click()
  await expect(page.getByRole('heading',{name:'關卡完成！',exact:true})).toBeVisible()
  expect((await records<{id:string}>(page,'rewardReceipts')).filter(r=>r.id.startsWith('level:'))).toHaveLength(1)
  await page.goto('/#/adventure/level/lv_00_tamago')
  await expect(page.getByText('+40–55',{exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:'開始！',exact:true})).toBeDisabled()
  await expect(page.getByRole('button',{name:'完成關卡！',exact:true})).toHaveCount(0)
  await page.screenshot({path:info.outputPath('replay-reward-preview.png'),fullPage:true})
})
