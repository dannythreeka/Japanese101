import {useState} from 'react'
import {Button,ChoiceCard,Dialog,StatePanel} from '../../components/ui/journey-ui'
import type {JourneyComfort} from '../../db/journey-models'
import {useJourneyText} from './text'
export default function WelcomeSetup({name,gradeBand,comfort,onSave,onSkip,onRetry,pending,error}: {name:string;gradeBand:1|2|3;comfort:JourneyComfort;onSave:(data:{name:string;gradeBand:1|2|3;comfort:JourneyComfort})=>void;onSkip:()=>void;onRetry:()=>void;pending:boolean;error:string|null}){
  const {t,lang}=useJourneyText();const [draftName,setName]=useState(name);const [grade,setGrade]=useState(gradeBand);const [starting,setStarting]=useState(comfort)
  return <Dialog open title={t('welcome')} closeLabel={t('close')} onClose={onSkip}><form className="journey-stack" onSubmit={event=>{event.preventDefault();if(draftName.trim() && !pending)onSave({name:draftName,gradeBand:grade,comfort:starting})}}>
    <p>{t('intro')}</p>
    <label>{t('nickname')}<input value={draftName} onChange={e=>setName(e.target.value)} maxLength={8} required autoComplete="off" style={{display:'block',width:'100%',minHeight:64,font:'inherit',padding:12,border:'2px solid #193b5c',borderRadius:12}}/></label>
    <fieldset className="journey-stack"><legend>{t('grade')}</legend><div className="journey-grid">{([1,2,3] as const).map(g=><ChoiceCard key={g} selected={grade===g} disabled={pending} onClick={()=>setGrade(g)}>{t(g===1?'grade1':g===2?'grade2':'grade3')}</ChoiceCard>)}</div></fieldset>
    <fieldset className="journey-stack"><legend>{t('comfort')}</legend><div className="journey-stack">{(['new','some','review'] as const).map(value=><ChoiceCard key={value} selected={starting===value} disabled={pending} onClick={()=>setStarting(value)}>{t(value==='new'?'comfortNew':value==='some'?'comfortSome':'comfortReview')}</ChoiceCard>)}</div></fieldset>
    <p>{lang==='zh'?`手帳會建議一次 ${grade+1} 小節，也可以提早休息。`:`てちょうのおすすめは ${grade+1} つ。とちゅうでやすんでもだいじょうぶ。`}</p><p>{t('noDeadline')}</p>
    {error && <StatePanel state="storage-error" title={t(error==='refresh'?'refreshError':error==='catalog'?'catalogChanged':error==='version'?'versionError':'storageError')} action={error==='refresh'?t('retry'):error==='catalog'||error==='version'?t('reload'):undefined} onAction={error==='refresh'?onRetry:error==='catalog'||error==='version'?()=>window.location.reload():undefined}>{error==='storage' && <p>{t('storageDetail')}</p>}</StatePanel>}
    <div className="journey-actions"><Button type="submit" disabled={pending || !draftName.trim()}>{t('beginTown')}</Button><Button variant="quiet" disabled={pending} onClick={onSkip}>{t('skipIntro')}</Button></div>
  </form></Dialog>
}
