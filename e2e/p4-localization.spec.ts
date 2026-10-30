import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import {records,teach,queueQuestions,play} from './helpers/unitJourney'
import type {UnitPack,Attempt} from '../src/content/contracts'
const pack=JSON.parse(await readFile('src/content/packs/u08.json','utf8')) as UnitPack
test('U08 Japanese teaching and sister-setting question retain the instruction and preserve one answer across language changes',async({page,browserName})=>{
 test.setTimeout(60000);await page.setViewportSize({width:768,height:1024})
 await page.goto('/#/preview/adventure?unit=U08&scene=learn')
 const card=pack.teaching.find(c=>c.grammarIds?.includes('G23'))!
 await page.getByRole('navigation',{name:'認識新內容',exact:true}).getByRole('button').nth(pack.teaching.indexOf(card)).click()
 await page.getByRole('button',{name:'日本語',exact:true}).click()
 await expect(page.getByText(card.bodyJa!,{exact:true})).toBeVisible()
 await expect(page.getByText(card.translationJa!,{exact:true})).toBeVisible()
 await page.screenshot({path:`docs/phases/P4/evidence/localization-u08-teaching-${browserName}-768.png`,fullPage:true})
 await page.getByRole('button',{name:'繁體中文',exact:true}).click()
 await page.getByRole('button',{name:'返回',exact:true}).first().click();await teach(page,pack)
 const q=pack.questions.find(q=>q.id==='U08-Q47')!
 await queueQuestions(page,pack.id,[q.id]);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
 await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
 const choice=page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true})
 await choice.click();await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeDisabled()
 await page.getByRole('button',{name:'日本語',exact:true}).click()
 expect(q.promptJa).toContain('あねと')
 await expect(page.getByRole('heading',{name:q.promptJa,exact:true})).toBeVisible()
 await expect(choice).toHaveAttribute('aria-pressed','true')
 await page.getByRole('button',{name:'おとをきく',exact:true}).click()
 await expect(page.getByRole('button',{name:'おとをとめる',exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:'おとをきく',exact:true})).toBeVisible({timeout:15000})
 await page.screenshot({path:`docs/phases/P4/evidence/localization-u08-context-${browserName}-768.png`,fullPage:true})
 await page.getByRole('button',{name:'こたえをきめる',exact:true}).click()
 await expect(page.getByRole('heading',{name:'せいかい。ポイントをおぼえよう。',exact:true})).toBeVisible()
 await expect(page.getByText(q.explanationJa!,{exact:true})).toBeVisible()
 const attempts=await records<Attempt>(page,'learningAttempts')
 expect(attempts).toEqual([expect.objectContaining({itemVersion:'2',answerIds:q.answer,outcome:'correct',audioPlayCount:1})])
 await page.getByRole('button',{name:'繁體中文',exact:true}).click();await page.reload()
 await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual(attempts)
})
test('Chinese answer language is explicit in Japanese mode, the saved feedback and a replay after refresh',async({page,browserName})=>{
 await page.setViewportSize({width:768,height:1024});await page.goto('/#/preview/adventure?unit=U08&scene=dojo');await teach(page,pack)
 const q=pack.questions.find(q=>q.id==='U08-Q09')!,answer=q.choices.find(c=>c.id===q.answer[0])!
 await queueQuestions(page,pack.id,[q.id]);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
 await page.getByRole('button',{name:'普通攻擊',exact:true}).click();await page.getByRole('button',{name:'日本語',exact:true}).click()
 const choice=page.getByRole('button',{name:answer.text,exact:true})
 await expect(choice.locator('span[lang="zh-Hant"]')).toHaveText(answer.text)
 await choice.click();await page.getByRole('button',{name:'こたえをきめる',exact:true}).click()
 await expect(page.getByRole('heading',{name:'せいかい。ポイントをおぼえよう。',exact:true})).toBeVisible()
 const copies=page.getByText(answer.text,{exact:true});await expect(copies).toHaveCount(3)
 expect(await copies.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('lang')))).toEqual(['zh-Hant','zh-Hant','zh-Hant'])
 await page.screenshot({path:`docs/phases/P4/evidence/localization-u08-feedback-${browserName}-768.png`,fullPage:true})
 const attempts=await records(page,'learningAttempts');await page.reload()
 await expect(page.getByRole('heading',{name:'せいかい。ポイントをおぼえよう。',exact:true})).toBeVisible()
 expect(await records(page,'learningAttempts')).toEqual(attempts)
})
test('a Japanese ordering question keeps its specified order and marks the chosen words and feedback correctly',async({page})=>{
 await page.goto('/#/preview/adventure?unit=U08&scene=dojo');await teach(page,pack)
 const q=pack.questions.find(q=>q.id==='U08-Q23')!
 await queueQuestions(page,pack.id,[q.id]);await page.getByRole('button',{name:'練習對戰',exact:true}).click()
 await page.getByRole('button',{name:'普通攻擊',exact:true}).click();await page.getByRole('button',{name:'日本語',exact:true}).click()
 await expect(page.getByRole('heading',{name:q.promptJa,exact:true})).toBeVisible()
 const available=page.getByRole('group',{name:'えらべることば',exact:true})
 for(const id of q.answer){const text=q.choices.find(c=>c.id===id)!.text;await available.getByRole('button',{name:text,exact:true}).click()}
 const selected=page.getByRole('group',{name:'ならべたことば',exact:true})
 expect(await selected.locator('span[lang]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('lang')))).toEqual(['ja','ja','ja'])
 await page.getByRole('button',{name:'こたえをきめる',exact:true}).click()
 await expect(page.getByRole('heading',{name:'せいかい。ポイントをおぼえよう。',exact:true})).toBeVisible()
 const attempts=await records<Attempt>(page,'learningAttempts');expect(attempts).toEqual([expect.objectContaining({answerIds:q.answer,outcome:'correct'})])
})
test('the revised Q47 can be reviewed with its actual audio without creating an answer',async({page})=>{
 // Full stop-origin cold boot is separately exercised by p4-u08; this is an online review check.
 const q=pack.questions.find(q=>q.id==='U08-Q47')!
 await page.goto('/#/__review/content?unit=U08');await page.getByLabel('選擇題目',{exact:true}).selectOption(q.id)
 await expect(page.getByRole('heading',{name:`${q.id} v2 · ${q.primarySkillId} · ${q.itemFamilyId}`,exact:true})).toBeVisible()
 await expect(page.getByText(q.prompt,{exact:true})).toBeVisible()
 await expect(page.getByText(q.promptJa!,{exact:true})).toBeVisible();await play(page)
 expect(await records(page,'learningAttempts')).toEqual([])
})
