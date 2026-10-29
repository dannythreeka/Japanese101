import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AudioControl, Button, Dialog, Progress, StatePanel } from '../../components/ui/journey-ui'
import OfflinePack from '../../components/OfflinePack'
import { setActiveProfileId } from '../../db'
import type { UnitPack } from '../../content/contracts'
import {unitIntroduction} from '../../content/packs/introductions'
import { availablePacks } from '../../content/packs/registry'
import { u01 as defaultPack } from '../../content/packs/u01'
import { CATALOG_VERSION } from '../../economy/catalog'
import {currentBattle,currentCheck,currentWorld} from '../../db/journey-compatibility'
import {eligibleTeachingIds} from '../../learning/placement'
import { localDay, summarize } from '../../learning/rules'
import { stopJourneyAudio } from '../../lib/journeyAudio'
import { stopSpeaking } from '../../lib/tts'
import { saveAnswerAndRefresh } from '../../lib/answerCommit'
import { useAppStore } from '../../store/useAppStore'
import { town, WORLD_VERSION, type Destination, type Facing, type Point } from '../../world/map'
import BattleScene from './BattleScene'
import { TeachingScene, CheckScene } from './LearningScene'
import ShopScene from './ShopScene'
import WorldScene from './WorldScene'
import { useJourney } from './useJourney'
import { useJourneyText } from './text'
import { JourneyPetContext } from './pet-context'
import WelcomeSetup from './WelcomeSetup'
import './journey.css'

