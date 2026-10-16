import { useEffect, useMemo, useState } from 'react'
import { Button, StatePanel } from '../../components/ui/journey-ui'
import { JourneyRepository } from '../../db/journey'
import { u01 } from '../../content/packs/u01'
import { localDay, mastery, summarize } from '../../learning/rules'
import { useJourneyText } from './text'
import type { JourneyState } from './useJourney'
export default function JourneyReport({profileId}: {profileId:string}){
  const {lang,t}=useJourneyText();const repo=useMemo(()=>new JourneyRepository(u01),[])
  const [data,setData]=useState<JourneyState>();const [error,setError]=useState(false);const [message,setMessage]=useState('');const [days,setDays]=useState(7);const [now]=useState(()=>Date.now())
  useEffect(()=>{let active=true;void repo.state(profileId).then(data=>{if(active)setData(data)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[repo,profileId])
  if(error)return <div className="journey"><StatePanel state="retryable-error" title={t('error')} action={t('retry')} onAction={()=>{void repo.state(profileId).then(next=>{setData(next);setError(false)}).catch(()=>setError(true))}}/><Button variant="secondary" onClick={()=>{void download()}}>{t('export')}</Button><p role="status">{message}</p></div>
  if(!data)return <div className="journey"><StatePanel state="loading" title={t('loading')}/></div>
  const cutoff=now-days*86400000
  const attempts=data.attempts.filter(a=>Date.parse(a.submittedAt)>=cutoff && Date.parse(a.submittedAt)<=now)
  const summary=summarize(attempts)
  const skills=[...new Set(attempts.map(a=>a.primarySkillId))]
  const statusNames=lang==='zh' ? {'not-started':'尚未開始',practicing:'練習中',stable:'初步穩定',due:'待複習'}:{'not-started':'まだはじめていません',practicing:'れんしゅうちゅう',stable:'だいたいあんてい',due:'ふくしゅう'}
  async function download(){
    try{const backup=await repo.exportJourney(profileId);const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`Japanese101-journey-${profileId}.json`;a.click();URL.revokeObjectURL(url);setMessage(t('saved'))}catch{setMessage(t('storageDetail'))}
  }
  return <section className="journey journey-card journey-report"><h2>{t('report')}</h2><p>{profileId} · {new Date(cutoff).toLocaleDateString()} – {new Date(now).toLocaleDateString()}</p>
    <label>{lang==='zh' ? '期間':'きかん'} <select value={days} onChange={e=>setDays(Number(e.target.value))} style={{minHeight:44,padding:8,border:'1px solid #4f6378'}}><option value={7}>7 {lang==='zh'?'天':'にち'}</option><option value={30}>30 {lang==='zh'?'天':'にち'}</option><option value={36500}>{lang==='zh'?'全部':'ぜんぶ'}</option></select></label>
    <p>{t('accuracy')}：{summary.accuracy===null ? t('noEvidence'):`${Math.round(summary.accuracy*100)}%`} · {t('sample')} {summary.total}</p>
    <p>{lang==='zh'?`已提交 ${summary.total}；首次獨立答對 ${summary.independent}；用過提示 ${summary.hinted}；跳過 ${summary.skipped}；五題小節 ${summary.completedSections}。`:`こたえ ${summary.total}・さいしょにひとりでせいかい ${summary.independent}・ヒント ${summary.hinted}・あとで ${summary.skipped}・5もんのれんしゅう ${summary.completedSections}。`}</p>
    {!skills.length ? <p>{t('noEvidence')}</p>:<div style={{overflowX:'auto'}}><table><thead><tr><th>{lang==='zh'?'能力':'できること'}</th><th>{t('sample')}</th><th>{lang==='zh'?'狀態':'ようす'}</th></tr></thead><tbody>{skills.map(skill=>{const values=attempts.filter(a=>a.primarySkillId===skill);const state=mastery(data.attempts,skill,data.study?.taughtAt[skill],{now,timeZone:data.study?.timeZone ?? 'Asia/Taipei'},data.reviews.find(s=>s.skillId===skill));return <tr key={skill}><td>{u01.grammar.find(g=>g.id===skill)?.title ?? skill}</td><td>{values.length}</td><td>{statusNames[state]}</td></tr>})}</tbody></table></div>}
    <details><summary style={{minHeight:44,padding:12}}>{lang==='zh'?'逐題紀錄':'こたえのきろく'}</summary>{attempts.map(a=><p key={a.id}>{a.itemId} v{a.itemVersion} · {localDay(Date.parse(a.submittedAt),data.study?.timeZone ?? 'Asia/Taipei')} · {a.outcome} · {a.hintUsed ? t('hint'):''} · {a.id}</p>)}</details>
    <Button variant="secondary" onClick={()=>{void download()}}>{t('export')}</Button><p role="status">{message}</p>
    <p className="journey-muted">VOICEVOX:四国めたん · <a href="https://voicevox.hiroshiba.jp/term/" target="_blank" rel="noreferrer">VOICEVOX</a> · <a href="https://zunko.jp/con_ongen_kiyaku.html" target="_blank" rel="noreferrer">音源利用規約</a></p>
  </section>
}
