import { useEffect, useMemo, useState } from 'react'
import { Button, StatePanel } from '../../components/ui/journey-ui'
import { JourneyRepository } from '../../db/journey'
import { u01 } from '../../content/packs/u01'
import { localDay, mastery, summarize } from '../../learning/rules'
import { useJourneyText } from './text'
import type { JourneyTables } from '../../db/journey-models'
import {availablePacks} from '../../content/packs/registry'
import {attemptUnit,teachingEvidence} from '../../learning/report'
import {skillLabel} from '../../learning/labels'
export default function JourneyReport({profileId,profileName}: {profileId:string;profileName?:string}){
  const {lang,t}=useJourneyText();const repo=useMemo(()=>new JourneyRepository(u01),[])
  const [unit,setUnit]=useState('all');const [data,setData]=useState<JourneyTables>();const [error,setError]=useState(false);const [message,setMessage]=useState('');const [days,setDays]=useState(7);const [now]=useState(()=>Date.now())
  useEffect(()=>{let active=true;void repo.exportJourney(profileId).then(result=>{if(active)setData(result.data)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[repo,profileId])
  if(error)return <div className="journey"><StatePanel state="retryable-error" title={t('error')} action={t('retry')} onAction={()=>{void repo.exportJourney(profileId).then(next=>{setData(next.data);setError(false)}).catch(()=>setError(true))}}/><Button variant="secondary" onClick={()=>{void download()}}>{t('export')}</Button><p role="status">{message}</p></div>
  if(!data)return <div className="journey"><StatePanel state="loading" title={t('loading')}/></div>
  const cutoff=days===36500 ? Number.NEGATIVE_INFINITY:now-days*86400000
  const attempts=data.attempts.filter(a=>Date.parse(a.submittedAt)>=cutoff && Date.parse(a.submittedAt)<=now && (unit==='all'||attemptUnit(a,data,availablePacks)===unit))
  const summary=summarize(attempts)
  const skills=[...new Set(attempts.map(a=>a.primarySkillId))]
  const statusNames=lang==='zh' ? {'not-started':'尚未開始',practicing:'練習中',stable:'初步穩定',due:'待複習'}:{'not-started':'まだはじめていません',practicing:'れんしゅうちゅう',stable:'だいたいあんてい',due:'ふくしゅう'}
  async function download(){
    try{const backup=await repo.exportJourney(profileId);const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`Japanese101-journey-${profileId}.json`;a.click();URL.revokeObjectURL(url);setMessage(t('saved'))}catch{setMessage(t('storageDetail'))}
  }
  return <section className="journey journey-card journey-report"><h2>{t('report')}</h2><p>{profileName ?? (lang==='zh'?'目前玩家':'いまのプレイヤー')} · {days===36500 ? lang==='zh'?'全部紀錄':'すべてのきろく':`${new Date(cutoff).toLocaleString()} – ${new Date(now).toLocaleString()}`}</p>
    <label>{lang==='zh' ? '期間':'きかん'} <select value={days} onChange={e=>setDays(Number(e.target.value))} style={{minHeight:44,padding:8,border:'1px solid #4f6378'}}><option value={7}>7 {lang==='zh'?'天':'にち'}</option><option value={30}>30 {lang==='zh'?'天':'にち'}</option><option value={36500}>{lang==='zh'?'全部':'ぜんぶ'}</option></select></label>
    <label>{lang==='zh'?'教材':'きょうざい'} <select aria-label={lang==='zh'?'報告教材':'レポートのきょうざい'} value={unit} onChange={e=>setUnit(e.target.value)} style={{minHeight:44,padding:8,maxWidth:'100%'}}><option value="all">{lang==='zh'?'全部教材':'すべて'}</option>{availablePacks.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    <p>{t('accuracy')}：{summary.accuracy===null ? t('noEvidence'):`${Math.round(summary.accuracy*100)}%`} · {t('sample')} {summary.total}</p>
    <p>{lang==='zh'?`已提交 ${summary.total}；首次獨立答對 ${summary.independent}；用過提示 ${summary.hinted}；跳過 ${summary.skipped}；五題小節 ${summary.completedSections}。`:`こたえ ${summary.total}・さいしょにひとりでせいかい ${summary.independent}・ヒント ${summary.hinted}・あとで ${summary.skipped}・5もんのれんしゅう ${summary.completedSections}。`}</p>
    {!skills.length ? <p>{t('noEvidence')}</p>:<div style={{overflowX:'auto'}}><table><thead><tr><th>{lang==='zh'?'能力':'できること'}</th><th>{t('sample')}</th><th>{lang==='zh'?'狀態':'ようす'}</th></tr></thead><tbody>{skills.map(skill=>{const values=attempts.filter(a=>a.primarySkillId===skill);const evidence=teachingEvidence(skill,data,availablePacks);const state=mastery(data.attempts,skill,evidence.taughtAt,{now,timeZone:evidence.timeZone},data.reviews.find(s=>s.skillId===skill));const target=availablePacks.find(p=>p.id===unit) ?? [...values].reverse().map(a=>availablePacks.find(p=>p.id===attemptUnit(a,data,availablePacks))).find(Boolean);return <tr key={skill}><td>{skillLabel(skill,lang)}</td><td>{values.length}</td><td>{statusNames[state]}{state!=='stable' && <a href={`#/preview/adventure?unit=${target?.id ?? 'U01'}&scene=dojo`} style={{display:'inline-flex',minHeight:44,paddingTop:8}}>{lang==='zh'?'到道館練習':'どうじょうでれんしゅう'}</a>}</td></tr>})}</tbody></table></div>}
    <details><summary style={{minHeight:44,padding:12}}>{lang==='zh'?'逐題紀錄':'こたえのきろく'}</summary>{attempts.map(a=><p key={a.id}>{a.itemId} v{a.itemVersion} · {localDay(Date.parse(a.submittedAt),teachingEvidence(a.primarySkillId,data,availablePacks).timeZone)} · {a.outcome} · {a.hintUsed ? t('hint'):''} · {a.id}</p>)}</details>
    <Button variant="secondary" onClick={()=>{void download()}}>{t('export')}</Button><p role="status">{message}</p>
    <p className="journey-muted">VOICEVOX:四国めたん · <a href="https://voicevox.hiroshiba.jp/term/" target="_blank" rel="noreferrer">VOICEVOX</a> · <a href="https://zunko.jp/con_ongen_kiyaku.html" target="_blank" rel="noreferrer">音源利用規約</a></p>
  </section>
}
