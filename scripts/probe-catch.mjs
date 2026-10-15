import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
const kana = JSON.parse(readFileSync('src/data/kana.json','utf8')).kana
const byAudio = Object.fromEntries(kana.map(k=>[`kana_${k.id}.wav`,k.hiragana]))
const browser = await chromium.launch()
const context = await browser.newContext({serviceWorkers:'block'})
await context.addInitScript(() => {
  localStorage.setItem('uiLang','zh'); window.__audioSrc=''; window.__glyphs={}
  const NativeAudio=window.Audio
  window.Audio=class extends NativeAudio {
    constructor(src){super(src);setTimeout(()=>this.dispatchEvent(new Event('canplaythrough')),0)}
    play(){window.__audioSrc=this.src;return Promise.resolve()}
  }
  const native=CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText=function(text,...args){const t=this.getTransform();window.__glyphs[text]={x:t.e,y:t.f,at:performance.now()};return native.call(this,text,...args)}
})
const page=await context.newPage();const steps=[]
try {
  await page.goto('http://127.0.0.1:4173/#/play/kana-catch')
  await page.getByRole('button',{name:/あ 平假名/}).click()
  for(let n=0;n<10;n++){
    await page.waitForFunction(map=>Boolean(map[window.__audioSrc.split('/').pop()]),byAudio)
    const target=await page.evaluate(map=>map[window.__audioSrc.split('/').pop()],byAudio)
    await page.waitForFunction(target=>{const b=window.__glyphs[target];return b&&b.y>60&&b.y<320&&performance.now()-b.at<200},target)
    const rect=await page.locator('canvas').boundingBox()
    async function tap(char){const b=await page.evaluate(c=>window.__glyphs[c],char);await page.mouse.click(rect.x+b.x*rect.width/360,rect.y+b.y*rect.height/380)}
    if(n<2){
      const wrong=await page.evaluate(({target,chars})=>Object.keys(window.__glyphs).find(c=>c!==target&&chars.includes(c)&&window.__glyphs[c].y>50&&performance.now()-window.__glyphs[c].at<200),{target,chars:kana.map(k=>k.hiragana)})
      if(wrong){await tap(wrong);steps.push({round:n+1,action:'wrong tap',target,selected:wrong});await page.waitForTimeout(80)}
    }
    await tap(target);steps.push({round:n+1,action:'correct tap',target})
    if(n<9){await page.getByRole('button',{name:'下一題 →',exact:true}).waitFor();await page.evaluate(()=>{window.__audioSrc='';window.__glyphs={}});await page.getByRole('button',{name:'下一題 →',exact:true}).click()}
  }
  await page.waitForTimeout(800)
  writeFileSync('docs/verification/evidence/P0/F01-catch.json',JSON.stringify({method:'actual app UI with Audio playback stub and canvas draw-coordinate observation; no source state mutation',steps,resultText:await page.locator('body').innerText()},null,2)+'\n')
  await page.screenshot({path:'docs/verification/evidence/P0/F01.png',fullPage:true})
} finally {await browser.close()}
