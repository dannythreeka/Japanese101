import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { db, resetProfileProgress, setActiveProfileId } from './index'
import { JourneyRepository } from './journey'
import type { BattleSession } from './journey-models'
import { CATALOG_VERSION } from '../economy/catalog'
import { BATTLE_RULES_VERSION, initialCombat, resolveTurn } from '../battle/rules'
import { findPath, near, town, walkable } from '../world/map'
import type { UnitPack } from '../content/contracts'
import { mastery } from '../learning/rules'
import {LEARNING_RULES_VERSION} from '../learning/rules'

const pack:UnitPack={id:'U01',version:'test-1',title:'fixture',reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,vocabulary:[],kanji:[],grammar:[],readings:[],listening:[],teaching:[{id:'teach',title:'自己紹介',body:'わたしはアキです。',example:'わたしはアキです。',translation:'我是小秋。',skillIds:['G01']}],questions:Array.from({length:8},(_,n)=>({id:`q${n}`,version:'1',unitId:'U01',itemId:`item${n}`,itemFamilyId:`f${n}`,primarySkillId:'G01',skillIds:['G01'],teachingIds:['teach'],partition:'practice',kind:'choice',prompt:'えらぼう',choices:[{id:'a',text:'です'},{id:'b',text:'ます'}],answer:['a'],explanation:'名詞です。',distractorReasons:{b:'動詞ではありません。'},hint:'名詞です。',hintPolicy:'practice-only',audioPolicy:'optional',source:'isolated test fixture',reviewStatus:'DRAFT'}))}
let repo:JourneyRepository
beforeEach(async()=>{
  db.close();await db.delete();await db.open()
  await db.profiles.bulkPut(['A','B'].map(profile_id=>({profile_id,name:profile_id,avatar_emoji:'🦊',created_at:1,last_played:1})))
  repo=new JourneyRepository(pack)
})
afterEach(async()=>{vi.restoreAllMocks();db.close();await db.delete()})
async function start(profile='A') {
  await repo.openStudy(profile)
  await repo.teach(profile,'teach')
  return repo.startBattle(profile)
}
async function victory(profile='A') {
  let battle=await start(profile)
  while(battle.phase!=='finished') {
    if(battle.phase==='choosing') battle=await repo.chooseMove(profile,battle.id,'attack')
    if(battle.phase==='question') battle=await repo.submitTurn(profile,battle.id,battle.turn,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1000})
    if(battle.phase==='feedback') battle=await repo.continueBattle(profile,battle.id,battle.turn)
  }
  return battle
}
describe('P2-14 durable turn transactions',()=>{
  it('does not allow untaught content, rerolling, duplicate damage or a cross-player answer',async()=>{
    await repo.openStudy('A')
    await expect(repo.startBattle('A')).rejects.toThrow('Learn')
    const battle=await start()
    const chosen=await repo.chooseMove('A',battle.id,'attack')
    expect((await repo.chooseMove('A',battle.id,'guard')).move).toBe('attack')
    await expect(repo.submitTurn('B',battle.id,1,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1})).rejects.toThrow('belong')
    const input={answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1}
    await Promise.all(Array.from({length:10},()=>repo.submitTurn('A',chosen.id,1,input)))
    expect(await db.learningAttempts.count()).toBe(1)
    expect((await db.battleSessions.get(battle.id))?.enemyHp).toBe(22)
    await Promise.all(Array.from({length:10},()=>repo.continueBattle('A',battle.id,1)))
    expect((await db.battleSessions.get(battle.id))?.turn).toBe(2)
    await repo.submitTurn('A',chosen.id,1,input)
    expect((await db.battleSessions.get(battle.id))?.turn).toBe(2)
  })
  it('rolls back both learning and HP if a review write fails',async()=>{
    const battle=await start();await repo.chooseMove('A',battle.id,'partner')
    vi.spyOn(db.skillReviews,'put').mockRejectedValueOnce(new Error('quota fault'))
    await expect(repo.submitTurn('A',battle.id,1,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1})).rejects.toThrow('quota')
    expect(await db.learningAttempts.count()).toBe(0)
    expect(await db.battleSessions.get(battle.id)).toMatchObject({enemyHp:30,partnerUsed:false,phase:'question'})
    await repo.submitTurn('A',battle.id,1,{answerIds:['a'],hintUsed:true,audioPlayCount:0,responseMs:1})
    expect(await db.battleSessions.get(battle.id)).toMatchObject({enemyHp:18,partnerUsed:true})
    expect((await repo.state('A')).attempts[0]).toMatchObject({firstAnswerCorrect:true,hintUsed:true})
  })
  it('preserves an unknown version, prevents forged reward and keeps retreat answers',async()=>{
    const battle=await start();await repo.chooseMove('A',battle.id,'guard')
    await repo.submitTurn('A',battle.id,1,{answerIds:null,hintUsed:false,audioPlayCount:0,responseMs:1})
    await repo.continueBattle('A',battle.id,1)
    await repo.retreat('A',battle.id)
    expect(await db.learningAttempts.count()).toBe(1)
    await expect(repo.reward('A',battle.id)).rejects.toThrow('victory')
    await db.battleSessions.put({...battle,id:'forged',phase:'finished',status:'won',enemyHp:0})
    await expect(repo.reward('A','forged')).rejects.toThrow('victory')
    const corrupted=(await db.battleSessions.get(battle.id))!
    await db.battleSessions.put({...corrupted,status:'won',enemyHp:0})
    await expect(repo.reward('A',battle.id)).rejects.toThrow('victory')
    await db.battleSessions.update(battle.id,{rulesVersion:'old'})
    await expect(repo.chooseMove('A',battle.id,'attack')).rejects.toThrow('preserved')
    expect((await db.battleSessions.get(battle.id))?.rulesVersion).toBe('old')
  })
})
describe('P2-15 wallet and inventory',()=>{
  it('an older tab cannot purchase at an obsolete price or replace newer catalog metadata',async()=>{
    const win=await victory();await repo.reward('A',win.id)
    await db.catalogVersions.put({id:'active',version:'economy-v0.2',revision:2})
    await expect(repo.purchase('A','gear-travel-hat','old-tab-purchase',CATALOG_VERSION)).rejects.toThrow('Catalog version')
    await expect(repo.openStudy('A')).rejects.toThrow('Catalog version')
    expect((await db.catalogVersions.get('active'))?.revision).toBe(2)
    expect((await repo.state('A')).coins).toBe(60);expect((await repo.state('A')).inventory).toEqual([])
  })
  it('a content/UI challenge alias preserves the original first-win key',async()=>{
    const first=await victory();await db.battleSessions.update(first.id,{challengeId:'U01:practice'});expect((await repo.reward('A',first.id)).amount).toBe(60)
    const second=await victory();expect((await repo.reward('A',second.id)).amount).toBe(10)
  })
  it('quarantines malformed balances instead of inventing a zero balance or overwriting the record',async()=>{
    const win=await victory();await db.coinWallets.put({profileId:'A',balance:-1})
    await expect(repo.state('A')).rejects.toThrow('preserved')
    await expect(repo.reward('A',win.id)).rejects.toThrow('preserved')
    expect((await repo.exportJourney('A')).data.wallets).toEqual([{profileId:'A',balance:-1}])
    expect(await db.coinLedger.count()).toBe(0)
    await db.coinWallets.put({profileId:'A',balance:Number.MAX_SAFE_INTEGER})
    await expect(repo.reward('A',win.id)).rejects.toThrow('overflow')
    expect((await repo.state('A')).coins).toBe(Number.MAX_SAFE_INTEGER)
  })
  it('awards first victory once, repeats 10, never changes another player',async()=>{
    const first=await victory()
    await Promise.all(Array.from({length:10},()=>repo.reward('A',first.id)))
    expect((await repo.state('A')).coins).toBe(60)
    expect((await repo.state('B')).coins).toBe(0)
    const second=await victory();expect(second.id).not.toBe(first.id)
    expect((await repo.reward('A',second.id)).amount).toBe(10)
    expect((await repo.state('A')).coins).toBe(70)
  })
  it('commits purchase, ownership and wear together; concurrent competing purchases never overdraw',async()=>{
    const win=await victory();await repo.reward('A',win.id)
    const results=await Promise.allSettled([repo.purchase('A','gear-travel-hat','p1',CATALOG_VERSION),repo.purchase('A','gear-companion-scarf','p2',CATALOG_VERSION)])
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1)
    const state=await repo.state('A')
    expect(state.coins).toBeGreaterThanOrEqual(0)
    expect(state.inventory).toHaveLength(1)
    const item=state.inventory[0]
    await repo.purchase('A',item.itemId,item.purchaseId,CATALOG_VERSION)
    expect((await repo.state('A')).coins).toBe(state.coins)
    expect(await repo.purchase('A',item.itemId,'another-tab-intent',CATALOG_VERSION)).toBe('already-owned')
    expect(await db.purchaseReceipts.count()).toBe(1)
    await expect(repo.purchase('B',item.itemId,item.purchaseId,CATALOG_VERSION)).rejects.toThrow('identity')
    await expect(repo.purchase('A','gear-travel-pack','p3','obsolete')).rejects.toThrow('version')
  })
  it('rolls back debit on receipt failure; freezes equipment snapshot during battle',async()=>{
    const win=await victory();await repo.reward('A',win.id)
    vi.spyOn(db.purchaseReceipts,'add').mockRejectedValueOnce(new Error('storage fault'))
    await expect(repo.purchase('A','gear-travel-hat','p1',CATALOG_VERSION)).rejects.toThrow('storage')
    expect((await repo.state('A')).coins).toBe(60)
    expect((await repo.state('A')).inventory).toEqual([])
    await repo.purchase('A','gear-travel-hat','p1',CATALOG_VERSION)
    const battle=await repo.startBattle('A')
    expect(battle.loadoutSnapshot).toEqual(['gear-travel-hat'])
    await expect(repo.equip('A','gear-travel-hat',false)).rejects.toThrow('locked')
    await expect(repo.purchase('A','gear-companion-scarf','p2',CATALOG_VERSION)).rejects.toThrow('locked')
  })
  it('reset/export are owned and leave the other player and legacy intact',async()=>{
    await start('A');await start('B')
    setActiveProfileId('B')
    await repo.saveWorld('A',{x:10,y:10},'up')
    expect((await repo.state('B')).world).toBeUndefined()
    await db.progress.put({id:'legacy',type:'kana',correct:1,incorrect:0,lastSeen:1,nextReview:1,streak:1})
    expect((await repo.exportJourney('A')).data.battles.every(b=>b.profileId==='A')).toBe(true)
    await resetProfileProgress('A',false)
    expect((await repo.state('A')).battles).toEqual([])
    expect((await repo.state('B')).battles).toHaveLength(1)
    expect(await db.progress.count()).toBe(1)
  })
})
describe('world and battle pure boundaries',()=>{
  it('archives stale content/rules/checkpoints atomically; backup failure preserves every original',async()=>{
    const battle=await start();await repo.chooseMove('A',battle.id,'attack');await repo.submitTurn('A',battle.id,1,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1})
    await db.battleSessions.update(battle.id,{rulesVersion:'old-rules'})
    await db.studyPlans.update(['A','U01'],{contentVersion:'old-pack'})
    await db.learningChecks.put({id:'old-check',profileId:'A',unitId:'U01',contentVersion:'old-pack',questionIds:['old-q'],index:0,phase:'question',createdAt:1,updatedAt:1})
    await repo.saveWorld('A',town.spawn,'down');await db.worldCheckpoints.update('A',{position:{x:-1,y:300}})
    const original=await repo.exportJourney('A')
    vi.spyOn(db.migrationBackups,'add').mockRejectedValueOnce(new Error('backup quota fault'))
    await expect(repo.recoverVersions('A')).rejects.toThrow('quota')
    expect(await repo.exportJourney('A')).toEqual(original)
    await repo.recoverVersions('A')
    const state=await repo.state('A');expect(state.attempts).toHaveLength(1);expect(state.coins).toBe(0)
    expect(state.battles[0]).toMatchObject({rulesVersion:'old-rules',phase:'finished',endReason:'version-recovery'})
    expect(state.checks[0].phase).toBe('finished');expect(state.study).toMatchObject({contentVersion:pack.version,taughtCards:[]});expect(state.world?.position).toEqual(town.spawn)
    expect((await db.migrationBackups.toArray())[0].tables.battleSessions[0]).toMatchObject({rulesVersion:'old-rules',phase:'feedback'})
    await expect(repo.reward('A',battle.id)).rejects.toThrow('version')
    expect((await repo.state('B')).battles).toEqual([])
  })
  it('backs up malformed same-version positions and study fields before restoring safe defaults',async()=>{
    await repo.openStudy('A');await repo.saveWorld('A',town.spawn,'down')
    await db.studyPlans.update(['A','U01'],{taughtCards:[] ,timeZone:'not-a-timezone'})
    await db.worldCheckpoints.update('A',{position:null as unknown as {x:number;y:number},storyFlags:'bad' as unknown as string[]})
    await expect(repo.openStudy('A')).rejects.toThrow('preserved')
    await expect(repo.saveWorld('A',town.spawn,'down')).rejects.toThrow('preserved')
    await repo.recoverVersions('A')
    expect((await repo.openStudy('A')).timeZone).toBe('Asia/Taipei');expect((await repo.state('A')).world?.position).toEqual(town.spawn)
    const backup=(await db.migrationBackups.toArray())[0];expect(backup.tables.worldCheckpoints[0]).toMatchObject({position:null,storyFlags:'bad'})
  })
  it('delays a wrong family inside the same battle by three other submitted answers',async()=>{
    const changed=structuredClone(pack);changed.questions[1].itemFamilyId=changed.questions[0].itemFamilyId
    repo=new JourneyRepository(changed);let battle=await start()
    battle=await repo.chooseMove('A',battle.id,'attack');expect(battle.currentQuestionId).toBe('q0')
    await repo.submitTurn('A',battle.id,1,{answerIds:['b'],hintUsed:false,audioPlayCount:0,responseMs:1},10000);await repo.continueBattle('A',battle.id,1)
    for(let turn=2;turn<=4;turn++){
      battle=await repo.chooseMove('A',battle.id,'guard');expect(battle.currentQuestionId).not.toBe('q1')
      await repo.submitTurn('A',battle.id,turn,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1},10000+turn);await repo.continueBattle('A',battle.id,turn)
    }
    battle=await repo.chooseMove('A',battle.id,'guard')
    // The persisted permutation is stable on refresh; the blocked family is now eligible.
    expect((await repo.startBattle('A')).questionIds).toEqual(battle.questionIds)
    expect((await repo.state('A')).attempts).toHaveLength(4)
  })
  it('reaches every destination, rejects walls and preserves an old world checkpoint',async()=>{
    for(const destination of town.destinations) {
      const path=findPath(town.spawn,destination.point)
      expect(path).not.toBeNull()
      expect(path!.every((p,n)=>walkable(p) && near(n ? path![n-1]:town.spawn,p))).toBe(true)
    }
    expect(findPath(town.spawn,{x:7,y:4})).toBeNull()
    await repo.saveWorld('A',town.spawn,'down')
    await db.worldCheckpoints.update('A',{worldVersion:'old',position:{x:999,y:999}})
    await expect(repo.saveWorld('A',town.spawn,'down')).rejects.toThrow('preserved')
    await repo.recoverWorld('A')
    expect((await repo.state('A')).world?.position).toEqual(town.spawn)
    expect((await db.migrationBackups.toArray())[0].tables.worldCheckpoints[0]).toMatchObject({worldVersion:'old'})
  })
  it('versioned moves obey strong attack, guard, armor cap, terminal priority and turn limit',()=>{
    expect(BATTLE_RULES_VERSION).toBe('battle-rules-v0.1')
    expect(resolveTurn({...initialCombat(),turn:3},'guard',true,2)).toMatchObject({playerHp:38,enemyHp:26})
    expect(resolveTurn({...initialCombat(),enemyHp:8,playerHp:1,turn:8},'attack',true,0)).toMatchObject({status:'won',playerHp:1,enemyHp:0})
    expect(resolveTurn({...initialCombat(),turn:8},'attack',false,0).status).toBe('lost')
    expect(resolveTurn(initialCombat(),'guard',false,99).playerHp).toBe(39)
    expect(()=>resolveTurn({...initialCombat(),partnerUsed:true},'partner',true,0)).toThrow('unavailable')
  })
})

