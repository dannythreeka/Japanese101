import { AppDB, db as defaultDb } from './index'
import type { UnitPack, Question } from '../content/contracts'
import { parseQuestion, validateQuestionBank } from '../content/contracts'
import { createAttempt, localDay, nextReview, planQuestions, summarize } from '../learning/rules'
import { BATTLE_RULES_VERSION, initialCombat, resolveTurn, type Move } from '../battle/rules'
import { CATALOG_VERSION, armorFor, catalogItem } from '../economy/catalog'
import { WORLD_VERSION, safePoint, town, walkable, type Facing, type Point } from '../world/map'
import type { BattleSession, CoinLedger, JourneyTables, StudyPlan, WorldCheckpoint } from './journey-models'

export class JourneyRepository {
  private readonly pack: UnitPack
  private readonly database: AppDB
  constructor(pack: UnitPack, database: AppDB = defaultDb) {
    const errors=validateQuestionBank(pack.questions)
    if(errors.length) throw new Error(errors.join('; '))
    this.pack=structuredClone(pack)
    this.database=database
    this.pack.questions=pack.questions.map(parseQuestion)
  }
  private async owned(profileId:string) {
    if(!await this.database.profiles.get(profileId)) throw new Error('Player no longer exists')
  }
  private question(id:string): Question {
    const question=this.pack.questions.find(q=>q.id===id)
    if(!question) throw new Error('Question unavailable; previous answers are preserved')
    return question
  }
  private async activeBattle(profileId:string,id:string): Promise<BattleSession> {
    await this.owned(profileId)
    const battle=await this.database.battleSessions.get(id)
    if(!battle || battle.profileId!==profileId) throw new Error('Battle does not belong to this player')
    if(battle.contentVersion!==this.pack.version || battle.rulesVersion!==BATTLE_RULES_VERSION) throw new Error('Battle version changed; original data is preserved')
    return battle
  }
  async state(profileId:string) {
    await this.owned(profileId)
    const d=this.database
    return d.transaction('r',[d.profiles,d.worldCheckpoints,d.studyPlans,d.learningAttempts,d.battleSessions,d.coinWallets,d.inventory,d.equipment,d.skillReviews], async()=>({
      world:await d.worldCheckpoints.get(profileId), study:await d.studyPlans.get([profileId,this.pack.id]),
      attempts:await d.learningAttempts.where('profileId').equals(profileId).toArray(),
      battles:await d.battleSessions.where('profileId').equals(profileId).toArray(),
      coins:(await d.coinWallets.get(profileId))?.balance ?? 0,
      inventory:await d.inventory.where('profileId').equals(profileId).toArray(),
      equipment:(await d.equipment.get(profileId))?.slots ?? {},
      reviews:await d.skillReviews.where('profileId').equals(profileId).toArray(),
    }))
  }
  async openStudy(profileId:string, gradeBand:1|2|3=1, now=Date.now(), timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone): Promise<StudyPlan> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.studyPlans],async()=>{
      await this.owned(profileId)
      const previous=await d.studyPlans.get([profileId,this.pack.id])
      if(previous && previous.contentVersion!==this.pack.version) throw new Error('Content version changed; original study plan is preserved')
      if(previous) return previous
      const plan:StudyPlan={profileId,unitId:this.pack.id,contentVersion:this.pack.version,taughtCards:[],taughtAt:{},date:localDay(now,timeZone),timeZone,gradeBand,questionIds:[],updatedAt:now}
      await d.studyPlans.add(plan)
      return plan
    })
  }
  async setGradeBand(profileId:string,gradeBand:1|2|3): Promise<void> {
    if(![1,2,3].includes(gradeBand)) throw new Error('Invalid grade band')
    const d=this.database
    await d.transaction('rw',[d.profiles,d.studyPlans],async()=>{
      await this.owned(profileId)
      const plan=await d.studyPlans.get([profileId,this.pack.id])
      if(!plan || plan.contentVersion!==this.pack.version) throw new Error('Study plan unavailable')
      await d.studyPlans.put({...plan,gradeBand})
    })
  }
  async teach(profileId:string,cardId:string,now=Date.now()): Promise<void> {
    const card=this.pack.teaching.find(c=>c.id===cardId)
    if(!card) throw new Error('Teaching card unavailable')
    const d=this.database
    await d.transaction('rw',[d.profiles,d.studyPlans],async()=>{
      await this.owned(profileId)
      const plan=await d.studyPlans.get([profileId,this.pack.id])
      if(!plan || plan.contentVersion!==this.pack.version) throw new Error('Study plan unavailable')
      const taughtAt={...plan.taughtAt}
      for(const skill of card.skillIds) taughtAt[skill] ??=now
      await d.studyPlans.put({...plan,taughtAt,taughtCards:[...new Set([...plan.taughtCards,cardId])],updatedAt:now})
    })
  }
  async saveWorld(profileId:string,position:Point,facing:Facing,storyFlag?:string,now=Date.now()): Promise<WorldCheckpoint> {
    if(!walkable(position) || !['up','down','left','right'].includes(facing)) throw new Error('Unsafe world position')
    if(storyFlag && !town.destinations.some(d=>d.id===storyFlag)) throw new Error('Unknown story flag')
    const d=this.database
    return d.transaction('rw',[d.profiles,d.worldCheckpoints],async()=>{
      await this.owned(profileId)
      const previous=await d.worldCheckpoints.get(profileId)
      if(previous && previous.worldVersion!==WORLD_VERSION) throw new Error('World version changed; original position is preserved')
      const world:WorldCheckpoint={profileId,mapId:town.id,worldVersion:WORLD_VERSION,position:{...position},facing,storyFlags:[...new Set([...(previous?.storyFlags ?? []),...(storyFlag ? [storyFlag]:[])])],updatedAt:now}
      await d.worldCheckpoints.put(world)
      return world
    })
  }
  async recoverWorld(profileId:string): Promise<void> {
    const d=this.database
    await d.transaction('rw',[d.profiles,d.worldCheckpoints,d.migrationBackups],async()=>{
      await this.owned(profileId)
      const old=await d.worldCheckpoints.get(profileId)
      if(old) await d.migrationBackups.put({id:`world:${profileId}:${old.updatedAt}`,createdAt:Date.now(),tables:{worldCheckpoints:[old]},localPreferences:{}})
      await d.worldCheckpoints.put({profileId,mapId:town.id,worldVersion:WORLD_VERSION,position:safePoint(town.spawn),facing:'down',storyFlags:old?.storyFlags ?? [],updatedAt:Date.now()})
    })
  }
  async startBattle(profileId:string,mode:'practice'|'check'='practice',now=Date.now()): Promise<BattleSession> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.studyPlans,d.skillReviews,d.learningAttempts,d.battleSessions,d.equipment],async()=>{
      await this.owned(profileId)
      const existing=(await d.battleSessions.where('profileId').equals(profileId).toArray()).find(b=>b.phase!=='finished')
      if(existing) return this.activeBattle(profileId,existing.id)
      const plan=await d.studyPlans.get([profileId,this.pack.id])
      if(!plan || plan.contentVersion!==this.pack.version) throw new Error('Study plan unavailable')
      const questions=this.pack.questions.filter(q=>q.partition===mode && q.teachingIds.every(id=>plan.taughtCards.includes(id)))
      const attempts=await d.learningAttempts.where('profileId').equals(profileId).toArray()
      const due=(await d.skillReviews.where('profileId').equals(profileId).toArray()).filter(s=>s.dueDate<=localDay(now,plan.timeZone)).map(s=>s.skillId)
      const today=localDay(now,plan.timeZone)
      let ids=mode==='check' ? questions.map(q=>q.id).sort():plan.date===today ? plan.questionIds.filter(id=>questions.some(q=>q.id===id)):[]
      const used=new Set(attempts.filter(a=>localDay(Date.parse(a.submittedAt),plan.timeZone)===today).map(a=>a.itemId+':'+a.itemFamilyId))
      let queue=ids.filter(id=>!used.has(this.question(id).itemId+':'+this.question(id).itemFamilyId)).slice(0,8)
      if(!queue.length) {
        const planned=mode==='check' ? questions.map(q=>q.id).sort():planQuestions(questions,due,Object.keys(plan.taughtAt),attempts,questions.length)
        ids=planned
        queue=planned.slice(0,8)
      }
      if(!queue.length) throw new Error('Learn the teaching cards first; no eligible questions')
      if(mode==='practice') await d.studyPlans.put({...plan,date:today,questionIds:ids,updatedAt:now})
      const slots=(await d.equipment.get(profileId))?.slots ?? {}
      const battle:BattleSession={...initialCombat(),id:crypto.randomUUID(),profileId,unitId:this.pack.id,challengeId:`${this.pack.id}:${mode}`,contentVersion:this.pack.version,rulesVersion:BATTLE_RULES_VERSION,phase:'choosing',questionIds:queue,loadoutSnapshot:Object.values(slots),createdAt:now,updatedAt:now}
      await d.battleSessions.add(battle)
      return battle
    })
  }
  async chooseMove(profileId:string,battleId:string,move:Move): Promise<BattleSession> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.battleSessions],async()=>{
      const battle=await this.activeBattle(profileId,battleId)
      if(battle.phase!=='choosing' || battle.status!=='active') return battle
      if(!['attack','guard','partner'].includes(move) || move==='partner' && battle.partnerUsed) throw new Error('Move unavailable')
      const questionId=battle.questionIds[battle.turn-1]
      if(!questionId) throw new Error('Question pool exhausted; previous answers are preserved')
      this.question(questionId)
      const next={...battle,phase:'question' as const,move,currentQuestionId:questionId,updatedAt:Date.now()}
      await d.battleSessions.put(next)
      return next
    })
  }
  async submitTurn(profileId:string,battleId:string,turn:number,input:{answerIds:string[]|null;hintUsed:boolean;audioPlayCount:number;responseMs:number},now=Date.now()): Promise<BattleSession> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.battleSessions,d.learningAttempts,d.studyPlans,d.skillReviews],async()=>{
      const battle=await this.activeBattle(profileId,battleId)
      const instance=`turn-${turn}`
      const id=`${battleId}:${instance}`
      // The identity check comes before reading the current phase: stale replays are harmless.
      if(await d.learningAttempts.get(id)) return battle
      if(battle.turn!==turn || battle.phase!=='question' || !battle.currentQuestionId || !battle.move || battle.status!=='active') throw new Error('Turn is not accepting an answer')
      const question=this.question(battle.currentQuestionId)
      const attempt=createAttempt(question,{...input,profileId,sessionId:battleId,questionInstanceId:instance,submittedAt:now})
      const next={...battle,...resolveTurn(battle,battle.move,attempt.outcome==='correct',armorFor(battle.loadoutSnapshot)),phase:'feedback' as const,lastAttemptId:attempt.id,updatedAt:now}
      // A short eligible pool ends naturally without duplicating questions or inventing learning.
      if(next.status==='active' && battle.turn>=battle.questionIds.length) next.status='lost'
      await d.learningAttempts.add(attempt)
      await d.battleSessions.put(next)
      const plan=await d.studyPlans.get([profileId,this.pack.id])
      if(!plan) throw new Error('Study plan unavailable')
      const old=await d.skillReviews.get([profileId,attempt.primarySkillId])
      await d.skillReviews.put({...nextReview(old,attempt,plan.timeZone),profileId,skillId:attempt.primarySkillId,timeZone:plan.timeZone})
      return next
    })
  }
  async continueBattle(profileId:string,battleId:string,turn:number): Promise<BattleSession> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.battleSessions],async()=>{
      const battle=await this.activeBattle(profileId,battleId)
      if(battle.turn!==turn || battle.phase!=='feedback') return battle
      const next:BattleSession=battle.status==='active' ? {...battle,phase:'choosing',turn:battle.turn+1,move:undefined,currentQuestionId:undefined,updatedAt:Date.now()}:{...battle,phase:'finished',updatedAt:Date.now()}
      await d.battleSessions.put(next)
      return next
    })
  }
  async retreat(profileId:string,battleId:string): Promise<void> {
    const d=this.database
    await d.transaction('rw',[d.profiles,d.battleSessions],async()=>{
      const battle=await this.activeBattle(profileId,battleId)
      if(battle.phase==='finished') return
      if(battle.status==='won' || battle.status==='lost') throw new Error('Continue to the saved result first')
      await d.battleSessions.put({...battle,status:'retreated',phase:'finished',updatedAt:Date.now()})
    })
  }
  async reward(profileId:string,battleId:string): Promise<CoinLedger> {
    const d=this.database
    return d.transaction('rw',[d.profiles,d.battleSessions,d.learningAttempts,d.coinWallets,d.coinLedger,d.firstWins],async()=>{
      const battle=await this.activeBattle(profileId,battleId)
      const id=`win:${battleId}`
      const existing=await d.coinLedger.get(id)
      if(existing) return existing
      const attempt=battle.lastAttemptId && await d.learningAttempts.get(battle.lastAttemptId)
      if(battle.phase!=='finished' || battle.status!=='won' || battle.enemyHp!==0 || !attempt || attempt.profileId!==profileId || attempt.sessionId!==battleId) throw new Error('A verified victory is required')
      const first=await d.firstWins.get([profileId,battle.challengeId])
      const amount=first ? 10:60
      const old=(await d.coinWallets.get(profileId))?.balance ?? 0
      if(!Number.isSafeInteger(old) || old<0) throw new Error('Wallet is invalid; original data is preserved')
      const receipt:CoinLedger={id,profileId,kind:'reward',amount,balanceAfter:old+amount,battleId,createdAt:Date.now()}
      await d.coinWallets.put({profileId,balance:old+amount})
      await d.coinLedger.add(receipt)
      if(!first) await d.firstWins.add({profileId,challengeId:battle.challengeId,battleId})
      return receipt
    })
  }
  async purchase(profileId:string,itemId:string,purchaseId:string,catalogVersion:string): Promise<void> {
    const item=catalogItem(itemId)
    if(!purchaseId || purchaseId.length>200 || catalogVersion!==CATALOG_VERSION) throw new Error('Catalog version changed')
    const d=this.database
    await d.transaction('rw',[d.profiles,d.coinWallets,d.coinLedger,d.inventory,d.equipment,d.purchaseReceipts,d.battleSessions],async()=>{
      await this.owned(profileId)
      const receipt=await d.purchaseReceipts.get(purchaseId)
      if(receipt) {
        if(receipt.profileId!==profileId || receipt.itemId!==itemId || receipt.catalogVersion!==catalogVersion) throw new Error('Purchase identity changed')
        return
      }
      if((await d.battleSessions.where('profileId').equals(profileId).toArray()).some(b=>b.phase!=='finished')) throw new Error('Equipment is locked during battle')
      if(await d.inventory.get([profileId,itemId])) throw new Error('Item already owned')
      const balance=(await d.coinWallets.get(profileId))?.balance ?? 0
      if(!Number.isSafeInteger(balance) || balance<item.price) throw new Error('Not enough coins')
      const slots=(await d.equipment.get(profileId))?.slots ?? {}
      await d.coinWallets.put({profileId,balance:balance-item.price})
      await d.inventory.add({profileId,itemId,purchaseId,acquiredAt:Date.now()})
      await d.equipment.put({profileId,slots:{...slots,[item.slot]:itemId}})
      await d.purchaseReceipts.add({id:purchaseId,profileId,itemId,catalogVersion,price:item.price,createdAt:Date.now()})
      await d.coinLedger.add({id:`purchase:${purchaseId}`,profileId,kind:'purchase',amount:-item.price,balanceAfter:balance-item.price,purchaseId,createdAt:Date.now()})
    })
  }
  async equip(profileId:string,itemId:string,enabled:boolean): Promise<void> {
    const item=catalogItem(itemId);const d=this.database
    await d.transaction('rw',[d.profiles,d.inventory,d.equipment,d.battleSessions],async()=>{
      await this.owned(profileId)
      if((await d.battleSessions.where('profileId').equals(profileId).toArray()).some(b=>b.phase!=='finished')) throw new Error('Equipment is locked during battle')
      if(!await d.inventory.get([profileId,itemId])) throw new Error('Item is not owned')
      const slots={...(await d.equipment.get(profileId))?.slots}
      if(enabled) slots[item.slot]=itemId
      else if(slots[item.slot]===itemId) delete slots[item.slot]
      await d.equipment.put({profileId,slots})
    })
  }
  async exportJourney(profileId:string): Promise<{version:'journey-backup-v1';profileId:string;data:JourneyTables;summary:ReturnType<typeof summarize>}> {
    const d=this.database
    const tables=[d.profiles,d.learningAttempts,d.worldCheckpoints,d.studyPlans,d.skillReviews,d.battleSessions,d.coinWallets,d.coinLedger,d.inventory,d.equipment,d.purchaseReceipts,d.firstWins]
    return d.transaction('r',tables,async()=>{
      await this.owned(profileId)
      const data:JourneyTables={attempts:await d.learningAttempts.where('profileId').equals(profileId).toArray(),world:await d.worldCheckpoints.where('profileId').equals(profileId).toArray(),plans:await d.studyPlans.where('profileId').equals(profileId).toArray(),reviews:await d.skillReviews.where('profileId').equals(profileId).toArray(),battles:await d.battleSessions.where('profileId').equals(profileId).toArray(),wallets:await d.coinWallets.where('profileId').equals(profileId).toArray(),ledger:await d.coinLedger.where('profileId').equals(profileId).toArray(),inventory:await d.inventory.where('profileId').equals(profileId).toArray(),equipment:await d.equipment.where('profileId').equals(profileId).toArray(),purchases:await d.purchaseReceipts.where('profileId').equals(profileId).toArray(),firstWins:await d.firstWins.where('profileId').equals(profileId).toArray()}
      return {version:'journey-backup-v1',profileId,data,summary:summarize(data.attempts)}
    })
  }
}
