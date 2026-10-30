import { AudioControl, Button, StatePanel } from '../../components/ui/journey-ui'
import type { UnitPack } from '../../content/contracts'
import type { StudyPlan, LearningCheck } from '../../db/journey-models'
import type { Attempt } from '../../content/contracts'
import QuestionPlayer, { type AnswerInput } from './QuestionPlayer'
import { useJourneyText } from './text'
import JapaneseText from './JapaneseText'

export function TeachingScene({pack:u01,study,index,onIndex,onTeach,onBack,pending}: {pack:UnitPack;study:StudyPlan;index:number;onIndex:(index:number)=>void;onTeach:(id:string)=>void;onBack:()=>void;pending:boolean}){
  const {lang,t}=useJourneyText();const card=u01.teaching[Math.max(0,Math.min(index,u01.teaching.length-1))]
  const ready=card.prerequisites?.every(id=>study.taughtCards.includes(id)) ?? true
  return <div className="journey-body journey-stack"><div className="journey-content-header"><h1>{t('teach')}</h1><Button variant="secondary" onClick={onBack}>{t('back')}</Button></div>
    <nav className="journey-lesson-nav" aria-label={t('teach')}>{u01.teaching.length>12 ? <label>{lang==='zh'?'選擇假名':'かなをえらぶ'} <select value={index} onChange={e=>onIndex(Number(e.target.value))} style={{minHeight:64,maxWidth:'100%',fontSize:'inherit',padding:12}}>{u01.teaching.map((c,n)=><option key={c.id} value={n}>{n+1}. {c.title}{study.taughtCards.includes(c.id)?' ✓':''}</option>)}</select></label>:u01.teaching.map((c,n)=><Button key={c.id} variant="secondary" aria-pressed={index===n} onClick={()=>onIndex(n)}>{n+1}{study.taughtCards.includes(c.id) ? ' ✓':''}</Button>)}</nav>
    <article className="journey-card journey-stack"><h2>{lang==='ja' ? card.titleJa ?? card.title:card.title}</h2>
      <div lang={lang==='ja' && card.bodyJa ? 'ja':'zh-Hant'} style={{whiteSpace:'pre-wrap'}}>{lang==='ja' ? card.bodyJa ?? card.body:card.body}</div>
      <p><JapaneseText text={card.example}/></p><p>{lang==='ja' ? card.translationJa ?? card.translation:card.translation}</p>
      {card.audioSrc && <AudioControl key={card.id} src={card.audioSrc} labels={{play:t('play'),playing:t('playing'),loading:t('audioLoading'),error:t('audioError'),stop:t('stopAudio')}} onComplete={()=>{}}/>}
      {!ready && <p className="journey-muted">{t('learnFirst')}</p>}
      <Button disabled={pending || !ready} onClick={()=>onTeach(card.id)}>{study.taughtCards.includes(card.id) ? t('saved'):t('learned')}</Button>
    </article>
    <div className="journey-actions"><Button variant="secondary" disabled={index===0} onClick={()=>onIndex(index-1)}>{t('back')}</Button><Button disabled={index>=u01.teaching.length-1} onClick={()=>onIndex(index+1)}>{t('next')}</Button></div>
  </div>
}
export function CheckScene({pack:u01,onPause,check,attempts,onSubmit,onContinue,onFinish,pending}: {pack:UnitPack;onPause?:()=>void;check:LearningCheck;attempts:Attempt[];onSubmit:(input:AnswerInput)=>Promise<void>;onContinue:()=>void;onFinish:()=>void;pending:boolean}){
  const {lang,t}=useJourneyText();const question=u01.questions.find(q=>q.id===check.questionIds[check.index])
  const attempt=attempts.find(a=>a.id===`${check.id}:check-${check.index}`)
  return <div className="journey-body journey-stack"><h1>{t('check')} · {check.index+1} / {check.questionIds.length}</h1>{check.purpose==='kana-placement' && <p>{lang==='zh'?'先修檢核：答對可略過該字的先修教學，不代表已長期掌握。':'できたもじのせつめいは、とばしてれんしゅうできます。'}</p>}{onPause && check.phase!=='finished' && <Button variant="secondary" onClick={onPause}>{lang==='zh'?'暫停，下次繼續':'やすんで、あとでつづける'}</Button>}
    {(check.phase==='review' || check.phase==='finished') ? <>
      <StatePanel state="success" title={t('checkDone')}><p>{t('sample')}：{attempts.filter(a=>a.sessionId===check.id).length}</p></StatePanel>
      {check.questionIds.map((id,index)=>{const q=u01.questions.find(q=>q.id===id)!;const a=attempts.find(a=>a.id===`${check.id}:check-${index}`);return <details key={id} className="journey-card"><summary style={{minHeight:64,padding:12}}>{index+1}. {lang==='ja' ? q.promptJa:q.prompt}</summary><p>{t('yourAnswer')}：{a?.answerIds.map(id=>q.choices.find(c=>c.id===id)?.text).join(' ') || '—'}</p><p>{t('rightAnswer')}：<span lang="ja">{q.answer.map(id=>q.choices.find(c=>c.id===id)?.text).join(' ')}</span></p><p>{lang==='ja' ? q.explanationJa:q.explanation}</p></details>})}
      <Button disabled={pending} onClick={onFinish}>{t('returnTown')}</Button>
    </>:question && <QuestionPlayer key={`${check.id}:${check.index}`} question={question} attempt={check.phase==='acknowledge' ? attempt:undefined} hideAssessmentFeedback onSubmit={onSubmit} onContinue={onContinue}/>}
  </div>
}
