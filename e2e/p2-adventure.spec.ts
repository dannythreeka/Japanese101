import { test, expect, type Page } from '@playwright/test'
import pack from '../src/content/packs/u01.json' with {type:'json'}
import type { BattleSession, CoinLedger, InventoryItem, WorldCheckpoint } from '../src/db/journey-models'
import type { Attempt } from '../src/content/contracts'

async function records<T>(page:Page,store:string):Promise<T[]> {
  return page.evaluate(store=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('Japanese101DB');request.onerror=()=>reject(request.error)
    request.onsuccess=()=>{const db=request.result,tx=db.transaction(store),read=tx.objectStore(store).getAll();read.onsuccess=()=>resolve(read.result);read.onerror=()=>reject(read.error);tx.oncomplete=()=>db.close()}
  }),store) as Promise<T[]>
}
async function open(page:Page){await page.goto('/#/preview/adventure');await expect(page.getByRole('heading',{name:'青葉町旅行手帳',exact:true})).toBeVisible()}
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
  if(question.kind==='order')for(const id of question.answer)await page.getByRole('group',{name:'可選字詞',exact:true}).getByRole('button',{name:question.choices.find(c=>c.id===id)!.text,exact:true}).click()
  else await page.getByRole('button',{name:question.choices.find(c=>c.id===question.answer[0])!.text,exact:true}).click()
  const button=page.getByRole('button',{name:'確認答案',exact:true})
  if(repeat)await button.evaluate(el=>{for(let i=0;i<10;i++)(el as HTMLButtonElement).click()});else await button.click()
  await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  return battle
}
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
  const second=await context.newPage();await second.goto(`/#/preview/adventure?scene=battle&id=${battle!.id}`)
  await expect(second.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true})).toBeVisible()
  // Dispatch both rendered buttons without changing tab focus in between;
  // focus hydration may otherwise correctly replace the second with “return”.
  const claims=await Promise.all([page,second].map(tab=>tab.getByRole('button',{name:'保存獎勵並回到小鎮',exact:true}).elementHandle()))
  await Promise.all(claims.map(button=>button!.evaluate(el=>(el as HTMLButtonElement).click())))
  await Promise.all([page,second].map(tab=>expect(tab).toHaveURL(/#\/preview\/adventure$/)))
  expect((await records<CoinLedger>(page,'coinLedger')).filter(l=>l.kind==='reward')).toHaveLength(1)
  expect((await records<{balance:number}>(page,'coinWallets'))[0].balance).toBe(60);await second.close()
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
  await region.focus();await page.keyboard.down('ArrowRight');await expect(player).not.toHaveAttribute('data-x','8');await page.keyboard.up('ArrowRight')
  const x=await player.getAttribute('data-x');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-x',x!)
  await page.keyboard.down('ArrowRight');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));const stopped=await player.getAttribute('data-x');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-x',stopped!);await page.keyboard.up('ArrowRight')
  await page.getByRole('button',{name:'方向控制',exact:true}).click();await page.getByRole('button',{name:'向上走',exact:true}).dispatchEvent('pointerdown');await page.evaluate(()=>window.dispatchEvent(new Event('pointercancel')))
  const y=await player.getAttribute('data-y');await page.waitForTimeout(400);await expect(player).toHaveAttribute('data-y',y!)
  await place(page,'花園裡的小晴');await expect(page.getByRole('dialog').getByText('歡迎來到小鎮。我是小晴，正在照顧這片花園。',{exact:true})).toBeVisible();await page.keyboard.press('Escape')
  expect(await records(page,'learningAttempts')).toEqual([]);expect((await records<WorldCheckpoint>(page,'worldCheckpoints'))[0].storyFlags).toContain('gardener')
  await page.reload();await expect(player).toHaveAttribute('data-x','16');await expect(player).toHaveAttribute('data-y','12')
})
for(const width of [320,390,768,1024,1440])test(`P2 town/shop/battle layout ${width}px and 64px targets`,async({page},info)=>{
  await page.setViewportSize({width,height:width===768 ? 1024:900});await open(page)
  for(const scene of ['town','dojo','shop']){
    if(scene==='dojo')await place(page,'初芽道館')
    if(scene==='shop'){await page.getByRole('button',{name:'回到小鎮',exact:true}).click();await place(page,'小路裝備店')}
    const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,small:[...document.querySelectorAll('main button')].map(b=>b.getBoundingClientRect()).filter(r=>r.width>0 && r.height>0 && (r.width<63.9 || r.height<63.9)).map(r=>({w:r.width,h:r.height}))}))
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);expect(geometry.small).toEqual([])
    await page.screenshot({path:info.outputPath(`${scene}-${width}.png`),fullPage:true})
  }
})
