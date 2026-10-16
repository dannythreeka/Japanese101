import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { db, resetProfileProgress, setActiveProfileId } from './index'
import { JourneyRepository } from './journey'
import { CATALOG_VERSION } from '../economy/catalog'
import { BATTLE_RULES_VERSION, initialCombat, resolveTurn } from '../battle/rules'
import { findPath, near, town, walkable } from '../world/map'
import type { UnitPack } from '../content/contracts'

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
    await db.battleSessions.update(battle.id,{rulesVersion:'old'})
    await expect(repo.chooseMove('A',battle.id,'attack')).rejects.toThrow('preserved')
    expect((await db.battleSessions.get(battle.id))?.rulesVersion).toBe('old')
  })
})
describe('P2-15 wallet and inventory',()=>{
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
