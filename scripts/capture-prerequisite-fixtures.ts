/** Isolated QA only: capture genuine UI actions from the explicitly frozen old draft versions. */
import {preview} from 'vite'
import {chromium,expect} from '@playwright/test'
import {readFile,writeFile} from 'node:fs/promises'
import {teach,queueQuestions} from '../e2e/helpers/unitJourney'
import type {UnitPack} from '../src/content/contracts'
const versions:Record<string,string>={U01:'u01-2-draft',U06:'u06-1-draft'}
const server=await preview({preview:{host:'127.0.0.1',port:4263,strictPort:true}}),browser=await chromium.launch()
try{
 for(const id of process.argv.slice(2).length?process.argv.slice(2):Object.keys(versions)){
  const pack=JSON.parse(await readFile(`src/content/packs/${id.toLowerCase()}.json`,'utf8')) as UnitPack
  if(pack.version!==versions[id])throw new Error('This capture requires the frozen old source and matching old build')
  const context=await browser.newContext({baseURL:'http://127.0.0.1:4263',serviceWorkers:'block'}),page=await context.newPage()
  try{
   await page.goto(`/#/preview/adventure?unit=${id}&scene=dojo`);await teach(page,pack)
   const questions=pack.questions.filter(q=>q.typeId==='T01').slice(0,4)
   if(questions.length!==4)throw new Error('Four actual authored questions required')
   await queueQuestions(page,id,questions.map(q=>q.id));await page.getByRole('button',{name:'練習對戰',exact:true}).click()
   for(const q of questions){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await page.getByRole('button',{name:'繼續',exact:true}).click()
   }
   await page.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click()
   await expect(page.getByRole('button',{name:'地點清單',exact:true})).toBeVisible()
   await page.goto(`/#/preview/adventure?unit=${id}&scene=shop`)
   const hat=page.locator('article').filter({has:page.getByRole('heading',{name:'旅行帽',exact:true})})
   await hat.getByRole('button',{name:'購買並裝備',exact:true}).click();await expect(hat.getByText('已裝備',{exact:true})).toBeVisible()
   await page.goto(`/#/preview/adventure?unit=${id}&scene=dojo`);await page.getByRole('button',{name:'練習對戰',exact:true}).click();await expect(page.getByRole('button',{name:'普通攻擊',exact:true})).toBeVisible()
   await page.goto('/#/parent');for(const d of '1234')await page.getByRole('button',{name:d,exact:true}).click()
   const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'匯出完整備份',exact:true}).click()
   const file=await downloading,backup=JSON.parse(await readFile((await file.path())!,'utf8'))
   const plan=backup.payload.tables.studyPlans.find((p:{unitId:string})=>p.unitId===id)
   if(plan?.contentVersion!==versions[id]||backup.payload.tables.learningAttempts.length!==4||backup.payload.tables.coinWallets[0]?.balance!==20)throw new Error('Old UI state did not meet the fixture invariants')
   if(!backup.payload.tables.battleSessions.some((b:{phase:string})=>b.phase!=='finished'))throw new Error('Unfinished battle missing from old fixture')
   const build=await page.evaluate(async()=>fetch('/version.json').then(r=>r.json()))
   await writeFile(`docs/phases/P4/evidence/prerequisite-${id.toLowerCase()}-old.json`,JSON.stringify({provenance:{kind:'isolated automated UI fixture, not a human test or content approval',build,unitId:id,contentVersion:pack.version,steps:'Teach actual cards, answer four actual T01 items, win 60 coins, buy/equip 40-coin hat, start unfinished battle, parent PIN full export'},backup},null,2)+'\n',{flag:'wx'})
   console.log(`Frozen ${id} ${pack.version}: four real automated answers, 20 earned coins, equipped hat, unfinished battle`)
  }finally{await context.close()}
 }
}finally{await browser.close();server.httpServer.close()}
