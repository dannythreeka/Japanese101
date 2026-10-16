import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Dialog, Progress, StatePanel } from '../../components/ui/journey-ui'
import { setActiveProfileId } from '../../db'
import { u01 } from '../../content/packs/u01'
import { CATALOG_VERSION } from '../../economy/catalog'
import { BATTLE_RULES_VERSION } from '../../battle/rules'
import { localDay, summarize } from '../../learning/rules'
import { stopJourneyAudio } from '../../lib/journeyAudio'
import { stopSpeaking } from '../../lib/tts'
import { useAppStore } from '../../store/useAppStore'
import { town, walkable, WORLD_VERSION, type Destination, type Facing, type Point } from '../../world/map'
import BattleScene from './BattleScene'
import { TeachingScene, CheckScene } from './LearningScene'
import ShopScene from './ShopScene'
import WorldScene from './WorldScene'
import { useJourney } from './useJourney'
import { useJourneyText } from './text'
import './journey.css'

type Panel='journal'|'places'|'profiles'|'pause'|null
export default function JourneyScreen(){
  const {lang,t}=useJourneyText();const navigate=useNavigate();const [params,setParams]=useSearchParams()
  const {profileId,repo,data,setData,profile,profiles,error,setError,pending,perform,reload,retry}=useJourney()
  const [panel,setPanel]=useState<Panel>(null);const [resident,setResident]=useState<Destination|null>(null);const [line,setLine]=useState(0)
  const [teachingIndex,setTeachingIndex]=useState(0);const [notice,setNotice]=useState('')
  const [clock,setClock]=useState(()=>Date.now())
  const [warp,setWarp]=useState(0)
  const failedWorld=useRef<{position:Point;facing:Facing}|null>(null)
  const entering=useRef(false);const purchaseIds=useRef(new Map<string,string>())
  const scene=params.get('scene') ?? 'town';const id=params.get('id')
  const go=(scene:string,id?:string)=>{setPanel(null);setParams(scene==='town' ? {}:{scene,...(id ? {id}:{})})}
  useEffect(()=>{stopJourneyAudio();stopSpeaking();return ()=>{stopJourneyAudio();stopSpeaking()}},[scene,profileId])
  useEffect(()=>{const update=()=>{void reload().catch(()=>setError('unavailable'))};window.addEventListener('focus',update);return()=>window.removeEventListener('focus',update)},[reload,setError])
  useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),30000);return()=>clearInterval(timer)},[])
  async function persist(position:Point,facing:Facing){
    try{const world=await repo.saveWorld(profileId,position,facing);setData(old=>old ? {...old,world}:old);failedWorld.current=null}
    catch(e){failedWorld.current={position,facing};setError(e instanceof Error && /version/.test(e.message) ? 'version':'storage');throw e}
  }
  function enter(destination:Destination,position:Point,facing:Facing){
    if(entering.current || pending)return
    entering.current=true
    void perform(async()=>{
      const world=await repo.saveWorld(profileId,position,facing,destination.id)
      setData(old=>old ? {...old,world}:old)
      setWarp(value=>value+1)
      if(destination.kind==='npc'){setPanel(null);setLine(0);setResident(destination)}
      else if(destination.kind==='home')setPanel('journal')
      else go(destination.kind)
    }).finally(()=>{entering.current=false})
  }
  const recover=()=>{void perform(async()=>{await repo.recoverVersions(profileId);go('town')})}
  if(!data || !data.study)return <main className="journey journey-shell"><StatePanel state={error ? 'retryable-error':'loading'} title={error==='version' ? t('versionError'):error ? t('error'):t('loading')} action={error ? t(error==='version'?'continueJourney':'retry'):undefined} onAction={error ? error==='version' ? recover:retry:undefined}/></main>
  const stale=data.battles.some(b=>b.phase!=='finished' && (b.contentVersion!==u01.version || b.rulesVersion!==BATTLE_RULES_VERSION)) || data.checks.some(c=>c.phase!=='finished' && c.contentVersion!==u01.version)
  if(stale)return <main className="journey journey-shell"><StatePanel state="retryable-error" title={t('versionError')} action={t('continueJourney')} onAction={recover}/></main>
  const battle=data.battles.find(b=>b.id===id)
  const check=data.checks.find(c=>c.id===id)
  if(scene==='battle' && battle && (battle.contentVersion!==u01.version || battle.rulesVersion!==BATTLE_RULES_VERSION) || scene==='check' && check && check.contentVersion!==u01.version)return <main className="journey journey-shell"><StatePanel state="retryable-error" title={t('versionError')} action={t('returnTown')} onAction={()=>go('town')}/></main>
  const activeBattle=data.battles.find(b=>b.phase!=='finished')
  const unfinishedCheck=data.checks.find(c=>c.phase!=='finished')
  const items=Object.values(data.equipment)
  const today=localDay(clock,data.study.timeZone)
  const summary=summarize(data.attempts.filter(a=>localDay(Date.parse(a.submittedAt),data.study!.timeZone)===today))
  const due=data.reviews.filter(r=>r.dueDate<=today)
  const eligible=u01.questions.some(q=>q.partition==='practice' && q.teachingIds.every(id=>data.study!.taughtCards.includes(id)))
  const checkEligible=u01.questions.some(q=>q.partition==='check' && q.teachingIds.every(id=>data.study!.taughtCards.includes(id)))
  const worldOutdated=data.world && (data.world.worldVersion!==WORLD_VERSION || data.world.mapId!==town.id || !walkable(data.world.position))
  const startBattle=()=>{void perform(async()=>{const battle=await repo.startBattle(profileId);go('battle',battle.id)})}
  const startCheck=()=>{void perform(async()=>{const check=await repo.startCheck(profileId);go('check',check.id)})}
  return <main className="journey journey-shell" lang={lang==='ja'?'ja':'zh-Hant'}>
    <header className="journey-header"><div><small>{profile?.name}</small><h1>{t('title')}</h1><p>{t('coins')} {data.coins}</p></div><div className="journey-actions">
      <Button variant="quiet" onClick={()=>useAppStore.getState().setUiLang(lang==='zh'?'ja':'zh')}>{lang==='zh'?'日本語':'繁體中文'}</Button>
      <Button variant="quiet" onClick={()=>setPanel('profiles')}>{t('profiles')}</Button><Button variant="quiet" onClick={()=>navigate('/parent')}>{t('parent')}</Button>
    </div></header>
    {u01.reviewStatus!=='APPROVED' && <details className="journey-preview-banner"><summary>{t('preview')}</summary><p>{t('previewDetail')}</p></details>}
    {error && <StatePanel state="storage-error" title={error==='version' ? t('versionError'):t('storageError')} action={t('retry')} onAction={()=>{const checkpoint=failedWorld.current;if(checkpoint)void perform(()=>persist(checkpoint.position,checkpoint.facing));else retry()}}><p>{t('storageDetail')}</p></StatePanel>}
    <p role="status">{notice}</p>
    {scene==='town' && <>
      <nav className="journey-actions" aria-label={t('title')} style={{marginBottom:16}}><Button variant="secondary" onClick={()=>setPanel('journal')}>{t('journal')}</Button><Button variant="secondary" onClick={()=>go('bag')}>{t('backpack')}</Button><Button variant="secondary" onClick={()=>setPanel('places')}>{t('places')}</Button><Button variant="quiet" onClick={()=>setPanel('pause')}>{t('pause')}</Button></nav>
      {worldOutdated ? <StatePanel state="retryable-error" title={t('versionError')} action={t('continueJourney')} onAction={()=>{void perform(()=>repo.recoverWorld(profileId))}}/>:<WorldScene key={`${data.world?.worldVersion ?? WORLD_VERSION}:${warp}`} initialPosition={data.world?.position ?? town.spawn} initialFacing={data.world?.facing ?? 'down'} items={items} paused={!!panel || !!resident || pending || !!error} onPersist={persist} onEnter={enter} onPause={()=>setPanel('pause')}/>}
    </>}
    {scene==='dojo' && <section className="journey-body journey-stack"><div className="journey-content-header"><h1>{t('dojo')}</h1><Button variant="secondary" onClick={()=>go('town')}>{t('returnTown')}</Button></div>
      <div className="journey-mentor"><img src={`${import.meta.env.BASE_URL}assets/img/journey/mentor.webp`} alt=""/><div><h2>{lang==='zh'?'歡迎，旅行者。':'ようこそ、たびびとさん。'}</h2><p>{t('learnFirst')}</p><p>{t('noDeadline')}</p></div></div>
      <div className="journey-actions"><Button onClick={()=>go('learn')}>{t('teach')}</Button><Button disabled={pending || !eligible} onClick={startBattle}>{activeBattle ? t('resume'):t('practice')}</Button><Button variant="secondary" disabled={pending || !checkEligible} onClick={startCheck}>{unfinishedCheck ? t('resume'):t('check')}</Button><Button variant="quiet" onClick={()=>navigate('/play/gallery')}>{lang==='zh'?'先認識五十音':'かなをみる'}</Button></div>
      {!eligible && <p>{t('learnFirst')}</p>}
    </section>}
    {scene==='learn' && <TeachingScene study={data.study} index={teachingIndex} onIndex={setTeachingIndex} onTeach={id=>{void perform(()=>repo.teach(profileId,id))}} onBack={()=>go('dojo')} pending={pending}/>}
    {scene==='battle' && (battle ? <BattleScene battle={battle} attempts={data.attempts} receipt={data.ledger.find(l=>l.battleId===battle.id)} pending={pending} onChoose={move=>{void perform(async()=>{await repo.chooseMove(profileId,battle.id,move)})}} onSubmit={async input=>{await repo.submitTurn(profileId,battle.id,battle.turn,input);await reload()}} onContinue={()=>{void perform(async()=>{await repo.continueBattle(profileId,battle.id,battle.turn)})}} onClaim={()=>{void perform(async()=>{const receipt=await repo.reward(profileId,battle.id);setNotice(`${t('claimed')} +${receipt.amount}`);go('town')})}} onRetreat={()=>{void perform(async()=>{await repo.retreat(profileId,battle.id);go('dojo')})}}/>:<StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>)}
    {scene==='check' && (check ? <CheckScene check={check} attempts={data.attempts} pending={pending} onSubmit={async input=>{await repo.submitCheck(profileId,check.id,check.index,input);await reload()}} onContinue={()=>{void perform(async()=>{await repo.continueCheck(profileId,check.id,check.index)})}} onFinish={()=>{void perform(async()=>{await repo.finishCheck(profileId,check.id);go('town')})}}/>:<StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>)}
    {(scene==='shop' || scene==='bag') && <ShopScene bag={scene==='bag'} coins={data.coins} inventory={data.inventory} equipment={data.equipment} pending={pending} locked={!!activeBattle} onBack={()=>go('town')} onBuy={itemId=>{
      const purchaseId=purchaseIds.current.get(itemId) ?? crypto.randomUUID();purchaseIds.current.set(itemId,purchaseId)
      void perform(async()=>{await repo.purchase(profileId,itemId,purchaseId,CATALOG_VERSION);purchaseIds.current.delete(itemId);setNotice(t('saved'))})
    }} onEquip={(itemId,enabled)=>{void perform(()=>repo.equip(profileId,itemId,enabled))}}/>}
    {!['town','dojo','learn','battle','check','shop','bag'].includes(scene) && <StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>}
    <Dialog open={panel==='places'} title={t('places')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack">{town.destinations.map(d=><Button key={d.id} variant="secondary" disabled={pending} onClick={()=>enter(d,d.point,'up')}>{d.name[lang]}</Button>)}</div></Dialog>
    <Dialog open={panel==='journal'} title={t('journal')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack"><h3>{t('suggested')}</h3><p>{t('noDeadline')}</p><p>{t('sections')} {summary.completedSections} / {data.study.gradeBand+1}</p><Progress label={t('partial')} value={summary.partialSection} max={5}/><p>{due.length ? `${t('due')} (${due.length})`:t('noDue')}</p>
      <label>{t('grade')} <select value={data.study.gradeBand} onChange={e=>{const value=Number(e.target.value) as 1|2|3;void perform(()=>repo.setGradeBand(profileId,value))}} style={{minHeight:64,padding:12,maxWidth:'100%'}}>{([1,2,3] as const).map(g=><option key={g} value={g}>{t(g===1?'grade1':g===2?'grade2':'grade3')}</option>)}</select></label>
      <Button onClick={()=>go('dojo')}>{t('dojo')}</Button>{activeBattle && <Button variant="secondary" onClick={()=>go('battle',activeBattle.id)}>{t('resume')}</Button>}{unfinishedCheck && <Button variant="secondary" onClick={()=>go('check',unfinishedCheck.id)}>{t('check')}</Button>}
      <h3>{t('story')}</h3>{(data.world?.storyFlags ?? []).map(flag=><p key={flag}>{town.destinations.find(d=>d.id===flag)?.name[lang]}</p>)}
    </div></Dialog>
    <Dialog open={panel==='profiles'} title={t('profiles')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack">{profiles.map(p=><Button key={p.profile_id} variant="secondary" aria-pressed={p.profile_id===profileId} onClick={()=>{stopJourneyAudio();setActiveProfileId(p.profile_id)}}>{p.name}</Button>)}<Button variant="quiet" onClick={()=>navigate('/profiles/new')}>{lang==='zh'?'新增玩家':'プレイヤーをふやす'}</Button></div></Dialog>
    <Dialog open={panel==='pause'} title={t('rest')} closeLabel={t('close')} onClose={()=>setPanel(null)}><Button onClick={()=>setPanel(null)}>{t('continueJourney')}</Button></Dialog>
    <Dialog open={!!resident} title={resident?.name[lang] ?? ''} closeLabel={t('close')} onClose={()=>setResident(null)}>{resident && <div className="journey-stack"><img src={`${import.meta.env.BASE_URL}assets/img/journey/${resident.asset}.webp`} style={{width:180,maxHeight:200,objectFit:'contain',margin:'auto'}} alt=""/><p>{resident.dialogue?.[line]?.[lang]}</p><Button onClick={()=>{if(line+1<(resident.dialogue?.length ?? 0))setLine(line+1);else setResident(null)}}>{t('next')}</Button></div>}</Dialog>
  </main>
}