type Panel='journal'|'places'|'profiles'|'pause'|'welcome'|null
export default function JourneyScreen({pack:u01=defaultPack}:{pack?:UnitPack}){
  const {lang,t}=useJourneyText();const navigate=useNavigate();const [params,setParams]=useSearchParams()
  const location=useLocation();const activeRoute=useRef<string|null>(null)
  // A durable write may finish after the user leaves. Its old callback must not replace the newer route.
  useLayoutEffect(()=>{activeRoute.current=location.key;return()=>{activeRoute.current=null}},[location.key])
  const routeIsCurrent=()=>activeRoute.current===location.key
  const {profileId,repo,data,setData,profile,profiles,pet,error,setError,pending,perform,reload,retry}=useJourney(u01)
  const [panel,setPanel]=useState<Panel>(null);const [resident,setResident]=useState<Destination|null>(null);const [line,setLine]=useState(0)
  const [teachingIndex,setTeachingIndex]=useState(0);const [notice,setNotice]=useState('')
  const [clock,setClock]=useState(()=>Date.now())
  const [warp,setWarp]=useState(0)
  const failedWorld=useRef<{position:Point;facing:Facing}|null>(null)
  const entering=useRef(false);const purchaseIds=useRef(new Map<string,string>())
  const scene=params.get('scene') ?? 'town';const id=params.get('id')
  const go=(scene:string,id?:string)=>{if(!routeIsCurrent())return;setPanel(null);setParams({...(u01.id==='U01'?{}:{unit:u01.id}),...(scene==='town'?{}:{scene}),...(id?{id}:{})})}
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
      if(!routeIsCurrent())return
      setData(old=>old ? {...old,world}:old)
      setWarp(value=>value+1)
      if(destination.kind==='npc'){setPanel(null);setLine(0);setResident(destination)}
      else if(destination.kind==='home')setPanel('journal')
      else go(destination.kind)
    }).finally(()=>{entering.current=false})
  }
  const recover=()=>{void perform(async()=>{await repo.recoverVersions(profileId);go('town')})}
  if(!data || !data.study)return <main className="journey journey-shell"><StatePanel state={error ? 'retryable-error':'loading'} title={error==='catalog' ? t('catalogChanged'):error==='version' ? t('versionError'):error ? t('error'):t('loading')} action={error ? t(error==='catalog'?'reload':error==='version'?'continueJourney':'retry'):undefined} onAction={error ? error==='catalog' ? ()=>window.location.reload():error==='version' ? recover:retry:undefined}/>{error && <Button variant="quiet" onClick={()=>navigate('/parent')}>{t('parent')}</Button>}</main>
  const stale=data.battles.some(b=>b.phase!=='finished' && !currentBattle(b,u01)) || data.checks.some(c=>c.phase!=='finished' && !currentCheck(c,u01))
  if(stale)return <main className="journey journey-shell"><StatePanel state="retryable-error" title={t(error==='storage'?'storageError':'versionError')} action={t('continueJourney')} onAction={recover}/></main>
  const battle=data.battles.find(b=>b.id===id)
  const check=data.checks.find(c=>c.id===id)
  if(scene==='battle' && battle && !currentBattle(battle,u01) || scene==='check' && check && !currentCheck(check,u01))return <main className="journey journey-shell"><StatePanel state="retryable-error" title={t('versionError')} action={t('returnTown')} onAction={()=>go('town')}/></main>
  const activeBattle=data.battles.find(b=>b.phase!=='finished')
  const pendingReward=data.battles.find(b=>b.phase==='finished' && b.status==='won' && currentBattle(b,u01) && !data.ledger.some(l=>l.kind==='reward' && l.battleId===b.id))
  const resumeBattle=activeBattle ?? pendingReward
  const unfinishedCheck=data.checks.find(c=>c.phase!=='finished')
  const items=Object.values(data.equipment)
  const today=localDay(clock,data.study.timeZone)
  const summary=summarize(data.attempts.filter(a=>localDay(Date.parse(a.submittedAt),data.study!.timeZone)===today))
  const due=data.reviews.filter(r=>r.dueDate<=today && u01.questions.some(q=>q.skillIds.includes(r.skillId)))
  const eligibleCards=eligibleTeachingIds(u01,data.study.taughtCards,data.placementSkills)
  const eligible=u01.questions.some(q=>q.partition==='practice' && q.teachingIds.every(id=>eligibleCards.includes(id)))
  const checkEligible=u01.questions.some(q=>q.partition==='check' && q.teachingIds.every(id=>data.study!.taughtCards.includes(id)))
  const worldOutdated=data.world && !currentWorld(data.world)
  const welcomeOpen=panel==='welcome' || u01.id==='U01' && !data.study.onboarding && !data.attempts.length && !data.study.taughtCards.length && scene==='town'
  const startBattle=()=>{if(resumeBattle){go('battle',resumeBattle.id);return}void perform(async()=>{const battle=await repo.startBattle(profileId);go('battle',battle.id)})}
  const startCheck=()=>{void perform(async()=>{const check=await repo.startCheck(profileId);go('check',check.id)})}
  return <JourneyPetContext.Provider value={pet}><main className="journey journey-shell" lang={lang==='ja'?'ja':'zh-Hant'}>
    <header className="journey-header"><div><small>{profile?.name}</small><h1>{t('title')}</h1><p>{t('coins')} {data.coins}</p></div><div className="journey-actions">
      <Button variant="quiet" onClick={()=>useAppStore.getState().setUiLang(lang==='zh'?'ja':'zh')}>{lang==='zh'?'日本語':'繁體中文'}</Button>
      <Button variant="quiet" onClick={()=>setPanel('profiles')}>{t('profiles')}</Button><Button variant="quiet" onClick={()=>navigate('/parent')}>{t('parent')}</Button>
    </div></header>
    {u01.reviewStatus!=='APPROVED' && <details className="journey-preview-banner"><summary>{t('preview')}</summary><p>{t('previewDetail')}</p><a href={`#/__review/content?unit=${u01.id}`}>{lang==='zh'?'開啟教材與美術審閱':'きょうざいとイラストのかくにん'}</a></details>}
    {error && <StatePanel state="storage-error" title={error==='catalog' ? t('catalogChanged'):error==='conflict' ? t('changed'):error==='refresh' ? t('refreshError'):error==='version' ? t('versionError'):t('storageError')} action={t(error==='catalog'?'reload':error==='conflict'?'close':'retry')} onAction={()=>{if(error==='conflict'){setError(null);return}if(error==='catalog'){window.location.reload();return}const checkpoint=failedWorld.current;if(checkpoint)void perform(()=>persist(checkpoint.position,checkpoint.facing));else retry()}}>{error!=='catalog' && error!=='conflict' && error!=='refresh' && <p>{t('storageDetail')}</p>}</StatePanel>}
    <p role="status">{notice}</p>
    {scene==='town' && <>
      <nav className="journey-actions" aria-label={t('title')} style={{marginBottom:16}}><Button variant="secondary" onClick={()=>setPanel('journal')}>{t('journal')}</Button><Button variant="secondary" onClick={()=>go('bag')}>{t('backpack')}</Button><Button variant="secondary" onClick={()=>setPanel('places')}>{t('places')}</Button><Button variant="quiet" onClick={()=>setPanel('pause')}>{t('pause')}</Button></nav>
      {worldOutdated ? <StatePanel state="retryable-error" title={t('versionError')} action={t('continueJourney')} onAction={()=>{void perform(()=>repo.recoverWorld(profileId))}}/>:<WorldScene key={`${data.world?.worldVersion ?? WORLD_VERSION}:${warp}`} initialPosition={data.world?.position ?? town.spawn} initialFacing={data.world?.facing ?? 'down'} items={items} paused={!!panel || !!resident || pending || !!error || welcomeOpen} onPersist={persist} onEnter={enter} onPause={()=>setPanel('pause')}/>}
    </>}
    {scene==='dojo' && <section className="journey-body journey-stack"><div className="journey-content-header"><h1>{t('dojo')}</h1><Button variant="secondary" onClick={()=>go('town')}>{t('returnTown')}</Button></div>
      <nav aria-label={lang==='zh'?'選擇教材':'きょうざいをえらぶ'} className="journey-actions">{availablePacks.map(pack=><Link key={pack.id} className="journey-button journey-button--secondary" aria-current={u01.id===pack.id?'page':undefined} to={`/preview/adventure?unit=${pack.id}&scene=dojo`}>{pack.id.startsWith('U') ? `${pack.id} · `:''}{pack.title}</Link>)}</nav><div className="journey-mentor"><img src={`${import.meta.env.BASE_URL}assets/img/journey/mentor.webp`} alt=""/><div><h2>{lang==='zh'?'歡迎，旅行者。':'ようこそ、たびびとさん。'}</h2><p>{u01.id.startsWith('U') ? `${u01.id} · `:''}{u01.title}</p><p>{unitIntroduction(u01.id,lang)}</p><p>{t('learnFirst')}</p><p>{t('noDeadline')}</p></div></div>
      <div className="journey-actions"><Button onClick={()=>go('learn')}>{t('teach')}</Button><Button disabled={pending || !eligible} onClick={startBattle}>{resumeBattle ? t('resume'):t('practice')}</Button><Button variant="secondary" disabled={pending || !checkEligible && !unfinishedCheck} onClick={startCheck}>{unfinishedCheck ? t('resume'):t('check')}</Button><Button variant="quiet" onClick={()=>navigate('/preview/adventure?unit=KANA-HIRA&scene=learn')}>{lang==='zh'?'先認識五十音':'かなをみる'}</Button></div>
      {u01.id.startsWith('KANA-') && <details className="journey-card"><summary style={{minHeight:64,padding:12}}>{lang==='zh'?'已經會了？先試試先修檢核':'もうしっている？ たしかめよう'}</summary><p>{lang==='zh'?'每次最多五個字，可以暫停續做。完成後，答對的字可直接練習；這不是長期掌握判定。':'いちどに5もじまで。とちゅうでやめてもつづけられます。できたもじは、れんしゅうへすすめます。'}</p><div className="journey-actions">{Array.from({length:Math.ceil(u01.teaching.length/5)},(_,group)=><Button key={group} variant="secondary" disabled={pending} onClick={()=>{void perform(async()=>{const check=await repo.startKanaPlacement(profileId,group);go('check',check.id)})}}>{u01.teaching.slice(group*5,group*5+5).map(c=>c.example).join('・')}</Button>)}</div><p>{lang==='zh'?`先修檢核通過 ${data.placementSkills.length} / 46 字`:`たしかめたもじ ${data.placementSkills.length} / 46`}</p></details>}
      {!eligible && <p>{t('learnFirst')}</p>}
    </section>}
    {scene==='learn' && <TeachingScene pack={u01} study={data.study} index={teachingIndex} onIndex={setTeachingIndex} onTeach={id=>{void perform(()=>repo.teach(profileId,id))}} onBack={()=>go('dojo')} pending={pending}/>}
    {scene==='battle' && (battle ? <BattleScene pack={u01} battle={battle} attempts={data.attempts} reviewDate={data.reviews.filter(r=>data.attempts.some(a=>a.sessionId===battle.id && a.primarySkillId===r.skillId)).map(r=>r.dueDate).sort()[0]} receipt={data.ledger.find(l=>l.battleId===battle.id)} pending={pending} onReturn={()=>{setNotice('');go('town')}} onPause={()=>{stopJourneyAudio();stopSpeaking();setPanel('pause')}} onChoose={move=>{void perform(async()=>{await repo.chooseMove(profileId,battle.id,move)})}} onSubmit={input=>saveAnswerAndRefresh(()=>repo.submitTurn(profileId,battle.id,battle.turn,input),reload)} onContinue={()=>{void perform(async()=>{await repo.continueBattle(profileId,battle.id,battle.turn)})}} onClaim={()=>{void perform(async()=>{const receipt=await repo.reward(profileId,battle.id);setNotice(`${t('claimed')} +${receipt.amount}`);go('town')})}} onRetreat={()=>{void perform(async()=>{await repo.retreat(profileId,battle.id);go('dojo')})}}/>:<StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>)}
    {scene==='check' && (check ? <CheckScene pack={u01} onPause={()=>go('dojo')} check={check} attempts={data.attempts} pending={pending} onSubmit={input=>saveAnswerAndRefresh(()=>repo.submitCheck(profileId,check.id,check.index,input),reload)} onContinue={()=>{void perform(async()=>{await repo.continueCheck(profileId,check.id,check.index)})}} onFinish={()=>{void perform(async()=>{await repo.finishCheck(profileId,check.id);go('town')})}}/>:<StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>)}
    {(scene==='shop' || scene==='bag') && <ShopScene bag={scene==='bag'} coins={data.coins} inventory={data.inventory} equipment={data.equipment} pending={pending || error==='catalog'} locked={!!activeBattle} onBack={()=>go('town')} onBuy={itemId=>{
      const purchaseId=purchaseIds.current.get(itemId) ?? crypto.randomUUID();purchaseIds.current.set(itemId,purchaseId)
      void perform(async()=>{const result=await repo.purchase(profileId,itemId,purchaseId,CATALOG_VERSION);purchaseIds.current.delete(itemId);setNotice(t(result==='already-owned'?'owned':'saved'))})
    }} onEquip={(itemId,enabled)=>{void perform(()=>repo.equip(profileId,itemId,enabled))}}/>}
    {!['town','dojo','learn','battle','check','shop','bag'].includes(scene) && <StatePanel state="retryable-error" title={t('error')} action={t('returnTown')} onAction={()=>go('town')}/>}
    <Dialog open={panel==='places'} title={t('places')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack">{town.destinations.map(d=><Button key={d.id} variant="secondary" disabled={pending} onClick={()=>enter(d,d.point,'up')}>{d.name[lang]}</Button>)}</div></Dialog>
    <Dialog open={panel==='journal'} title={t('journal')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack"><h3>{t('suggested')}</h3><p>{t('noDeadline')}</p><p>{t('sections')} {summary.completedSections} / {data.study.gradeBand+1}</p><Progress label={t('partial')} value={summary.partialSection} max={5}/><p>{due.length ? `${t('due')} (${due.length})`:t('noDue')}</p>
      <label>{t('grade')} <select value={data.study.gradeBand} onChange={e=>{const value=Number(e.target.value) as 1|2|3;void perform(()=>repo.setGradeBand(profileId,value))}} style={{minHeight:64,padding:12,maxWidth:'100%'}}>{([1,2,3] as const).map(g=><option key={g} value={g}>{t(g===1?'grade1':g===2?'grade2':'grade3')}</option>)}</select></label>
      <Button onClick={()=>go('dojo')}>{t('dojo')}</Button>{resumeBattle && <Button variant="secondary" onClick={()=>go('battle',resumeBattle.id)}>{t('resume')}</Button>}{unfinishedCheck && <Button variant="secondary" onClick={()=>go('check',unfinishedCheck.id)}>{t('check')}</Button>}
      <Button variant="quiet" onClick={()=>setPanel('welcome')}>{t('replayIntro')}</Button><h3>{t('story')}</h3>{(Array.isArray(data.world?.storyFlags) ? data.world.storyFlags:[]).map(flag=><p key={flag}>{town.destinations.find(d=>d.id===flag)?.name[lang]}</p>)}
      <OfflinePack/>
    </div></Dialog>
    <Dialog open={panel==='profiles'} title={t('profiles')} closeLabel={t('close')} onClose={()=>setPanel(null)}><div className="journey-stack">{profiles.map(p=><Button key={p.profile_id} variant="secondary" aria-pressed={p.profile_id===profileId} onClick={()=>{stopJourneyAudio();setActiveProfileId(p.profile_id)}}>{p.name}</Button>)}<Button variant="quiet" onClick={()=>navigate('/profiles/new')}>{lang==='zh'?'新增玩家':'プレイヤーをふやす'}</Button></div></Dialog>
    <Dialog open={panel==='pause'} title={t('rest')} closeLabel={t('close')} onClose={()=>setPanel(null)}><Button onClick={()=>setPanel(null)}>{t('continueJourney')}</Button></Dialog>
    {welcomeOpen && <WelcomeSetup name={profile?.name ?? ''} gradeBand={data.study.gradeBand} comfort={data.study.onboarding?.comfort ?? 'new'} pending={pending} error={error} onRetry={retry} onSave={settings=>{void perform(async()=>{await repo.configureJourney(profileId,{...settings,skipped:false});setPanel(null)})}} onSkip={()=>{if(data.study!.onboarding){setPanel(null);return}void perform(async()=>{await repo.configureJourney(profileId,{gradeBand:data.study!.gradeBand,comfort:'new',skipped:true});setPanel(null)})}}/>}
    <Dialog open={!!resident} title={resident?.name[lang] ?? ''} closeLabel={t('close')} onClose={()=>setResident(null)}>{resident && <div className="journey-stack"><img src={`${import.meta.env.BASE_URL}assets/img/journey/${resident.asset}.webp`} style={{width:180,maxHeight:200,objectFit:'contain',margin:'auto'}} alt=""/><p>{resident.dialogue?.[line]?.[lang]}</p>{resident.dialogue?.[line]?.audioSrc && <AudioControl key={`${resident.id}:${line}`} src={resident.dialogue[line].audioSrc!} labels={{play:t('play'),playing:t('playing'),loading:t('audioLoading'),error:t('voiceError'),stop:t('stopAudio')}} onComplete={()=>{}}/>}<Button onClick={()=>{if(line+1<(resident.dialogue?.length ?? 0))setLine(line+1);else setResident(null)}}>{t('next')}</Button></div>}</Dialog>
  </main></JourneyPetContext.Provider>
}
