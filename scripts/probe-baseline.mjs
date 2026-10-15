import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
const out = 'docs/verification/evidence/P0'
const levels = JSON.parse(readFileSync('data/levels.json','utf8')).levels
const browser = await chromium.launch()
const observations = []
const url = 'http://127.0.0.1:4173'
async function open() {
  const context = await browser.newContext({ serviceWorkers: 'block' })
  await context.addInitScript(() => { localStorage.setItem('uiLang','zh'); localStorage.setItem('micMode','off') })
  return { context, page: await context.newPage() }
}
async function records(page, name) {
  return page.evaluate(name => new Promise((resolve,reject) => {
    const req = indexedDB.open('Japanese101DB')
    req.onsuccess = () => { const db = req.result; const read = db.transaction(name).objectStore(name).getAll(); read.onsuccess=()=>{ resolve(read.result); db.close() }; read.onerror=()=>reject(read.error) }
    req.onerror=()=>reject(req.error)
  }), name)
}
try {
  // F-02: click the actual free-play comparison entry.
  {
    const { context, page } = await open(); const errors = []
    page.on('pageerror', e=>errors.push(e.message))
    await page.goto(`${url}/#/play/kana-catch`)
    await page.getByRole('button', { name: /ねこ 與 ねっこ/ }).first().click()
    await page.waitForTimeout(700)
    observations.push({ id:'F-02', method:'UI comparison sokuon first matching entry', errors, text:await page.locator('body').innerText() })
    await page.screenshot({path:`${out}/F02.png`,fullPage:true}); await context.close()
  }
  // F-06: isolated context with no answers, direct completion URL.
  {
    const { context, page } = await open()
    await page.goto(`${url}/#/adventure/level/${levels[0].level_id}/complete`)
    await page.waitForTimeout(800)
    observations.push({ id:'F-06', method:'fresh context direct completion with no session', progress:await records(page,'adventureProgress'), pets:await records(page,'pets') })
    await page.screenshot({path:`${out}/F06.png`,fullPage:true}); await context.close()
  }
  // F-03: explicitly seed synthetic A progress/session, select B through the UI.
  {
    const { context, page } = await open(); await page.goto(`${url}/#/`)
    await page.evaluate(() => new Promise((resolve,reject)=> {
      const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result;const tx=db.transaction(['profiles','sessions','progress'],'readwrite');
        for(const id of ['qaA','qaB'])tx.objectStore('profiles').put({profile_id:id,name:id,avatar_emoji:'🦊',created_at:1,last_played:1})
        tx.objectStore('sessions').put({id:'QA-A-session',date:Date.now(),durationMs:60000,feature:'kana',correct:3,total:5})
        tx.objectStore('progress').put({id:'QA-A-item',type:'kana',correct:3,incorrect:2,lastSeen:Date.now(),nextReview:Date.now(),streak:0})
        tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)
      };req.onerror=()=>reject(req.error)
    }))
    await page.goto(`${url}/#/profiles`);await page.getByRole('button',{name:'qaB',exact:true}).click()
    await page.goto(`${url}/#/parent`)
    for(const digit of ['1','2','3','4'])await page.getByRole('button',{name:digit,exact:true}).click()
    await page.waitForTimeout(400)
    observations.push({id:'F-03',method:'synthetic shared-schema A fixtures; UI switches to B then parent report',active:await page.evaluate(()=>localStorage.getItem('activeProfileId')),text:await page.locator('body').innerText()})
    await page.screenshot({path:`${out}/F03.png`,fullPage:true});await context.close()
  }
  // F-05: synthetic prerequisite progress avoids completing real legacy games.
  {
    const { context, page } = await open();await page.goto(`${url}/#/`)
    await page.getByRole('button',{name:'開始冒險！',exact:true}).waitFor(); await page.waitForTimeout(300)
    await page.evaluate(levels=>new Promise(resolve=>{const req=indexedDB.open('Japanese101DB');req.onsuccess=()=>{const db=req.result;const tx=db.transaction('adventureProgress','readwrite');tx.objectStore('adventureProgress').put({id:'player',current_level_id:'lv_10_saidan',completed_levels:Object.fromEntries(levels.slice(0,-1).map(l=>[l.level_id,{completed_at:new Date().toISOString(),stars:1,best_accuracy:0,times_played:1}])),unlocked_regions:[],collected_medals:[]});tx.oncomplete=()=>{db.close();resolve()}}}),levels)
    await page.goto(`${url}/#/adventure/level/lv_10_saidan`)
    await page.getByRole('button',{name:'開始玩',exact:true}).last().click()
    await page.waitForTimeout(500)
    observations.push({id:'F-05',method:'L10 unlocked fixture; mic=off; click required voice challenge',url:page.url(),text:await page.locator('body').innerText()})
    await page.screenshot({path:`${out}/F05.png`,fullPage:true});await context.close()
  }
  // Dialog failure uses only mocked endpoint, never real credentials or cloud data.
  {
    const { context,page }=await open();await page.route('**/api/auth/login',r=>r.fulfill({status:401,contentType:'application/json',body:'{}'}))
    await page.goto(`${url}/#/`);await page.getByRole('button',{name:'雲端同步',exact:true}).click()
    const inputs=page.locator('input');await inputs.nth(0).fill('qa');await inputs.nth(1).fill('synthetic')
    await page.getByRole('button',{name:'登入',exact:true}).click();await page.waitForTimeout(300)
    observations.push({id:'SYNC-ERROR',method:'mock 401; synthetic credentials',text:await page.locator('body').innerText()})
    await page.screenshot({path:`${out}/sync-error.png`,fullPage:true});await page.getByRole('button',{name:'關閉',exact:true}).click();await context.close()
  }
} finally { writeFileSync(`${out}/probes.json`,JSON.stringify({browser:browser.version(),runtimeBase:'9100671',observations},null,2)+'\n');await browser.close() }
