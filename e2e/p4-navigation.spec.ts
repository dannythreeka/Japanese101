import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import type {UnitPack} from '../src/content/contracts'
import type {CoinLedger} from '../src/db/journey-models'
import {teach,queueQuestions,records} from './helpers/unitJourney'
const pack=JSON.parse(await readFile('src/content/packs/u02.json','utf8')) as UnitPack

test('leaving for the parent area during reward commit never lets the old journey redirect back',async({page})=>{
  test.setTimeout(60000)
  await page.goto('/#/preview/adventure?unit=U02&scene=dojo');await teach(page,pack)
  const questions=pack.questions.filter(q=>q.partition==='practice'&&q.kind==='choice').slice(0,4)
  await queueQuestions(page,pack.id,questions.map(q=>q.id))
  await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  for(const q of questions){
    await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
    await page.getByRole('button',{name:'繼續',exact:true}).click()
  }
  // Hold a real reward transaction open with reads; do not fake a saved receipt or replace the repository.
  await page.evaluate(()=>{
    const state=window as typeof window&{rewardHeld?:boolean;releaseReward?:()=>void}
    const original=IDBObjectStore.prototype.add
    IDBObjectStore.prototype.add=function(...args:Parameters<IDBObjectStore['add']>){
      const request=original.apply(this,args)
      if(this.name==='coinLedger'){
        IDBObjectStore.prototype.add=original
        state.rewardHeld=true;let hold=true;state.releaseReward=()=>{hold=false}
        const keepAlive=()=>{const read=this.get('__test_hold__');read.onsuccess=()=>{if(hold)keepAlive()}}
        keepAlive()
      }
      return request
    }
  })
  await page.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).click()
  await expect.poll(()=>page.evaluate(()=>(window as typeof window&{rewardHeld?:boolean}).rewardHeld)).toBe(true)
  await page.getByRole('button',{name:'家長區',exact:true}).click()
  await expect(page).toHaveURL(/#\/parent$/)
  await expect(page.getByRole('button',{name:'1',exact:true})).toBeVisible()
  await page.evaluate(()=>(window as typeof window&{releaseReward?:()=>void}).releaseReward?.())
  await expect.poll(async()=>(await records<CoinLedger>(page,'coinLedger')).filter(l=>l.kind==='reward').length).toBe(1)
  await expect(page).toHaveURL(/#\/parent$/)
  for(const digit of '1234')await page.getByRole('button',{name:digit,exact:true}).click()
  await expect(page.getByLabel('報告教材',{exact:true})).toBeVisible()
  await page.reload();await expect(page).toHaveURL(/#\/parent$/)
  expect((await records<CoinLedger>(page,'coinLedger')).filter(l=>l.kind==='reward')).toHaveLength(1)
  expect(await records(page,'learningAttempts')).toHaveLength(4)
})
