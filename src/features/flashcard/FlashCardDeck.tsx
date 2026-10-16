import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Word } from '../../types'
import { useCheckpointState, usePracticeSession } from '../../hooks/usePracticeSession'
import { vocabData, lessonData } from '../../data/loaders'
import { useT } from '../../hooks/useT'
import FlashCard from './FlashCard'
import SpeakButton from '../../components/SpeakButton'
const ALL_WORDS = vocabData()
const UNIT_LABELS: Record<string, string> = {
  ...Object.fromEntries(lessonData().map(l=>[l.unit_id,l.unit_name_zh])),
  mitsumura_g1_u1_tutorial: '入門：認識夥伴',
  topic_animals: '動物',
  topic_food: '食物',
  topic_colors: '顏色',
  topic_numbers: '數字',
  topic_body: '身體',
  topic_feelings: '心情',
  topic_daily: '日常',
}

const UNIT_JAPANESE: Record<string, string> = {
  topic_animals: 'どうぶつ',
  topic_food: 'たべもの',
  topic_colors: 'いろ',
  topic_numbers: 'かず',
  topic_body: 'からだ',
  topic_feelings: 'きもち',
  topic_daily: 'にちじょう',
}

const unitIds = [...new Set(ALL_WORDS.map((w) => w.unit).filter((u): u is string => u !== undefined))]

export default function FlashCardDeck() {
  const practice=usePracticeSession(), t=useT(), navigate=useNavigate()
  const [unitId]=useCheckpointState('unitId',unitIds[0])
  const [queue]=useCheckpointState<Word[]>('queue',()=>ALL_WORDS.filter(w=>w.unit===unitId))
  const [index,setIndex]=useState(()=>practice.summary.completed)
  const [revision,setRevision]=useState(0)
  const [done,setDone]=useState(()=>practice.session.status==='finished')
  const busy=useRef(false)
  const save=practice.save
  useEffect(()=>{void save({},queue.length).catch(()=>{})},[save,queue.length])
  async function answer(known:boolean) {
    const word=queue[index]
    if(!word||busy.current)return
    busy.current=true
    try {
      await practice.answer(`q:${index}`,word.id,'vocab',known,true)
      if(!practice.alive())return
      if(!known){setRevision(r=>r+1);return}
      if(index+1>=queue.length){await practice.finish();if(practice.alive())setDone(true)}
      else setIndex(index+1)
    } finally {busy.current=false}
  }
  return <div className="min-h-screen flex flex-col items-center gap-4 p-4 pt-6">
    <div className="w-full max-w-md flex items-center gap-3"><button className="min-h-16 min-w-16 rounded-full bg-gray-200" aria-label={t('homeAria')} onClick={()=>navigate('/play')}>←</button><span className="min-w-0 flex-1 text-lg font-bold text-pink-500">{UNIT_LABELS[unitId]??t('gameFlashcard')}</span>{UNIT_JAPANESE[unitId]&&<SpeakButton text={UNIT_JAPANESE[unitId]}/>} <span>{Math.min(index+1,queue.length)}/{queue.length}</span></div>
    <div className="flex max-w-full flex-wrap gap-3">{unitIds.map(id=><button key={id} className={`min-h-16 rounded-2xl px-4 ${id===unitId?'bg-pink-400 text-white':'bg-white'}`} onClick={()=>{void practice.restart({unitId:id})}}>{UNIT_LABELS[id]??t('gameFlashcard')}</button>)}</div>
    <p>{t('participationOnly')}</p>
    {done?<><h1 className="text-4xl text-green-600">{t('done')}</h1><p>{t('practiceCompletion')}: 100%</p><button className="min-h-16 px-8" onClick={()=>{void practice.restart({unitId})}}>{t('playAgain')}</button></>:queue[index]?<FlashCard key={`${index}:${revision}`} word={queue[index]} onKnow={()=>{void answer(true)}} onDontKnow={()=>{void answer(false)}}/>:<p role="alert">{t('questionUnavailable')}</p>}
  </div>
}
