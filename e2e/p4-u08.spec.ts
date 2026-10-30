import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import type {UnitPack,Attempt} from '../src/content/contracts'
import type {BattleSession} from '../src/db/journey-models'
import {offlineOrigin} from './helpers/offlineOrigin'
import {records,teach,play,queueQuestions} from './helpers/unitJourney'
const pack=JSON.parse(await readFile('src/content/packs/u08.json','utf8')) as UnitPack
test('U08 four strands save real attempts, retain illustrated feedback and export into the correct parent unit',async({page})=>{
  test.setTimeout(60000)
  await page.goto('/#/preview/adventure?unit=U08&scene=dojo');await teach(page,pack)
  // Isolated test queue selects one item in each strand; teaching and all answers use the actual UI.
  const queue=['T03','T05','T08','T11'].map(type=>pack.questions.find(q=>q.typeId===type)!.id)
  await queueQuestions(page,pack.id,queue)
  await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  for(let n=0;n<queue.length;n++){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    const q=pack.questions.find(q=>q.id===queue[n])!
    await expect(page.getByText(q.prompt,{exact:true})).toBeVisible()
    if(n===1){for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:width===768?1024:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`docs/phases/P4/evidence/u08-context-${width}.png`,fullPage:true})}}
    if(q.audioPolicy==='required')await play(page)
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
    if(n===1){await page.reload();await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()}
    await page.getByRole('button',{name:'繼續',exact:true}).click()
  }
  const attempts=await records<Attempt>(page,'learningAttempts');expect(attempts).toHaveLength(4);expect(attempts.every(a=>a.outcome==='correct'&&!a.hintUsed)).toBe(true)
  await page.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click()
  await page.getByRole('button',{name:'家長區',exact:true}).click();for(const digit of '1234')await page.getByRole('button',{name:digit,exact:true}).click()
  await page.getByLabel('報告教材',{exact:true}).selectOption('U08')
  await expect(page.getByText('已提交 4；首次獨立答對 4；用過提示 0；跳過 0；五題小節 0。',{exact:true})).toBeVisible()
  await expect(page.getByRole('link',{name:'到道館練習',exact:true}).first()).toHaveAttribute('href','#/preview/adventure?unit=U08&scene=dojo')
  await page.getByLabel('報告教材',{exact:true}).selectOption('U01');await expect(page.getByText('已提交 0；首次獨立答對 0；用過提示 0；跳過 0；五題小節 0。',{exact:true})).toBeVisible()
  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'匯出這位玩家的冒險紀錄',exact:true}).click();const file=await downloading
  const saved=JSON.parse(await readFile((await file.path())!,'utf8'));expect(saved.data.battles.some((b:BattleSession)=>b.unitId==='U08')).toBe(true);expect(saved.data.attempts).toHaveLength(4)
})
test('U08 reviewer can play all six real listening tracks without creating learner answers',async({page})=>{
  test.setTimeout(60000);await page.goto('/#/__review/content?unit=U08')
  await expect(page.getByLabel('選擇題目',{exact:true}).getByRole('option')).toHaveCount(65)
  for(const track of pack.listening){
    const q=pack.questions.find(q=>q.audioId===track.id)!
    await page.getByLabel('選擇題目',{exact:true}).selectOption(q.id);await play(page)
  }
  expect(await records(page,'learningAttempts')).toEqual([])
})
test.describe('U08 complete offline pack',()=>{
  test.use({serviceWorkers:'allow'})
  test('download includes new artwork, then a stopped origin can cold-open U08 teaching, illustration and listening',async({page,context,browserName})=>{
    test.setTimeout(120000);const origin=await offlineOrigin()
    try{
      await page.goto(`${origin.origin}/#/preview/adventure?unit=U08`)
      await page.getByRole('button',{name:'旅行手帳',exact:true}).click();await page.getByRole('button',{name:'下載離線教材',exact:true}).click()
      await expect(page.getByText('教材下載完成，可離線練習。',{exact:true})).toBeVisible({timeout:60000});await page.keyboard.press('Escape')
      await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true)
      await origin.stop();if(browserName!=='webkit')await context.setOffline(true)
      await page.close();const cold=await context.newPage();await cold.goto(`${origin.origin}/#/preview/adventure?unit=U08&scene=learn`)
      await expect(cold.getByRole('heading',{name:'來去與步行',exact:true})).toBeVisible();await play(cold)
      await cold.goto(`${origin.origin}/#/__review/content?unit=U08`)
      const q=pack.questions.find(q=>q.typeId==='T13')!;await cold.getByLabel('選擇題目',{exact:true}).selectOption(q.id)
      expect(await cold.evaluate(async src=>{const res=await fetch(src);return res.ok&&(await res.blob()).size>100000},q.image!.src)).toBe(true)
      await expect(cold.getByRole('img',{name:q.image!.alt.zh,exact:true})).toBeVisible();await play(cold)
      expect(await records(cold,'learningAttempts')).toEqual([])
    }finally{await origin.stop()}
  })
})


test('U08 illustrated transport-match practice gives a relevant hint and retains hinted evidence',async({page})=>{
  test.setTimeout(45000);await page.setViewportSize({width:768,height:1024})
  await page.goto('/#/preview/adventure?unit=U08&scene=dojo');await teach(page,pack)
  const q=pack.questions.find(q=>q.typeId==='T13')!
  await queueQuestions(page,pack.id,[q.id])
  await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
  await page.getByRole('button',{name:'收合對戰場景',exact:true}).click()
  await expect(page.getByRole('img',{name:q.image!.alt.zh,exact:true})).toBeVisible()
  await page.getByRole('button',{name:'看看提示',exact:true}).click()
  await expect(page.getByText(q.hint,{exact:true})).toBeVisible()
  await play(page)
  await page.screenshot({path:'docs/phases/P4/evidence/u08-transport-match-hint-768.png',fullPage:true})
  await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
  await page.getByRole('button',{name:'確認答案',exact:true}).click()
  await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  const attempts=await records<Attempt>(page,'learningAttempts')
  expect(attempts).toHaveLength(1);expect(attempts[0]).toMatchObject({hintUsed:true,outcome:'correct',audioPlayCount:1})
})

test('U08 four actual vehicle crops remain complete and separately recognizable',async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await page.goto('/#/__review/content?unit=U08')
 for(const q of pack.questions.filter(q=>q.typeId==='T13')){
  await page.getByLabel('選擇題目',{exact:true}).selectOption(q.id)
  const frame=page.getByRole('img',{name:q.image!.alt.zh,exact:true}),rect=await frame.boundingBox()
  expect(rect).not.toBeNull();expect(rect!.width/rect!.height).toBeCloseTo(1,2)
  await frame.screenshot({path:`docs/phases/P4/evidence/u08-frame-${q.image!.cell}-${browserName}.png`})
 }
})
test('U08 transport grammar uses the taught kana and saves the actual method answer',async({page})=>{
 const q=pack.questions.find(q=>q.itemFamilyId==='U08-F-transport-slot')!
 expect(q.prompt).toMatch(/^「でんしゃ（/);expect(q.prompt).not.toContain('「電車')
 await page.goto('/#/preview/adventure?unit=U08&scene=dojo');await teach(page,pack)
 await queueQuestions(page,pack.id,[q.id]);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
 await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
 await expect(page.getByText(q.prompt,{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'で',exact:true}).click()
 await page.getByRole('button',{name:'確認答案',exact:true}).click()
 await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
 expect(await records<Attempt>(page,'learningAttempts')).toEqual([expect.objectContaining({primarySkillId:'G23',outcome:'correct',hintUsed:false})])
})
