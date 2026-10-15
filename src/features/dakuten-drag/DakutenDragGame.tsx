import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckpointState, usePracticeSession } from '../../hooks/usePracticeSession'
import { useAdventureChallenge } from '../../hooks/useAdventureChallenge'
import { lessonData } from '../../data/loaders'
import { speak, stopSpeaking } from '../../lib/tts'
import { playSfx } from '../../lib/audio'
import { useT } from '../../hooks/useT'
import { buildQuestions, shuffleQuestions, checkAnswer, getProgressId, type DragQuestion } from './DakutenDragEngine'

export default function DakutenDragGame() {
  const practice=usePracticeSession(),adventure=useAdventureChallenge(),t=useT(),navigate=useNavigate()
  const [questions]=useCheckpointState<DragQuestion[]>('questions',()=>{
    const ov=adventure.pending?.configOverrides
    const unitId=ov?.unitId
    const lesson=typeof unitId==='string'?lessonData().find(l=>l.unit_id===unitId):lessonData().find(l=>(l.dakuten_drag_items?.length??0)>0)
    const round=lesson?shuffleQuestions(buildQuestions(lesson)):[]
    return typeof ov?.roundLength==='number'?round.slice(0,Math.max(0,ov.roundLength)):round
  })
  const [placements,setPlacements]=useCheckpointState<Record<number,number[]>>('placements',{})
  const [index,setIndex]=useState(()=>practice.summary.completed)
  const [done,setDone]=useState(false)
  const [finishedQuestion,setFinishedQuestion]=useState(false)
  const [wrong,setWrong]=useState<number|null>(null)
  const [selected,setSelected]=useState(false)
  const [drag,setDrag]=useState<{x:number;y:number}|null>(null)
  const dragging=useRef(false),lock=useRef(false)
  const tiles=useRef<(HTMLButtonElement|null)[]>([])
  const current=questions[index]
  const marks=placements[index]??[]
  const save=practice.save
  useEffect(()=>{void save({},questions.length).catch(()=>{})},[save,questions.length])
  useEffect(()=>{if(current)speak(current.item.target);return stopSpeaking},[current])
  async function place(tile:number) {
    if(!current||lock.current||finishedQuestion||tile<0||tile>=current.baseChars.length||marks.includes(tile))return
    lock.current=true
    try {
      if(!checkAnswer(current,tile)) {
        await practice.answer(`q:${index}`,getProgressId(current.item),'vocab',false)
        if(practice.alive()){setWrong(tile);playSfx('wrong')}
        return
      }
      const next=[...marks,tile]
      await save({placements:{...placements,[index]:next}})
      if(current.item.mark_at.every(i=>next.includes(i)))await practice.answer(`q:${index}`,getProgressId(current.item),'vocab',true)
      if(!practice.alive())return
      setPlacements(prev=>({...prev,[index]:next}));setWrong(null);playSfx('correct')
      if(current.item.mark_at.every(i=>next.includes(i)))setFinishedQuestion(true)
    } finally {lock.current=false}
  }
  async function next() {
    if(lock.current)return
    lock.current=true
    try {
      if(index+1>=questions.length){await practice.finish();if(practice.alive())setDone(true)}
      else{setIndex(i=>i+1);setFinishedQuestion(false);setWrong(null);setSelected(false)}
    }finally{lock.current=false}
  }
  if(!questions.length)return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-6" onClick={()=>navigate('/play')}>{t('back')}</button></div>
  if(done||!current)return <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-violet-50"><h1 className="text-5xl text-pink-500">{t('done')}</h1><p>{t('firstAccuracy')}: {Math.round((practice.summary.firstAccuracy??0)*100)}% ({practice.summary.correct}/{practice.summary.total})</p><p>{t('practiceCompletion')}: 100%</p>{adventure.isActive?<button className="min-h-16 rounded-2xl bg-indigo-600 px-8 text-white" onClick={()=>{void adventure.submitResult(practice.summary.firstAccuracy??0,0)}}>{t('adventureReturn')}</button>:<button className="min-h-16 px-8" onClick={()=>{void practice.restart()}}>{t('playAgain')}</button>}<button className="min-h-16 px-8" onClick={()=>navigate('/play')}>{t('home')}</button></div>
  const symbol=current.item.mark==='handakuten'?'゜':'゛'
  return <div className="min-h-screen flex flex-col items-center gap-6 p-4 pt-6 bg-gradient-to-b from-violet-100 to-pink-50">
    <div className="w-full max-w-md flex items-center justify-between"><button className="min-h-16 min-w-16 rounded-full bg-gray-200" aria-label={t('backAria')} onClick={()=>adventure.isActive?void adventure.cancelChallenge():navigate('/play')}>←</button><span>{index+1}/{questions.length}</span></div>
    <h1 className="text-3xl text-violet-800">{t('dakutenQuestion').replace('{mark}',symbol)}</h1>
    <p className="text-xl">{current.item.meaning_zh}</p>
    <div className="flex flex-wrap justify-center gap-3">{current.baseChars.map((char,i)=><button key={i} type="button" ref={el=>{tiles.current[i]=el}} aria-label={`${char} ${i+1}`} disabled={finishedQuestion} onClick={()=>{if(selected)void place(i)}} className={`w-20 h-24 rounded-3xl border-4 text-5xl shadow ${marks.includes(i)?'bg-green-300 border-green-600':wrong===i?'bg-red-100 border-red-500':'bg-white border-violet-300'}`}>{marks.includes(i)?current.targetChars[i]:char}</button>)}</div>
    <button type="button" aria-pressed={selected} aria-label={t('dakutenDragAria').replace('{mark}',symbol)} disabled={finishedQuestion} className="h-20 w-20 rounded-full bg-red-400 text-5xl text-white" style={{touchAction:'none'}}
      onClick={()=>setSelected(true)}
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);dragging.current=true;setDrag({x:e.clientX,y:e.clientY});setSelected(true)}}
      onPointerMove={e=>{if(dragging.current)setDrag({x:e.clientX,y:e.clientY})}}
      onPointerCancel={()=>{dragging.current=false;setDrag(null)}}
      onPointerUp={e=>{if(!dragging.current)return;dragging.current=false;setDrag(null);const target=tiles.current.findIndex(el=>{if(!el)return false;const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});if(target>=0)void place(target)}}>{symbol}</button>
    {drag&&<div className="pointer-events-none fixed text-5xl" style={{left:drag.x-20,top:drag.y-20}}>{symbol}</div>}
    <p>{t('dragOrTap')}</p>
    {wrong!==null&&<p role="status">{t('answerExplanation')}</p>}
    {finishedQuestion&&<button className="min-h-16 rounded-2xl bg-emerald-600 px-8 text-white" onClick={()=>{void next()}}>{t('nextQuestion')}</button>}
  </div>
}