describe('P2-04 independent checks',()=>{
  it('persists each answer without automatic advance, rejects hints and never applies combat or coins',async()=>{
    const checkPack:UnitPack={...pack,questions:pack.questions.slice(0,5).map(q=>({...q,id:`check-${q.id}`,partition:'check',hintPolicy:'none'}))}
    repo=new JourneyRepository(checkPack)
    const day0=Date.parse('2026-10-16T00:00:00Z')
    const day2=day0+48*3600000
    await repo.openStudy('A',1,day0,'Asia/Taipei');await repo.teach('A','teach',day0)
    let check=await repo.startCheck('A',day0)
    await expect(repo.finishCheck('A',check.id)).rejects.toThrow('not finished')
    await expect(repo.submitCheck('A',check.id,0,{answerIds:['a'],hintUsed:true,audioPlayCount:0,responseMs:1},day0)).rejects.toThrow('Hints')
    for(let index=0;index<5;index++){
      const input={answerIds:[index===0 ? 'b':'a'],hintUsed:false,audioPlayCount:0,responseMs:1}
      await Promise.all(Array.from({length:10},()=>repo.submitCheck('A',check.id,index,input,index===0 ? day0:day2)))
      check=(await repo.state('A')).checks[0]
      expect(check.index).toBe(index)
      expect(check.phase).toBe('acknowledge')
      expect((await repo.startCheck('A')).id).toBe(check.id)
      await Promise.all(Array.from({length:10},()=>repo.continueCheck('A',check.id,index)))
      check=(await repo.state('A')).checks[0]
    }
    expect(check.phase).toBe('review')
    const state=await repo.state('A')
    expect(state.attempts).toHaveLength(5)
    expect(state.coins).toBe(0)
    expect(state.battles).toEqual([])
    expect(mastery(state.attempts,'G01',day0,{now:day2,timeZone:'Asia/Taipei'})).toBe('stable')
    await expect(repo.continueCheck('B',check.id,4)).rejects.toThrow('belong')
    await repo.finishCheck('A',check.id)
    expect((await repo.exportJourney('A')).data.checks[0].phase).toBe('finished')
  })
})
describe('P2-05 spaced review version recovery',()=>{
  it('saves first-journey preferences atomically without changing learning evidence or another player',async()=>{
    await repo.openStudy('A')
    vi.spyOn(db.studyPlans,'put').mockRejectedValueOnce(new Error('setup quota'))
    const input={name:'初次旅行',gradeBand:3 as const,comfort:'some' as const,skipped:false}
    await expect(repo.configureJourney('A',input)).rejects.toThrow('quota')
    expect((await db.profiles.get('A'))?.name).toBe('A');expect((await repo.state('A')).study?.onboarding).toBeUndefined()
    await repo.configureJourney('A',input)
    expect((await repo.state('A')).study).toMatchObject({gradeBand:3,onboarding:{comfort:'some',skipped:false},taughtCards:[]})
    expect((await db.profiles.get('B'))?.name).toBe('B');expect((await repo.state('A')).attempts).toEqual([]);expect((await repo.state('A')).reviews).toEqual([])
  })
  it('backs up a prior over-promoted schedule and rebuilds only from that player’s real attempts',async()=>{
    const day=Date.parse('2026-10-16T02:00:00Z')
    await repo.openStudy('A',1,day,'Asia/Taipei');await repo.teach('A','teach',day)
    let battle=await repo.startBattle('A',day)
    for(let turn=1;turn<=4;turn++){battle=await repo.chooseMove('A',battle.id,'attack');await repo.submitTurn('A',battle.id,turn,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1},day+turn*1000);battle=await repo.continueBattle('A',battle.id,turn)}
    const original=(await repo.state('A')).reviews[0]
    await db.skillReviews.put({...original,learningVersion:undefined,level:4,dueDate:'2026-11-15'})
    vi.spyOn(db.migrationBackups,'add').mockRejectedValueOnce(new Error('backup quota'))
    await expect(repo.openStudy('A',1,day,'Asia/Taipei')).rejects.toThrow('quota')
    expect((await repo.state('A')).reviews[0].level).toBe(4)
    await repo.openStudy('A',1,day,'Asia/Taipei')
    expect((await repo.state('A')).reviews[0]).toMatchObject({level:0,dueDate:'2026-10-17',learningVersion:LEARNING_RULES_VERSION})
    const backup=(await repo.exportJourney('A')).data.backups[0]
    expect(backup.tables.skillReviews[0]).toMatchObject({level:4,dueDate:'2026-11-15'})
    expect((await repo.exportJourney('B')).data.backups).toEqual([])
    await repo.openStudy('A',1,day,'Asia/Taipei');expect((await repo.exportJourney('A')).data.backups).toHaveLength(1)
    expect((await repo.state('A')).attempts).toHaveLength(4);expect((await repo.state('A')).coins).toBe(0)
  })
})


