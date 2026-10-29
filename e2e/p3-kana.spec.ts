import {hiraganaPack} from '../src/content/packs/kana'
import {test,expect} from '@playwright/test'

test('kana lessons and audio battle persist separately for each script and link back to U01',async({page})=>{
  await page.goto('/#/preview/adventure?unit=KANA-HIRA&scene=learn')
  const nav=page.getByRole('navigation',{name:'認識新內容',exact:true})
  await expect(nav.getByRole('option')).toHaveCount(46)
  for(const width of [320,768,1024]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`docs/phases/P3/evidence/kana-teaching-${width}.png`,fullPage:true})}
  await page.getByRole('button',{name:'讀過了，記在手帳',exact:true}).click()
  await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
  await page.reload();await expect(page.getByRole('button',{name:'已保存',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'返回',exact:true}).first().click()
  await page.getByRole('button',{name:'練習對戰',exact:true}).click()
  await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
  await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeDisabled()
  await page.getByRole('button',{name:'播放音訊',exact:true}).click()
  await page.getByRole('button',{name:'あ',exact:true}).click()
  await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeEnabled({timeout:15000})
  await page.getByRole('button',{name:'確認答案',exact:true}).click()
  await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
  await page.goto('/#/preview/adventure?unit=KANA-KATA&scene=learn')
  await expect(nav.getByRole('option')).toHaveCount(46)
  await expect(page.getByRole('button',{name:'讀過了，記在手帳',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'返回',exact:true}).first().click()
  await expect(page.getByRole('button',{name:'練習對戰',exact:true})).toBeDisabled()
  await page.getByRole('link',{name:'U01 · 自我介紹：認識小鎮的新朋友',exact:false}).click()
  await expect(page).toHaveURL(/unit=U01&scene=dojo/)
  await page.goto('/#/preview/adventure?unit=KANA-HIRA&scene=dojo')
  await page.getByRole('button',{name:'繼續挑戰',exact:true}).click()
  await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
})

test('unknown units have a recoverable route and do not silently open another pack',async({page})=>{
  await page.goto('/#/preview/adventure?unit=UNAVAILABLE')
  await expect(page.getByRole('heading',{name:'找不到這份教材 / きょうざいがありません',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'返回小鎮 / まちへ',exact:true}).click()
  await expect(page.getByRole('heading',{name:'青葉町旅行手帳',exact:true})).toBeVisible()
})


test('untaught kana placement resumes after reload and pause, then unlocks practice without fake teaching',async({page})=>{
  await page.goto('/#/preview/adventure?unit=KANA-HIRA&scene=dojo')
  await expect(page.getByRole('button',{name:'練習對戰',exact:true})).toBeDisabled()
  await page.getByText('已經會了？先試試先修檢核',{exact:true}).click()
  await page.getByRole('button',{name:'あ・い・う・え・お',exact:true}).click()
  const questions=hiraganaPack.questions.filter(q=>q.partition==='check').slice(0,5)
  for(let index=0;index<questions.length;index++){
    const q=questions[index]
    await expect(page.getByRole('button',{name:'提示',exact:true})).toHaveCount(0)
    await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeDisabled()
    await page.getByRole('button',{name:'播放音訊',exact:true}).click()
    await page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true}).click()
    await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeEnabled({timeout:15000})
    await page.getByRole('button',{name:'確認答案',exact:true}).click()
    await expect(page.getByRole('button',{name:'繼續',exact:true})).toBeVisible()
    if(index===0){await page.reload();await expect(page.getByRole('button',{name:'確認答案',exact:true})).toHaveCount(0)}
    await page.getByRole('button',{name:'繼續',exact:true}).click()
    if(index===1){
      await expect(page.getByRole('heading',{name:/3 \/ 5$/,exact:true})).toBeVisible()
      await page.getByRole('button',{name:'暫停，下次繼續',exact:true}).click()
      await page.getByRole('button',{name:'繼續挑戰',exact:true}).click()
      await expect(page.getByRole('heading',{name:/3 \/ 5$/,exact:true})).toBeVisible()
    }
  }
  await page.getByRole('button',{name:'回到小鎮',exact:true}).click()
  await expect(page.getByRole('button',{name:'地點清單',exact:true})).toBeVisible()
  await page.goto('/#/preview/adventure?unit=KANA-HIRA&scene=dojo')
  await expect(page.getByRole('button',{name:'練習對戰',exact:true})).toBeEnabled()
  await page.getByText('已經會了？先試試先修檢核',{exact:true}).click()
  await expect(page.getByText('先修檢核通過 5 / 46 字',{exact:true})).toBeVisible()
  const taught=await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('Japanese101DB');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('studyPlans');const q=tx.objectStore('studyPlans').getAll();q.onsuccess=()=>resolve(q.result.find((p:{unitId:string})=>p.unitId==='KANA-HIRA'));tx.oncomplete=()=>db.close()}}))
  expect(taught).toMatchObject({taughtCards:[],taughtAt:{}})
  await page.screenshot({path:'docs/phases/P3/evidence/kana-placement-result.png',fullPage:true})
})


test('reviewer can inspect all kana questions and switch scripts without granting learning credit',async({page})=>{
  await page.goto('/#/__review/content?unit=KANA-HIRA')
  await expect(page.getByRole('heading',{name:'KANA-HIRA 教材與美術審閱',exact:true})).toBeVisible()
  await expect(page.getByLabel('選擇題目',{exact:true}).getByRole('option')).toHaveCount(92)
  await page.getByLabel('選擇題目',{exact:true}).selectOption('KANA-HIRA:check:wo')
  await expect(page.getByText('音訊是「ほんをよみます」，第 3 個音對應「を」。',{exact:true})).toBeVisible()
  await page.getByLabel('選擇教材',{exact:true}).selectOption('KANA-KATA')
  await expect(page.getByRole('heading',{name:'KANA-KATA 教材與美術審閱',exact:true})).toBeVisible()
  await expect(page.getByLabel('選擇題目',{exact:true}).getByRole('option')).toHaveCount(92)
  const count=await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('Japanese101DB');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('learningAttempts');const q=tx.objectStore('learningAttempts').count();q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close()}}))
  expect(count).toBe(0)
})
