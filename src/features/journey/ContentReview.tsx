import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AudioControl, Button } from '../../components/ui/journey-ui'
import type {UnitPack} from '../../content/contracts'
import {availablePacks,findPack} from '../../content/packs/registry'
import kanaLedger from '../../../docs/content/kana/review-ledger.json'
import art from '../../../public/assets/img/journey/manifest.json'
import audio from '../../../public/assets/audio/u01/manifest.json'
import worldAudio from '../../../public/assets/audio/world/manifest.json'
import Character from './Character'
import type {Facing} from '../../world/map'
import './journey.css'
export default function ContentReview(){
  const [params,setParams]=useSearchParams();const pack=findPack(params.get('unit') ?? 'U01')
  if(!pack)return <main className="journey journey-shell"><h1>找不到教材</h1><Button onClick={()=>setParams({})}>返回審閱</Button></main>
  return <><nav className="journey journey-shell" aria-label="審閱教材"><label>選擇教材 <select aria-label="選擇教材" value={pack.id} onChange={e=>setParams({unit:e.target.value})} style={{minHeight:64,maxWidth:'100%',fontSize:20}}>{availablePacks.map(p=><option key={p.id} value={p.id}>{p.id} · {p.title}</option>)}</select></label></nav><Review key={pack.id} pack={pack}/></>
}
function Review({pack:u01}:{pack:UnitPack}){
  const [questionId,setQuestionId]=useState(u01.questions[0].id);const [facing,setFacing]=useState<Facing>('down');const [gear,setGear]=useState<string[]>([])
  const q=u01.questions.find(q=>q.id===questionId)!
  return <main className="journey journey-shell"><h1>{u01.id} 教材與美術審閱</h1><p>{u01.version} · DRAFT · 真人審核尚未完成。</p><p>此頁只預覽原稿與正解，不寫入玩家作答、能力、金幣或簽核。逐項結果請填 review-ledger.json，記錄實際非原作者審核人、日期、版本與問題。</p>
    <Link className="journey-button journey-button--secondary" to={`/preview/adventure?unit=${u01.id}`}>回到冒險預覽</Link>
    <section className="journey-body journey-stack"><h2>逐題核對（{u01.questions.filter(q=>q.partition==='practice').length} 練習＋{u01.questions.filter(q=>q.partition==='check').length} 檢核候選）</h2><label>選擇題目 <select aria-label="選擇題目" value={questionId} onChange={e=>setQuestionId(e.target.value)} style={{minHeight:64,padding:12,maxWidth:'100%'}}>{u01.questions.map(q=><option key={q.id} value={q.id}>{q.id} · {q.typeId ?? q.partition.toUpperCase()} · {q.kind}</option>)}</select></label>
      <article className="journey-card journey-stack"><h3>{q.id} v{q.version} · {q.primarySkillId} · {q.itemFamilyId}</h3><p>{q.prompt}</p><p lang="ja">{q.promptJa}</p>{q.material && <p lang="ja" style={{whiteSpace:'pre-wrap'}}>{q.material}</p>}
        {q.image && <div role="img" aria-label={q.image.alt.zh} style={{width:'min(100%,360px)',aspectRatio:'1',backgroundImage:`url(${import.meta.env.BASE_URL}${q.image.src.slice(1)})`,backgroundSize:'200% 200%',backgroundPosition:`${q.image.cell%2*100}% ${Math.floor(q.image.cell/2)*100}%`}}/>}
        {q.audioSrc && <AudioControl key={q.id} src={q.audioSrc} labels={{play:'播放音訊',playing:'播放中',loading:'載入中',error:'播放失敗，請重試。',stop:'停止播放'}} onComplete={()=>{}}/>}
        {q.choices.map(c=><p key={c.id}>{q.answer.includes(c.id)?'正解':'干擾項'}：{c.text}{q.distractorReasons[c.id] && <small style={{display:'block'}}>{q.distractorReasons[c.id]}</small>}</p>)}
        <p>正解順序：{q.answer.map(id=>q.choices.find(c=>c.id===id)?.text).join(' → ')}</p><p>{q.explanation}</p><p lang="ja">{q.explanationJa}</p><p>先修：{q.teachingIds.join('、')}；難度 {q.difficulty}；提示政策 {q.hintPolicy}</p>
      </article>
      <div className="journey-actions"><Button disabled={q.id===u01.questions[0].id} onClick={()=>setQuestionId(u01.questions[u01.questions.findIndex(x=>x.id===q.id)-1].id)}>上一題</Button><Button disabled={q.id===u01.questions.at(-1)!.id} onClick={()=>setQuestionId(u01.questions[u01.questions.findIndex(x=>x.id===q.id)+1].id)}>下一題</Button></div>
      <h2>教學、閱讀與完整聽力稿</h2>{u01.teaching.map(c=><details key={c.id} className="journey-card"><summary style={{minHeight:64}}>{c.id} · {c.title}</summary><p style={{whiteSpace:'pre-wrap'}}>{c.body}</p><p lang="ja">{c.example}</p><p>{c.translation}</p><p lang="ja">{c.titleJa} · {c.bodyJa} · {c.translationJa}</p></details>)}
      {u01.readings.map(r=><details key={r.id} className="journey-card"><summary style={{minHeight:64}}>{r.id} · {r.skillId}</summary><p lang="ja" style={{whiteSpace:'pre-wrap'}}>{r.text}</p></details>)}
      {u01.id!=='U01' && <><h2>假名音訊逐段審聽</h2>{kanaLedger.items.filter(a=>a.kind==='audio').map(a=><details key={a.id} className="journey-card"><summary style={{minHeight:64}}>{a.id}</summary><p lang="ja">{'script' in a ? String(a.script):''}</p>{'src' in a && <AudioControl src={String(a.src)} labels={{play:'播放音訊',playing:'播放中',loading:'載入中',error:'播放失敗，請重試。',stop:'停止播放'}} onComplete={()=>{}}/>}<p>{a.status}</p></details>)}</>}
      {u01.id==='U01' && <><h2>教材與居民音訊逐段審聽（14＋4）</h2>{[...audio.assets,...worldAudio.assets].map(a=><details key={a.id} className="journey-card"><summary style={{minHeight:64}}>{a.id} · {a.durationSeconds}s · {a.bytes} bytes</summary><p lang="ja">{a.script}</p><AudioControl src={a.src} labels={{play:'播放音訊',playing:'播放中',loading:'載入中',error:'播放失敗，請重試。',stop:'停止播放'}} onComplete={()=>{}}/><p>VOICEVOX:四国めたん · {a.reviewStatus}</p></details>)}
      </>}<h2>方向與裝備工程預覽</h2><p>只改本頁試穿，不消費或保存；必須再到小鎮／商店／戰鬥核對實際定位。真人視覺與可玩性尚未核准。</p>
      <div className="journey-actions">{(['down','left','right','up'] as Facing[]).map(f=><Button key={f} variant="secondary" aria-pressed={f===facing} onClick={()=>setFacing(f)}>{f}</Button>)}</div>
      <div className="journey-actions">{[['gear-travel-hat','帽子'],['gear-travel-pack','背包'],['gear-companion-scarf','圍巾']].map(([id,name])=><Button key={id} variant="secondary" aria-pressed={gear.includes(id)} onClick={()=>setGear(gear.includes(id)?gear.filter(x=>x!==id):[...gear,id])}>{name}</Button>)}</div>
      <div className="journey-card journey-actions" style={{paddingTop:64}}><Character facing={facing} items={gear} size={220}/><Character kind="fox" facing={facing} items={gear} size={160}/></div>
      <div className="journey-card journey-actions" style={{paddingTop:64}}>{[0,1,2].map(frame=><span key={frame}><Character battle frame={frame} facing="right" items={gear} size={170}/><Character kind="fox" battle frame={frame} facing="right" items={gear} size={120}/></span>)}</div>
      <h2>14 張來源／版本／容量</h2>{art.assets.map(a=><details key={a.id} className="journey-card"><summary style={{minHeight:64}}>{a.id} · {a.bytes} bytes · {a.columns}×{a.rows}</summary><img loading="lazy" src={`${import.meta.env.BASE_URL}${a.src.slice(1)}`} alt={`${a.id} 原創插畫資產`} style={{width:'100%',maxHeight:700,objectFit:'contain'}}/><p style={{overflowWrap:'anywhere'}}>{a.sha256}</p></details>)}
    </section>
  </main>
}