describe('P3-02 multiple unit isolation',()=>{
  function secondPack():UnitPack {
    return {...structuredClone(pack),id:'U02',questions:pack.questions.map(q=>({...q,unitId:'U02'}))}
  }
  it('keeps separate unfinished battles even when content versions and question IDs match',async()=>{
    const first=await start();const second=new JourneyRepository(secondPack())
    await second.openStudy('A');await second.teach('A','teach')
    const other=await second.startBattle('A')
    expect(other.id).not.toBe(first.id)
    expect((await repo.state('A')).battles.map(b=>b.id)).toEqual([first.id])
    expect((await second.state('A')).battles.map(b=>b.id)).toEqual([other.id])
    await expect(repo.chooseMove('A',other.id,'attack')).rejects.toThrow('version')
    await expect(second.chooseMove('A',first.id,'attack')).rejects.toThrow('version')
    expect((await repo.startBattle('A')).id).toBe(first.id)
    expect((await second.startBattle('A')).id).toBe(other.id)
  })
  it('recovers only the affected unit and preserves the other unit battle byte for byte',async()=>{
    const first=await start();const second=new JourneyRepository(secondPack())
    await second.openStudy('A');await second.teach('A','teach');const other=await second.startBattle('A')
    await db.battleSessions.update(first.id,{contentVersion:'obsolete'})
    await repo.recoverVersions('A')
    expect(await db.battleSessions.get(other.id)).toEqual(other)
    expect((await db.battleSessions.get(first.id))?.phase).toBe('finished')
    const backups=await db.migrationBackups.toArray()
    const archived=backups.flatMap(b=>b.tables.battleSessions ?? []) as BattleSession[]
    expect(archived.map(b=>b.id)).toContain(first.id)
    expect(archived.map(b=>b.id)).not.toContain(other.id)
  })
  it('rejects cross-unit checks and never archives another unit check during recovery',async()=>{
    const checkPack={...structuredClone(pack),questions:pack.questions.map(q=>({...q,partition:'check' as const,hintPolicy:'none' as const}))}
    const firstRepo=new JourneyRepository(checkPack)
    const second=new JourneyRepository({...checkPack,id:'U02',questions:checkPack.questions.map(q=>({...q,unitId:'U02'}))})
    for(const r of [firstRepo,second]){await r.openStudy('A');await r.teach('A','teach')}
    const first=await firstRepo.startCheck('A');const other=await second.startCheck('A')
    await expect(firstRepo.submitCheck('A',other.id,0,{answerIds:['a'],hintUsed:false,audioPlayCount:0,responseMs:1})).rejects.toThrow('version')
    await db.learningChecks.update(first.id,{contentVersion:'obsolete'});await firstRepo.recoverVersions('A')
    expect(await db.learningChecks.get(other.id)).toEqual(other)
    expect((await second.state('A')).checks.map(c=>c.id)).toEqual([other.id])
    expect(await db.learningAttempts.count()).toBe(0)
  })
})
