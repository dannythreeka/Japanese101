import { test, expect } from '@playwright/test'
import vocabulary from '../src/data/vocabulary.json' with {type:'json'}

test('P1 affected screens at specified viewports and 200% layout zoom',async({page},info)=>{
  test.setTimeout(90_000)
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    for(const route of ['kana','dakuten-drag','kana-write','kotodama','flashcard']){
      await page.goto(`/#/play/${route}`)
      await expect(page.getByRole('status').filter({hasText:'載入中…'})).toHaveCount(0)
      if(route==='kana')await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeVisible()
      if(route==='dakuten-drag')await expect(page.getByRole('heading')).toBeVisible()
      await page.screenshot({path:info.outputPath(`${route}-${width}.png`),fullPage:true})
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} width ${width}`).toBe(true)
    }
  }
  await page.setViewportSize({width:768,height:900});await page.goto('/#/play/kana')
  await expect(page.getByRole('button',{name:'確認答案',exact:true})).toBeVisible()
  await page.evaluate(()=>{document.documentElement.style.zoom='2'})
  await page.screenshot({path:info.outputPath('kana-200-percent-css-zoom.png'),fullPage:true})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
  await page.evaluate(()=>{document.documentElement.style.zoom='1'})
  await page.setViewportSize({width:844,height:390});await page.goto('/#/play/kana')
  await page.screenshot({path:info.outputPath('kana-mobile-landscape.png'),fullPage:true})
})

test('vocabulary illustration contact sheet has no broken images',async({page},info)=>{
  await page.goto('/#/')
  await page.setViewportSize({width:1440,height:1200})
  await page.setContent(`<html lang="zh-Hant"><body style="margin:0;background:white;font-family:sans-serif"><div style="display:grid;grid-template-columns:repeat(10,1fr)">${vocabulary.words.map(w=>`<div style="text-align:center;border:1px solid #ddd;padding:6px"><img width="100" height="100" src="${w.image.src}" alt="${w.kana}"><div>${w.kana}／${w.meaning_zh}</div></div>`).join('')}</div></body></html>`)
  await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(image=>image instanceof HTMLImageElement && image.complete&&image.naturalWidth>0))).toBe(true)
  await page.screenshot({path:info.outputPath('vocabulary-contact-sheet.png'),fullPage:true})
})
