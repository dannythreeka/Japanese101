import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
import { useCheckpointState, usePracticeSession } from '../../hooks/usePracticeSession'
import { speak, stopSpeaking } from '../../lib/tts'
import { buildKotodamaRound } from './KotodamaEngine'
import { lessonData } from '../../data/loaders'
import { SCENE_REGISTRY } from './scenes'
import { useT } from '../../hooks/useT'
import { createMicSession, DEFAULT_CONFIG, EASY_CONFIG, type MicSession, type MicOutcome } from '../../lib/mic'

type Phase='initial'|'listening'|'saving'|'success'|'done'
export default function KotodamaGame() {
  const practice=usePracticeSession(),adventure=useAdventureChallenge(),navigate=useNavigate(),t=useT()
  const {micMode,enhancedConsent,ageMode}=useAppStore()
  const [words]=useCheckpointState('words',()=>{
    const ov=adventure.pending?.configOverrides,pool=ov?.unitPool,count=typeof ov?.roundLength==='number'?ov.roundLength:3
    if(Array.isArray(pool)){const lessons=lessonData().filter(l=>(pool as string[]).includes(l.unit_id));return lessons.length?buildKotodamaRound(lessons,count):[]}
    return buildKotodamaRound(undefined,count)
  })
  const [stars,setStars]=useCheckpointState<number[]>('stars',[])
  const [index,setIndex]=useState(()=>practice.summary.completed)
  const [phase,setPhase]=useState<Phase>(()=>practice.session.status==='finished'?'done':'initial')
  const [outcome,setOutcome]=useState<MicOutcome|null>(null)
  const [micError,setMicError]=useState(false)
  const mic=useRef<MicSession|null>(null),controller=useRef<AbortController|null>(null)
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null),lock=useRef(false)
  const bars=useRef<(HTMLDivElement|null)[]>([])
  const current=words[index]
  const {save,alive}=practice
  useEffect(()=>{void save({},words.length).catch(()=>{})},[save,words.length])
  useEffect(()=>{
    if(current)speak(current.word,.8)
    return()=>{controller.current?.abort();mic.current?.stop();mic.current=null;if(timer.current)clearTimeout(timer.current);stopSpeaking()}
  },[current])
  useEffect(()=>{
    if(phase!=='listening')return
    const currentBars = bars.current
    let raf=0,active=true
    const tick=()=>{if(!active)return;const rms=mic.current?.getRms()??0;bars.current.forEach((bar,n)=>{if(bar)bar.style.height=`${Math.min(56,6+rms*300*(n%2?.7:1))}px`});raf=requestAnimationFrame(tick)}
    raf=requestAnimationFrame(tick)
    return()=>{active=false;cancelAnimationFrame(raf);currentBars.forEach(bar=>{if(bar)bar.style.height='6px'})}
  },[phase])
  const stop=useCallback(async()=>{
    if(timer.current){clearTimeout(timer.current);timer.current=null}
    if(!mic.current){controller.current?.abort();lock.current=false;if(alive())setPhase('initial');return}
    const result=mic.current.stop();mic.current=null
    setPhase('saving')
    try {
      const success=result.outcome==='good'||result.outcome==='perfect'
      const next=[...stars];next[index]=success?1:0
      await practice.answer(`q:${index}`,current.id,'vocab',success,true,success?{stars:next}:{})
      if(!alive())return
      setOutcome(result.outcome)
      if(success){setStars(next);setPhase('success')}else setPhase('initial')
    }finally{lock.current=false}
  },[alive,current,index,practice,stars,setStars])
  async function start() {
    if(lock.current||phase!=='initial'||!current||micMode==='off')return
    lock.current=true;setMicError(false);setOutcome(null);setPhase('listening')
    const abort=new AbortController();controller.current?.abort();controller.current=abort
    try {
      const config=ageMode==='young'?EASY_CONFIG:DEFAULT_CONFIG
      const session=await createMicSession(config,micMode,current.word,{enhancedConsent,signal:abort.signal})
      if(!alive()||abort.signal.aborted){session.stop();return}
      mic.current=session;timer.current=setTimeout(()=>{void stop()},config.maxRecordDurationMs)
    }catch{if(alive()&&!abort.signal.aborted){setMicError(true);setPhase('initial')}lock.current=false}
  }
  async function skip() {
    controller.current?.abort();mic.current?.stop();mic.current=null;if(timer.current)clearTimeout(timer.current)
    if(!current)return
    const next=[...stars];next[index]=0
    await practice.answer(`q:${index}`,current.id,'vocab',null,true,{stars:next})
    if(alive()){setStars(next);setPhase('success');lock.current=false}
  }
  async function next() {
    if(lock.current)return
    lock.current=true
    try {
      if(index+1>=words.length){await practice.finish();if(alive())setPhase('done')}
      else{setIndex(n=>n+1);setOutcome(null);setMicError(false);setPhase('initial')}
    }finally{lock.current=false}
  }
  if(micMode==='off')return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>{t('micDisabled')}</p><button className="min-h-16 px-8" onClick={()=>adventure.isActive?void adventure.cancelChallenge():navigate('/play')}>{t('back')}</button></div>
  if(!words.length)return <div role="alert"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-8" onClick={()=>navigate('/play')}>{t('back')}</button></div>
  if(phase==='done'||!current)return <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-purple-50"><h1 className="text-4xl text-indigo-700">{t('kotodamaDone')}</h1><p>{t('participationOnly')}</p>{words.map((word,i)=><p key={`${word.id}:${i}`} lang="ja">{word.word} {stars[i]?'⭐':'—'}</p>)}{adventure.isActive?<button className="min-h-16 rounded-2xl bg-indigo-600 px-8 text-white" onClick={()=>{void adventure.submitResult(0,0)}}>{t('adventureReturn')}</button>:<button className="min-h-16 px-8" onClick={()=>{void practice.restart()}}>{t('playAgain')}</button>}<button className="min-h-16 px-8" onClick={()=>navigate('/play')}>{t('home')}</button></div>
  const Scene=current.kotodama_scene?SCENE_REGISTRY[current.kotodama_scene.scene_id]:null
  return <div className="min-h-screen flex flex-col items-center gap-6 px-4 py-6 bg-gradient-to-b from-indigo-100 to-purple-100">
    <div className="w-full max-w-sm flex items-center justify-between"><button aria-label={t('backAria')} className="min-h-16 min-w-16 rounded-full bg-white" onClick={()=>adventure.isActive?void adventure.cancelChallenge():navigate('/play')}>←</button><span>{index+1}/{words.length}</span></div>
    {Scene&&<div className="w-full max-w-sm rounded-2xl overflow-hidden"><Scene success={phase==='success'}/></div>}
    <h1 lang="ja" className="text-5xl font-bold text-indigo-800">{current.word}</h1><p className="text-2xl">{current.meaning_zh}</p><p>{t('participationOnly')}</p>
    <div className="flex h-14 items-center gap-1" aria-hidden="true">{Array.from({length:9},(_,n)=><div key={n} ref={el=>{bars.current[n]=el}} className="w-2 rounded-full bg-indigo-400" style={{height:'6px'}}/>)}</div>
    {micError&&<p role="alert">{t('micUnavailable')}</p>}
    {outcome&&<p role="status">{t(outcome==='silent'?'outcomeSilent':outcome==='weak'?'outcomeWeak':'voiceCompleted')}</p>}
    {phase==='success'?<button className="min-h-16 rounded-2xl bg-emerald-600 px-8 text-white" onClick={()=>{void next()}}>{t('nextQuestion')}</button>:<><button className="h-24 w-24 rounded-full bg-indigo-500 text-5xl text-white" disabled={phase==='saving'} aria-label={t('voiceControl')} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);void start()}} onPointerUp={()=>{void stop()}} onPointerCancel={()=>{void stop()}} onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();void start()}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();void stop()}}}>🎤</button><button className="min-h-16 px-8" disabled={phase==='saving'} onClick={()=>{void skip()}}>{t('skipQuestion')}</button></>}
  </div>
}
