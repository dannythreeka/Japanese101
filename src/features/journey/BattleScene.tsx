import { useState } from 'react'
import type { Attempt } from '../../content/contracts'
import type { BattleSession, CoinLedger } from '../../db/journey-models'
import type { Move } from '../../battle/rules'
import { enemyIntent } from '../../battle/rules'
import { Button, Progress, StatePanel } from '../../components/ui/journey-ui'
import { u01Question } from '../../content/packs/u01'
import { summarize } from '../../learning/rules'
import QuestionPlayer, { type AnswerInput } from './QuestionPlayer'
import Character from './Character'
import { useJourneyText } from './text'

export default function BattleScene({battle,attempts,receipt,pending,onChoose,onSubmit,onContinue,onClaim,onRetreat}: {battle:BattleSession;attempts:Attempt[];receipt?:CoinLedger;pending:boolean;onChoose:(move:Move)=>void;onSubmit:(input:AnswerInput)=>Promise<void>;onContinue:()=>void;onClaim:()=>void;onRetreat:()=>void}){
  const {lang,t}=useJourneyText();const [collapsed,setCollapsed]=useState(false)
  const shown=battle.phase==='feedback' && battle.feedbackBefore ? battle.feedbackBefore:battle
  const attempt=battle.phase==='feedback' ? attempts.find(a=>a.id===battle.lastAttemptId):undefined
  const section=summarize(attempts.filter(a=>a.sessionId===battle.id))
  return <>
    <div className="journey-content-header"><h1>{t('dojo')} · {battle.turn} / 8</h1><Button variant="quiet" disabled={pending || battle.status==='won' || battle.status==='lost'} onClick={onRetreat}>{t('retreat')}</Button></div>
    <div className="journey-actions" style={{marginBottom:16}}><Button variant="quiet" aria-expanded={!collapsed} onClick={()=>setCollapsed(!collapsed)}>{collapsed ? t('opponent'):t('close')} · {t('hp')}</Button></div>
    {!collapsed && <div className="journey-battle-stage">
      <div className="journey-battle-side"><div className="journey-battle-status"><Progress label={t('hp')} value={shown.playerHp} max={40}/></div><div className="journey-battle-figures"><Character battle facing="right" frame={battle.phase==='feedback' ? 0:1} items={battle.loadoutSnapshot} size={200}/><Character kind="fox" battle facing="right" items={battle.loadoutSnapshot} size={140}/></div></div>
      <div className="journey-battle-side"><div className="journey-battle-status"><Progress label={t('opponent')} value={shown.enemyHp} max={30}/></div><Character kind="opponent" frame={battle.phase==='feedback' ? 2:0} size={220}/></div>
    </div>}
    <div className="journey-battle-controls journey-stack">
      {battle.phase==='choosing' && <>
        <p className="journey-card">{enemyIntent(battle.turn).strong ? t('strongAttack'):t('normalAttack')}</p><h2>{t('chooseMove')}</h2>
        <div className="journey-actions">{(['attack','guard','partner'] as Move[]).map(move=><Button key={move} disabled={pending || move==='partner' && battle.partnerUsed} onClick={()=>onChoose(move)}>{t(move)}</Button>)}</div>
        <p className="journey-muted">{lang==='zh'?'答對：攻擊 8；防守 4 並減半下一次傷害；夥伴技 12，每場限用一次。裝備減傷最多 2。':'せいかい：こうげき8、まもる4とダメージはんぶん、なかまのわざ12（1かい）。そうびのけいげんはさいだい2。'}</p>
        {battle.partnerUsed && <p className="journey-muted">{t('partnerUsed')}</p>}
      </>}
      {(battle.phase==='question' || battle.phase==='feedback') && battle.currentQuestionId && <QuestionPlayer key={`${battle.id}:${battle.turn}`} question={u01Question(battle.currentQuestionId)} attempt={attempt} onSubmit={onSubmit} onContinue={onContinue}/>}
      {battle.phase==='finished' && <StatePanel state="success" title={battle.status==='won' ? t('victory'):t('ended')}>
        <p>{t('preserved')}</p><p>{t('sample')}：{section.total}</p>
        {battle.endReason==='questions-complete' && <p>{lang==='zh'?'這次可用的已教題目都練習過了，先回道館認識更多內容吧。':'まなんだもんだいはここまで。どうじょうで、あたらしいことをまなぼう。'}</p>}
        {receipt && <p>{t('claimed')}：+{receipt.amount}</p>}
        <Button disabled={pending} onClick={battle.status==='won' ? onClaim:onRetreat}>{battle.status==='won' && !receipt ? t('claim'):t('returnTown')}</Button>
      </StatePanel>}
    </div>
  </>
}
