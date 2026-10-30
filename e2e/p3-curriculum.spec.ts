import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import type {UnitPack,Attempt} from '../src/content/contracts'
import type {BattleSession,StudyPlan} from '../src/db/journey-models'
import {records,teach,queueQuestions} from './helpers/unitJourney'
const packs=await Promise.all(['u01','u02','u03','u04'].map(async id=>JSON.parse(await readFile(`src/content/packs/${id}.json`,'utf8')) as UnitPack))
test('the four actual units preserve separate unfinished battles and teaching while switching and reloading',async({page})=>{
  test.setTimeout(90000)
  for(const pack of packs){
    await page.goto(`/#/preview/adventure?unit=${pack.id}&scene=dojo`)
    await teach(page,pack)
    const q=pack.questions.find(q=>q.typeId==='T03')!
    const queue=[q.id,...pack.questions.filter(x=>x.partition==='practice'&&x.id!==q.id).slice(0,2).map(x=>x.id)]
    await queueQuestions(page,pack.id,queue)
    await page.getByRole('button',{name:'練習對戰',exact:true}).click()
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    await expect(page.getByText(q.prompt,{exact:true})).toBeVisible()
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  }
  const battles=await records<BattleSession>(page,'battleSessions'),attempts=await records<Attempt>(page,'learningAttempts'),plans=await records<StudyPlan>(page,'studyPlans')
  expect(battles).toHaveLength(4);expect(attempts).toHaveLength(4)
  for(const pack of packs){
    const battle=battles.find(b=>b.unitId===pack.id)!
    expect(battle).toMatchObject({phase:'feedback',enemyHp:22,playerHp:36})
    expect(attempts.find(a=>a.sessionId===battle.id)?.itemId).toBe(pack.questions.find(q=>q.typeId==='T03')!.itemId)
    expect(plans.find(p=>p.unitId===pack.id)?.taughtCards).toHaveLength(pack.teaching.length)
    await page.goto(`/#/preview/adventure?unit=${pack.id}&scene=dojo`)
    await page.getByRole('button',{name:'繼續挑戰',exact:true}).click();await page.reload()
    await expect(page.getByText(pack.questions.find(q=>q.typeId==='T03')!.prompt,{exact:true})).toBeVisible()
    await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  }
  expect(await records(page,'learningAttempts')).toHaveLength(4)
})
