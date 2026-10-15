import { chromium } from '@playwright/test'
import { writeFileSync, readdirSync } from 'node:fs'
const browser=await chromium.launch();const results=[];const url='http://127.0.0.1:4173'
try {
  const context=await browser.newContext({serviceWorkers:'block'})
  await context.addInitScript(()=>{localStorage.setItem('uiLang','zh');localStorage.setItem('micMode','offline');Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('P0 simulated denial','NotAllowedError')}})})
  const page=await context.newPage();await page.goto(`${url}/#/play/kana-write`)
  const canvas=page.locator('canvas').first();await canvas.waitFor();const rect=await canvas.boundingBox();
  await page.mouse.move(rect.x+rect.width*.3,rect.y+rect.height*.3);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height*.7,{steps:12});await page.mouse.up()
  await page.screenshot({path:'docs/verification/evidence/P0/write-drawn.png',fullPage:true})
  const before=await page.getByRole('button',{name:'確認 ✓',exact:true}).isEnabled()
  await page.getByRole('button',{name:'清除',exact:true}).click()
  const after=await page.getByRole('button',{name:'確認 ✓',exact:true}).isEnabled()
  await page.getByRole('button',{name:'示範 ✍️',exact:true}).click();await page.waitForTimeout(200)
  results.push({id:'WRITE',method:'mouse stroke, clear, demonstration click',confirmEnabledAfterStroke:before,confirmEnabledAfterClear:after})
  await page.goto(`${url}/#/play/kotodama`)
  const mic=page.locator('button').last();await mic.dispatchEvent('pointerdown');await page.waitForTimeout(200);await mic.dispatchEvent('pointerup')
  results.push({id:'VOICE-DENIED',method:'mock getUserMedia rejection; not real hardware permission',text:await page.locator('body').innerText()})
  await page.screenshot({path:'docs/verification/evidence/P0/voice-denied.png',fullPage:true})
  await context.close()
  const sw=await browser.newContext({serviceWorkers:'allow'});const p=await sw.newPage();await p.goto(`${url}/#/`)
  await p.evaluate(()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,rej)=>setTimeout(()=>rej(new Error('SW ready timeout')),15000))]))
  const file=readdirSync('public/assets/audio').find(x=>x.startsWith('kana_')&&x.endsWith('.wav'))
  const caches=await p.evaluate(async()=>{const names=await window.caches.keys();const out=[];for(const name of names){const c=await window.caches.open(name);for(const r of await c.keys())out.push(r.url)}return out})
  await sw.setOffline(true)
  const fetchResult=await p.evaluate(async file=>{try{const r=await fetch(`/assets/audio/${file}`);return {status:r.status,ok:r.ok}}catch(e){return {error:e.message}}},file)
  results.push({id:'F-07',method:'fresh SW context, wait ready, no prior audio play, set offline, fetch real bundled WAV',audio:file,cacheEntryCount:caches.length,wavEntries:caches.filter(x=>x.includes('.wav')),fetchResult})
  await sw.close()
} finally {writeFileSync('docs/verification/evidence/P0/interactions.json',JSON.stringify(results,null,2)+'\n');await browser.close()}
