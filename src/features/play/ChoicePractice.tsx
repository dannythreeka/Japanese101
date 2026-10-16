import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Kana, Word } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { useCheckpointState, usePracticeSession } from '../../hooks/usePracticeSession'
import { kanaData, vocabData } from '../../data/loaders'
import { playSpeech, stopSpeaking } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import { useT } from '../../hooks/useT'
import KanaCard from '../kana/KanaCard'

type Round = { kind: 'kana'; correct: Kana; choices: Kana[] } | { kind: 'quiz'; correct: Word; choices: Word[] }
function shuffle<T>(items: T[]): T[] { return [...items].map(item=>({item,rank:Math.random()})).sort((a,b)=>a.rank-b.rank).map(x=>x.item) }
function build(mode: 'kana'|'quiz', difficulty: number|'all'): Round[] {
  if(mode==='kana') {
    const pool=kanaData().filter(k=>difficulty==='all'||k.difficulty<=difficulty)
    if(pool.length<2)return []
    return shuffle(pool).slice(0,10).map(correct=>({kind:'kana',correct,choices:shuffle([correct,...shuffle(pool.filter(k=>k.id!==correct.id)).slice(0,3)])}))
  }
  const pool=vocabData()
  if(pool.length<2)return []
  return shuffle(pool).slice(0,10).map(correct=>({kind:'quiz',correct,choices:shuffle([correct,...shuffle(pool.filter(w=>w.id!==correct.id)).slice(0,3)])}))
}
export default function ChoicePractice({mode}:{mode:'kana'|'quiz'}) {
  const practice=usePracticeSession(), t=useT(), navigate=useNavigate()
  const {kanaDifficulty,kanaMode}=useAppStore()
  const [rounds]=useCheckpointState<Round[]>('rounds',()=>build(mode,kanaDifficulty))
  const [index,setIndex]=useState(()=>practice.summary.completed)
  const [selected,setSelected]=useState<string|null>(null)
  const [feedback,setFeedback]=useState<'correct'|'wrong'|'skipped'|null>(null)
  const [done,setDone]=useState(false)
  const [busy,setBusy]=useState(false)
  const lock=useRef(false)
  const [heard,setHeard]=useState<string|null>(null)
  const [audioError,setAudioError]=useState<string|null>(null)
  const audioToken=useRef(0)
  const {save,answer,finish,alive}=practice
  const current=rounds[index]
  const questionKey=`q:${index}`
  const text=current?.kind==='quiz'?current.correct.kana:''
  const play=useCallback(async()=>{
    if(!text)return
    const token=++audioToken.current
    try{await playSpeech(text,.8);if(alive()&&token===audioToken.current){setHeard(questionKey);setAudioError(null)}}
    catch(error){if(alive()&&token===audioToken.current&&!(error instanceof DOMException&&error.name==='AbortError'))setAudioError(questionKey)}
  },[text,questionKey,alive])
  useEffect(()=>{void save({},rounds.length).catch(()=>{})},[save,rounds.length])
  useEffect(()=>{
    if (!text) return
    let active = true
    void playSpeech(text,.8).then(()=>{if(active&&alive()){setHeard(questionKey);setAudioError(null)}}).catch(error=>{
      if(active&&alive()&&!(error instanceof DOMException&&error.name==='AbortError'))setAudioError(questionKey)
    })
    return()=>{active=false;stopSpeaking()}
  },[text,questionKey,alive])
  const ready=mode==='kana'||heard===questionKey
  async function submit(skip=false) {
    if(!current||lock.current||feedback||(!skip&&(!ready||!selected)))return
    lock.current=true;setBusy(true)
    try {
      const correct=selected===current.correct.id
      await answer(questionKey,current.correct.id,mode==='kana'?'kana':'vocab',skip?null:correct)
      if(!alive())return
      setFeedback(skip?'skipped':correct?'correct':'wrong')
      playSfx(correct&&!skip?'correct':'wrong')
    } finally {lock.current=false;if(alive())setBusy(false)}
  }
  async function next() {
    if(lock.current)return
    lock.current=true
    try {
      if(index+1>=rounds.length){await finish();if(alive())setDone(true)}
      else{setIndex(index+1);setSelected(null);setFeedback(null)}
    } finally {lock.current=false}
  }
  if(!rounds.length)return <div role="alert"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-8" onClick={()=>navigate('/play')}>{t('back')}</button></div>
  if(done||!current)return <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"><h1 className="text-5xl text-pink-500">{t('done')}</h1><p>{t('firstAccuracy')}: {Math.round((practice.summary.firstAccuracy??0)*100)}% ({practice.summary.correct}/{practice.summary.total})</p><p>{t('practiceCompletion')}: 100%</p><button className="min-h-16 rounded-2xl bg-green-400 px-8" onClick={()=>{void practice.restart()}}>{t('playAgain')}</button><button className="min-h-16 px-8" onClick={()=>navigate('/play')}>{t('home')}</button></div>
  const correctLabel=current.kind==='kana'?current.correct.romaji:current.correct.meaning_zh
  return <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-6">
    <div className="w-full max-w-md flex items-center justify-between gap-3"><button className="min-h-16 min-w-16 rounded-full bg-gray-200" aria-label={t('homeAria')} onClick={()=>navigate('/play')}>←</button><span>{index+1}/{rounds.length}</span></div>
    {current.kind==='kana'?<KanaCard item={current.correct} mode={kanaMode} showRomaji={false} className="w-full max-w-md min-h-52"/>:<button className="min-h-16 rounded-2xl bg-sky-100 px-8" aria-label={t('listenAgainAria')} onClick={()=>{void play()}}>🔊 {t('listenAgainAria')}</button>}
    {audioError===questionKey&&<p role="alert">{t('audioUnavailable')}</p>}
    <div className="w-full max-w-md grid grid-cols-2 gap-4">{current.choices.map(choice=><button key={choice.id} type="button" disabled={busy||feedback!==null||!ready} aria-pressed={selected===choice.id} onClick={()=>setSelected(choice.id)} className={`min-h-20 rounded-2xl px-3 text-2xl font-bold shadow-md ${selected===choice.id?'bg-indigo-100 ring-4 ring-indigo-500':'bg-white'}`}>{'hiragana'in choice?choice.romaji:<><span className="text-5xl">{choice.emoji}</span><span className="block text-base">{choice.meaning_zh}</span></>}</button>)}</div>
    {!feedback?<><button className="min-h-16 rounded-2xl bg-emerald-600 px-8 text-white disabled:opacity-50" disabled={busy||!ready||!selected} onClick={()=>{void submit()}}>{t('confirmAnswer')}</button><button className="min-h-16 px-6" disabled={busy} onClick={()=>{void submit(true)}}>{t('skipQuestion')}</button></>:<div role="status" className="w-full max-w-md rounded-2xl bg-white p-6"><p>{t('answerExplanation')}</p><p className="text-2xl">{correctLabel}</p><button className="min-h-16 px-6" onClick={()=>{if(feedback==='wrong'){setFeedback(null);setSelected(null)}else void next()}}>{t(feedback==='wrong'?'tryAgainQuestion':'nextQuestion')}</button></div>}
  </div>
}
