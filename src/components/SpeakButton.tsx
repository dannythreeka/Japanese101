import { useEffect, useRef, useState } from 'react'
import { playSpeech, stopSpeaking } from '../lib/tts'
import { useT } from '../hooks/useT'
interface SpeakButtonProps {text:string;className?:string;size?:'sm'|'md'|'lg'}
const sizeClasses={sm:'w-16 h-16 text-xl',md:'w-16 h-16 text-2xl',lg:'w-20 h-20 text-3xl'}
export default function SpeakButton({text,className='',size='md'}:SpeakButtonProps){
  const t=useT(),[failed,setFailed]=useState<string|null>(null),generation=useRef(0)
  useEffect(()=>()=>{generation.current++;stopSpeaking()},[text])
  async function play(){
    const token=++generation.current
    try{await playSpeech(text);if(token===generation.current)setFailed(null)}
    catch(error){if(token===generation.current&&!(error instanceof DOMException&&error.name==='AbortError'))setFailed(text)}
  }
  return <div className="flex max-w-full flex-col items-center gap-2"><button type="button" aria-label={t('listenAgainAria')} onClick={()=>{void play()}} className={`${sizeClasses[size]} rounded-full bg-yellow-400 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${className}`}>🔊</button>{failed===text&&<p role="alert" className="max-w-64 text-base text-gray-700">{t('audioUnavailable')}</p>}</div>
}
