import {test,expect} from '@playwright/test'
import {prepareFixture} from '../scripts/usability-fixture.mjs'
import {records} from './helpers/unitJourney'
import type {StudyPlan} from '../src/db/journey-models'
test('isolated rehearsal starts with affordable synthetic coins and no invented learning, then purchases atomically',async({page,baseURL,browser})=>{
  const marker=await prepareFixture(page,{origin:baseURL!,code:'C2'})
  expect(marker).toMatchObject({mode:'ENGINEERING_REHEARSAL',humanTrial:'NOT_RUN',participantCode:'C-2',gradeBand:3,openingCoins:40,learningAttemptsSeeded:0})
  expect(await records(page,'learningAttempts')).toEqual([])
  expect(await records(page,'coinLedger')).toEqual([])
  expect((await records<StudyPlan>(page,'studyPlans')).every(p=>p.gradeBand===3&&!p.taughtCards.length&&Object.keys(p.taughtAt).length===0)).toBe(true)
  const state=await page.context().storageState({indexedDB:true}),restored=await browser.newContext({storageState:state})
  try{
    const resumed=await restored.newPage();await resumed.goto(`${baseURL}/#/preview/adventure?scene=shop`)
    const hat=resumed.locator('article').filter({has:resumed.getByRole('heading',{name:'旅行帽',exact:true})})
    await hat.getByRole('button',{name:'購買並裝備',exact:true}).click()
    await expect(hat.getByRole('button',{name:'卸下',exact:true})).toBeVisible()
    expect(await records(resumed,'coinWallets')).toEqual([{profileId:'player',balance:0}])
    expect(await records(resumed,'purchaseReceipts')).toHaveLength(1)
    expect(await records(resumed,'learningAttempts')).toEqual([])
    // The original fresh rehearsal context remains unchanged by its saved-state copy.
    expect(await records(page,'coinWallets')).toEqual([{profileId:'player',balance:40}])
    await expect(prepareFixture(page,{origin:baseURL!,code:'A2'})).rejects.toThrow('fresh empty context')
    expect(await records(page,'coinWallets')).toEqual([{profileId:'player',balance:40}])
  }finally{await restored.close()}
})
test('fixture refuses a real teaching record and rejects names or external origins',async({page,baseURL})=>{
  await expect(prepareFixture(page,{origin:'https://example.com',code:'A1'})).rejects.toThrow('dedicated local preview')
  await expect(prepareFixture(page,{origin:baseURL!,code:'child-name'})).rejects.toThrow('anonymous slot')
  await page.goto('/#/preview/adventure?scene=learn')
  await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click()
  await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
  const before=await records(page,'studyPlans')
  await expect(prepareFixture(page,{origin:baseURL!,code:'B1'})).rejects.toThrow('fresh empty context')
  expect(await records(page,'studyPlans')).toEqual(before)
  expect(await records(page,'coinWallets')).toEqual([])
})
