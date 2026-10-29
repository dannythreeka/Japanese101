import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { duckBgm } from '../../lib/audio'
import { stopSpeaking } from '../../lib/tts'
import { claimJourneyAudio, releaseJourneyAudio, stopJourneyAudio } from '../../lib/journeyAudio'
import './journey-ui.css'

export const Button=forwardRef<HTMLButtonElement,ButtonHTMLAttributes<HTMLButtonElement> & {variant?:'primary'|'secondary'|'quiet'}>(function Button({variant='primary',className='',type='button',...props},ref){
  return <button {...props} ref={ref} type={type} className={`journey-button journey-button--${variant} ${className}`}/>
})
export function ChoiceCard({selected,children,...props}:ButtonHTMLAttributes<HTMLButtonElement> & {selected:boolean}) {
  return <Button {...props} variant="secondary" aria-pressed={selected} className={`journey-choice ${selected ? 'is-selected':''}`}>{children}</Button>
}
export function Progress({label,value,max}: {label:string;value:number;max:number}) {
  return <label className="journey-progress"><span>{label}</span><progress value={Math.max(0,value)} max={Math.max(1,max)}/><span>{value} / {max}</span></label>
}
export function Dialog({open,title,onClose,closeLabel,children}: {open:boolean;title:string;onClose:()=>void;closeLabel:string;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null);const titleId=useId()
  useEffect(()=>{
    const dialog=ref.current
    if(!open || !dialog)return
    const previous=document.activeElement instanceof HTMLElement ? document.activeElement:null
    if(!dialog.open)dialog.showModal()
    return ()=>{dialog.close();if(previous?.isConnected)previous.focus()}
  },[open])
  return <dialog ref={ref} className="journey-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose()}}>
    <div className="journey-dialog__heading"><h2 id={titleId}>{title}</h2><Button variant="quiet" aria-label={closeLabel} onClick={onClose}>{closeLabel}</Button></div>
    {children}
  </dialog>
}
export type ScreenState='loading'|'success'|'empty'|'retryable-error'|'offline-missing'|'storage-error'
export function StatePanel({state,title,children,action,onAction}: {state:ScreenState;title:string;children?:ReactNode;action?:string;onAction?:()=>void}) {
  return <section className={`journey-state journey-state--${state}`} role={state==='storage-error' || state==='retryable-error' ? 'alert':'status'}><h2>{title}</h2>{children}{onAction && action && <Button onClick={onAction}>{action}</Button>}</section>
}
export function Feedback({correct,title,children}: {correct:boolean|null;title:string;children:ReactNode}) {
  return <section className={`journey-feedback ${correct ? 'is-correct':''}`} aria-live="polite"><h2>{title}</h2>{children}</section>
}

export function AudioControl({src,labels,onComplete}: {src:string;labels:{play:string;playing:string;loading:string;error:string;stop:string};onComplete:()=>void}) {
  const [state,setState]=useState<'ready'|'loading'|'playing'|'error'>('ready')
  const audioRef=useRef<HTMLAudioElement|null>(null)
  const generation=useRef(0)
  const ownerStop=useRef<(()=>void)|null>(null)
  const ownerCleanup=useRef<(()=>void)|null>(null)
  const completed=useRef(onComplete)
  useEffect(()=>{completed.current=onComplete},[onComplete])
  useEffect(()=>{
    const stop=()=>{
      generation.current++
      ownerCleanup.current?.();ownerCleanup.current=null
      const audio=audioRef.current
      if(audio){audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();audio.removeAttribute('src');audio.load();audioRef.current=null}
      duckBgm(false)
    }
    return ()=>{stop();if(ownerStop.current)releaseJourneyAudio(ownerStop.current);ownerStop.current=null}
  },[src])
  async function play(){
    stopJourneyAudio();stopSpeaking()
    generation.current++;const current=generation.current
    let audio:HTMLAudioElement
    try{audio=new Audio(src.startsWith('/') ? `${import.meta.env.BASE_URL}${src.slice(1)}`:src)}catch{setState('error');return}
    audioRef.current=audio;setState('loading');duckBgm(true)
    const cleanup=()=>{clearTimeout(timer);audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();audio.removeAttribute('src');audio.load();if(audioRef.current===audio)audioRef.current=null;if(ownerCleanup.current===cleanup)ownerCleanup.current=null;duckBgm(false)}
    ownerCleanup.current=cleanup
    const stop=()=>{generation.current++;cleanup();setState('ready')}
    ownerStop.current=stop;claimJourneyAudio(stop)
    audio.onplaying=()=>{if(generation.current===current)setState('playing')}
    audio.onended=()=>{if(generation.current!==current)return;cleanup();setState('ready');releaseJourneyAudio(stop);completed.current()}
    const fail=()=>{if(generation.current!==current)return;cleanup();setState('error');releaseJourneyAudio(stop)}
    audio.onerror=fail
    const timer=setTimeout(fail,45000)
    try{await audio.play()}catch{if(generation.current===current){cleanup();setState('error');releaseJourneyAudio(stop)}}
  }
  return <div className="journey-audio"><Button variant="secondary" onClick={()=>{if(state==='playing' || state==='loading')stopJourneyAudio();else void play()}} aria-label={state==='playing' || state==='loading' ? labels.stop:labels.play}>
    <span aria-hidden="true">{state==='playing' ? 'Ⅱ':'▷'}</span> {state==='loading' ? labels.loading:state==='playing' ? labels.playing:labels.play}
  </Button>{state==='error' && <p role="alert">{labels.error}</p>}</div>
}
