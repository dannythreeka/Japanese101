/** P3 engineering rehearsal only. A fresh context, no real child or learning evidence. */
import {chromium} from '@playwright/test'
import {mkdir,writeFile,readFile,mkdtemp} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const CODES=/^([ABC])-?([1-3])$/
export async function prepareFixture(page,{origin,code}){
  const url=new URL(origin)
  if(!['http:','https:'].includes(url.protocol)||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password)throw new Error('Use a dedicated local preview origin')
  const match=CODES.exec(code)
  if(!match)throw new Error('Expected anonymous slot A-1–C-3, not a name')
  code=`${match[1]}-${match[2]}`
  const gradeBand='ABC'.indexOf(match[1])+1
  await page.goto(`${url.origin}/#/preview/adventure?unit=U01&scene=dojo`)
  await page.getByRole('button',{name:'認識新內容',exact:true}).waitFor()
  await page.evaluate(({code,gradeBand})=>new Promise((resolve,reject)=>{
    const open=indexedDB.open('Japanese101DB');open.onerror=()=>reject(open.error)
    open.onsuccess=()=>{
      const db=open.result
      // Refuse every nonempty activity/financial table; never clear an existing player.
      const names=['profiles','learningAttempts','battleSessions','learningChecks','coinWallets','coinLedger','inventory','equipment','purchaseReceipts','firstWins','playerSessions','playerProgress','gameCheckpoints','levelSessions','rewardReceipts','studyPlans']
      const tx=db.transaction(names,'readwrite'),rows={}
      let remaining=names.length,reason
      for(const name of names){const r=tx.objectStore(name).getAll();r.onsuccess=()=>{rows[name]=r.result;if(--remaining)return
        const pristine=rows.profiles.length===1&&rows.profiles[0].profile_id==='player'&&names.filter(n=>!['profiles','studyPlans'].includes(n)).every(n=>rows[n].length===0)&&rows.studyPlans.every(p=>Array.isArray(p.taughtCards)&&p.taughtCards.length===0&&p.taughtAt&&Object.keys(p.taughtAt).length===0)
        if(!pristine){reason=new Error('Fixture requires a fresh empty context; existing data preserved');tx.abort();return}
        const profile=rows.profiles[0]
        tx.objectStore('profiles').put({...profile,name:`試用${code}`})
        for(const plan of rows.studyPlans)tx.objectStore('studyPlans').put({...plan,gradeBand})
        // Explicit synthetic opening balance, not earned reward or a fabricated battle.
        tx.objectStore('coinWallets').add({profileId:'player',balance:40})
      }}
      tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();reject(reason??tx.error??new Error('Fixture transaction aborted'))}
    }
  }),{code,gradeBand})
  const marker={schema:'japanese101-p3-fixture-v1',mode:'ENGINEERING_REHEARSAL',participantCode:code,gradeBand,origin:url.origin,unitId:'U01',profileId:'player',openingCoins:40,coinSource:'SYNTHETIC_FIXTURE_OPENING_BALANCE_NOT_EARNED',learningAttemptsSeeded:0,teachingCardsSeeded:0,humanConsent:'NOT_RUN',humanTrial:'NOT_RUN',createdAt:new Date().toISOString()}
  await page.evaluate(marker=>localStorage.setItem('japanese101-usability-fixture',JSON.stringify(marker)),marker)
  await page.goto(`${url.origin}/#/preview/adventure?unit=U01`)
  return marker
}
async function main(){
  const [command,...args]=process.argv.slice(2)
  if(command==='prepare'){
    const [origin,code]=args,browser=await chromium.launch({headless:true})
    try{
      const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage()
      const marker=await prepareFixture(page,{origin,code})
      const dir=await mkdtemp(join(tmpdir(),'japanese101-p3-fixture-'))
      const state=await context.storageState({indexedDB:true})
      await writeFile(join(dir,'storage.json'),JSON.stringify(state),{mode:0o600})
      const index=await page.request.get(marker.origin)
      if(!index.ok())throw new Error('Cannot record preview build identity')
      const version=await page.request.get(`${marker.origin}/version.json`)
      let previewDeclaredCommit=null
      if(version.ok()){try{previewDeclaredCommit=(await version.json()).sha??null}catch{/* A dev server may return HTML; do not invent its commit. */}}
      const manifest={...marker,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTreeDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),previewDeclaredCommit,previewIndexSha256:createHash('sha256').update(await index.body()).digest('hex'),browser:browser.version(),viewport:{width:1024,height:768}}
      await writeFile(join(dir,'fixture.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600})
      console.log(`Prepared isolated engineering fixture: ${dir}\nNo consent, participant or successful trial has been recorded.`)
    }finally{await browser.close()}
  }else if(command==='open'){
    const [dir]=args
    if(!dir)throw new Error('Provide the prepared fixture directory')
    const manifest=JSON.parse(await readFile(join(dir,'fixture.json'),'utf8'))
    if(manifest.schema!=='japanese101-p3-fixture-v1'||manifest.mode!=='ENGINEERING_REHEARSAL')throw new Error('Unknown fixture')
    const result=await mkdtemp(join(tmpdir(),'japanese101-p3-rehearsal-'))
    const browser=await chromium.launch({headless:false})
    try{
      const context=await browser.newContext({storageState:join(dir,'storage.json'),viewport:manifest.viewport}),page=await context.newPage()
      const closed=new Promise(resolve=>page.once('close',resolve))
      await page.goto(`${manifest.origin}/#/preview/adventure?unit=U01`)
      console.log(`Engineering rehearsal ${manifest.participantCode}; close its page to save anonymized local state to ${result}. Do not enter real names.`)
      await closed
      await mkdir(result,{recursive:true})
      await writeFile(join(result,'storage.json'),JSON.stringify(await context.storageState({indexedDB:true})),{mode:0o600})
      await writeFile(join(result,'fixture.json'),JSON.stringify({...manifest,rehearsalEndedAt:new Date().toISOString(),humanTrial:'NOT_RUN'},null,2)+'\n',{mode:0o600})
    }finally{await browser.close()}
  }else throw new Error('Usage: node scripts/usability-fixture.mjs prepare http://127.0.0.1:PORT A1 | open /tmp/japanese101-p3-fixture-...')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main()
