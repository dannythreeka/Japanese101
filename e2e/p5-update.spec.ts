import {test,expect} from '@playwright/test'
import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import {records,teach,queueQuestions} from './helpers/unitJourney'
import type {UnitPack} from '../src/content/contracts'
const pack=JSON.parse(await readFile('src/content/packs/u02.json','utf8')) as UnitPack
test.use({serviceWorkers:'allow'})
test('a waiting update and failed installation preserve unsubmitted work until every old client closes',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Lifecycle harness currently verified in Chromium; other engines remain pending')
  test.setTimeout(120000)
  let version='A',broken=false
  const root=resolve('dist'),server=createServer((req,res)=>{void (async()=>{
    const path=new URL(req.url??'/','http://localhost').pathname
    if(path==='/sw.js'){
      res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','no-store')
      res.end(`importScripts('/worker-core.js'); /* ${version} */ self.__updateTestVersion='${version}';\nself.addEventListener('install',event=>event.waitUntil(fetch('/release-ready.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Incomplete release')})));`);return
    }
    if(path==='/release-ready.json'){res.writeHead(broken?503:200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end('{}');return}
    const file=path==='/worker-core.js'?'/sw.js':path==='/'?'/index.html':path
    const target=resolve(root,`.${file}`);if(!target.startsWith(root+'/')){res.writeHead(403).end();return}
    const bytes=await readFile(target)
    res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.wav':'audio/wav','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'} as Record<string,string>)[extname(target)]??'application/octet-stream')
    res.setHeader('Cache-Control','no-store');res.end(bytes)
  })().catch(()=>res.writeHead(404).end())})
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r))
  const address=server.address() as {port:number},origin=`http://127.0.0.1:${address.port}`
  try{
    await page.goto(`${origin}/#/preview/adventure?unit=U02&scene=dojo`);await teach(page,pack)
    await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true)
    const q=pack.questions.find(q=>q.typeId==='T01')!;await queueQuestions(page,'U02',[q.id])
    await page.getByRole('button',{name:'練習對戰',exact:true}).click();await page.getByRole('button',{name:'普通攻擊',exact:true}).click()
    const choice=page.getByRole('button',{name:q.choices.find(c=>c.id===q.answer[0])!.text,exact:true});await choice.click()
    const other=await context.newPage();await other.goto(`${origin}/#/parent`);for(const d of '1234')await other.getByRole('button',{name:d,exact:true}).click()
    await expect(other.getByRole('heading',{name:'應用程式更新',exact:true})).toBeVisible()
    version='B-incomplete';broken=true
    await other.getByRole('button',{name:'檢查新版本',exact:true}).click()
    await expect(other.getByRole('status').filter({hasText:'暫時無法檢查更新'})).toBeVisible()
    await expect(choice).toHaveAttribute('aria-pressed','true');expect(await records(page,'learningAttempts')).toEqual([])
    version='B-complete';broken=false
    await other.getByRole('button',{name:'檢查新版本',exact:true}).click()
    await expect(other.getByRole('status').filter({hasText:'新版本已準備好'})).toBeVisible({timeout:60000})
    await expect(choice).toHaveAttribute('aria-pressed','true')
    await other.close()
    expect(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true)
    await page.getByRole('button',{name:'確認答案',exact:true}).click();await expect(page.getByRole('heading',{name:'答對了，一起記住這個重點。',exact:true})).toBeVisible()
    const attempts=await records(page,'learningAttempts');expect(attempts).toHaveLength(1)
    const workers=await Promise.all(context.serviceWorkers().map(async worker=>({worker,version:await worker.evaluate(()=> (self as unknown as {__updateTestVersion:string}).__updateTestVersion).catch(()=>null)})))
    const waiting=workers.find(w=>w.version==='B-complete')?.worker
    expect(waiting).toBeDefined()
    await page.close()
    await expect.poll(()=>waiting!.evaluate(()=>(self as unknown as {registration:ServiceWorkerRegistration}).registration.waiting===null).catch(()=>false)).toBe(true)
    const next=await context.newPage();await next.goto(`${origin}/#/preview/adventure?unit=U02&scene=dojo`)
    await expect(next.getByRole('button',{name:'繼續挑戰',exact:true})).toBeVisible()
    expect(await records(next,'learningAttempts')).toEqual(attempts)
    expect(await next.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(false)
  }finally{await new Promise<void>(r=>{server.close(()=>r());server.closeAllConnections()})}
})
