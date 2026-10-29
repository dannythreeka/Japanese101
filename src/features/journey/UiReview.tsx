import { useState } from 'react'
import { AudioControl, Button, ChoiceCard, Dialog, Feedback, Progress, StatePanel, type ScreenState } from '../../components/ui/journey-ui'
import { useJourneyText } from './text'
export default function UiReview(){
  const {t}=useJourneyText();const [open,setOpen]=useState(false);const [selected,setSelected]=useState(false)
  return <main className="journey"><div className="journey-body journey-stack"><h1>UI review</h1>
    <div className="journey-actions"><Button onClick={()=>setOpen(true)}>{t('journal')}</Button><Button variant="secondary">{t('back')}</Button><Button disabled>{t('confirm')}</Button><Button disabled aria-busy="true">{t('loading')}</Button></div>
    <ChoiceCard selected={selected} onClick={()=>setSelected(!selected)}>わたしは がくせいです。</ChoiceCard>
    <Progress label={t('sections')} value={3} max={5}/>
    <AudioControl src={`${import.meta.env.BASE_URL}assets/audio/kana_a.wav`} labels={{play:t('play'),playing:t('playing'),loading:t('audioLoading'),error:t('audioError'),stop:t('stopAudio')}} onComplete={()=>{}}/>
    <Feedback correct={false} title={t('incorrect')}><p>「ですか」でたずねます。</p></Feedback>
    {(['loading','success','empty','retryable-error','offline-missing','storage-error'] as ScreenState[]).map(state=><StatePanel key={state} state={state} title={state}><p>{state==='storage-error' ? t('storageDetail'):t('noEvidence')}</p></StatePanel>)}
    <Dialog open={open} title={t('journal')} closeLabel={t('close')} onClose={()=>setOpen(false)}><div className="journey-stack"><p>{t('noDeadline')}</p><Button onClick={()=>setOpen(false)}>{t('returnTown')}</Button></div></Dialog>
  </div></main>
}
