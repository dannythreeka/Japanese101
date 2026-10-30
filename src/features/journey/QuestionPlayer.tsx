import ContextImage from './ContextImage'
import { useRef, useState } from 'react'
import type { Attempt, Question } from '../../content/contracts'
import { AudioControl, Button, ChoiceCard, Feedback, StatePanel } from '../../components/ui/journey-ui'
import { useJourneyText } from './text'
import { AnswerRefreshError } from '../../lib/answerCommit'

export interface AnswerInput {answerIds:string[]|null;hintUsed:boolean;audioPlayCount:number;responseMs:number}
/** Parent keys this by the durable questionInstanceId, never by a randomly selected item. */
export default function QuestionPlayer({question,attempt,onSubmit,onContinue,hideAssessmentFeedback=false}: {question:Question;attempt?:Attempt;onSubmit:(input:AnswerInput)=>Promise<void>;onContinue:()=>void;hideAssessmentFeedback?:boolean}) {
  const {t,lang}=useJourneyText()
  const [selected,setSelected]=useState<string[]>([])
  const [hintUsed,setHintUsed]=useState(false)
  const [audioPlayCount,setAudioPlayCount]=useState(0)
  const [saving,setSaving]=useState(false)
  const [failed,setFailed]=useState<false|'storage'|'refresh'>(false)
  const refreshOnly=useRef<(()=>Promise<unknown>)|null>(null)
  const pending=useRef<AnswerInput|null>(null)
  const [started]=useState(()=>Date.now())
  const audioReady=question.audioPolicy!=='required' || audioPlayCount>0
  const complete=question.kind==='order' ? selected.length===question.choices.length:selected.length===1
  const locked=!!attempt || saving || !!failed
  async function submit(skip=false) {
    if(saving || attempt)return
    const input=pending.current ?? {answerIds:skip ? null:[...selected],hintUsed,audioPlayCount,responseMs:Math.max(0,Math.round(Date.now()-started))}
    pending.current=input;setSaving(true);setFailed(false)
    try{if(refreshOnly.current)await refreshOnly.current();else await onSubmit(input);pending.current=null;refreshOnly.current=null}catch(error){if(error instanceof AnswerRefreshError)refreshOnly.current=error.refresh;setFailed(refreshOnly.current?'refresh':'storage')}finally{setSaving(false)}
  }
  const chosen=(attempt?.answerIds ?? selected).map(id=>question.choices.find(c=>c.id===id)?.text ?? '').join(' ')
  return <section className="journey-stack" aria-busy={saving}>
    <h2>{lang==='ja' ? question.promptJa ?? question.prompt:question.prompt}</h2>
    {question.image && <ContextImage image={question.image} lang={lang}/>}
    {question.material && <div className="journey-card" lang="ja" style={{whiteSpace:'pre-wrap'}}>{question.material}</div>}
    {question.audioSrc && <AudioControl src={question.audioSrc} labels={{play:t('play'),playing:t('playing'),loading:t('audioLoading'),error:t('audioError'),stop:t('stopAudio')}} onComplete={()=>setAudioPlayCount(n=>n+1)}/>}
    {question.kind==='order' ? <>
      <p className="journey-muted">{t('sortInstruction')}</p>
      <div className="journey-actions" role="group" aria-label={t('chosenWords')}>{selected.map((id,index)=><Button key={id} variant="secondary" disabled={locked} onClick={()=>setSelected(selected.filter(value=>value!==id))}><span className="journey-muted">{index+1}.</span><span lang="ja">{question.choices.find(c=>c.id===id)?.text}</span></Button>)}</div>
      <div className="journey-actions" role="group" aria-label={t('availableWords')}>{question.choices.map(choice=><Button key={choice.id} variant="secondary" disabled={locked || selected.includes(choice.id)} onClick={()=>setSelected([...selected,choice.id])}><span lang="ja">{choice.text}</span></Button>)}</div>
    </>:<div className="journey-grid" role="group" aria-label={question.prompt}>{question.choices.map(choice=><ChoiceCard key={choice.id} selected={(attempt?.answerIds ?? selected).includes(choice.id)} disabled={locked} onClick={()=>setSelected([choice.id])}><span lang="ja">{choice.text}</span></ChoiceCard>)}</div>}
    {!attempt && <>
      {question.partition==='practice' && question.hintPolicy==='practice-only' && <div>{hintUsed ? <p className="journey-card">{lang==='ja' ? question.hintJa ?? question.hint:question.hint}</p>:<Button variant="quiet" disabled={saving || !!failed} onClick={()=>setHintUsed(true)}>{t('hint')}</Button>}</div>}
      {failed && <StatePanel state="storage-error" title={t(failed==='refresh'?'refreshError':'storageError')} action={t('retry')} onAction={()=>{void submit()}}>{failed==='storage' && <p>{t('storageDetail')}</p>}</StatePanel>}
      <div className="journey-actions"><Button disabled={!complete || !audioReady || locked} onClick={()=>{void submit()}}>{saving ? t('loading'):t('confirm')}</Button><Button variant="quiet" disabled={!audioReady || locked} onClick={()=>{void submit(true)}}>{t('skip')}</Button></div>
    </>}
    {attempt && (hideAssessmentFeedback ? <Button onClick={onContinue}>{t('next')}</Button>:<Feedback correct={attempt.outcome==='correct'} title={attempt.outcome==='skipped' ? t('skipped'):attempt.outcome==='correct' ? t('correct'):t('incorrect')}>
      <p>{t('yourAnswer')}：<span lang="ja">{chosen || '—'}</span></p><p>{t('rightAnswer')}：<span lang="ja">{question.answer.map(id=>question.choices.find(c=>c.id===id)?.text).join(' ')}</span></p>
      <p>{lang==='ja' ? question.explanationJa ?? question.explanation:question.explanation}</p><Button onClick={onContinue}>{t('next')}</Button>
    </Feedback>)}
  </section>
}
