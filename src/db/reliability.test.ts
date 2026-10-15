import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { db, getAllProgress, setActiveProfileId, resetProfileProgress, deleteProfile, getProfilePreferences } from './index'
import { openGameSession, saveCheckpoint, submitGameAnswer, finishGameSession, recoverGameRoute } from './game-sessions'
import { openLevelSession, launchLevelChallenge, acceptChallengeResult, finishLevel } from './level-sessions'
import { levelsData } from '../data/loaders'

beforeEach(async () => {
  db.close(); await db.delete(); await db.open()
  await db.profiles.bulkPut(['A','B'].map(profile_id=>({profile_id,name:profile_id,avatar_emoji:'🦊',created_at:1,last_played:1})))
})
afterEach(async()=>{db.close();await db.delete()})

async function completeChallenge(levelSessionId: string, challengeId: string) {
  await launchLevelChallenge('A',levelSessionId,challengeId)
  const game=await openGameSession('A',`${levelSessionId}:${challengeId}`,'kana_catch',{levelSessionId,challengeId})
  await saveCheckpoint('A',game.id,{current:'a'},1)
  await submitGameAnswer('A',game.id,'q1','a','kana',true)
  await finishGameSession('A',game.id)
  await acceptChallengeResult('A',levelSessionId,game.id)
  return game
}

describe('owned durable sessions and atomic rewards',()=>{
  it('deduplicates ten simultaneous submissions and ten completion retries',async()=>{
    const session=await openGameSession('A','free-kana','kana_catch')
    await saveCheckpoint('A',session.id,{question:'あ'},1)
    await Promise.all(Array.from({length:10},()=>submitGameAnswer('A',session.id,'q1','a','kana',true)))
    await Promise.all(Array.from({length:10},()=>finishGameSession('A',session.id)))
    expect((await getAllProgress('A'))[0].correct).toBe(1)
    expect(await db.playerSessions.count()).toBe(1)
    expect(await db.rewardReceipts.count()).toBe(1)
    expect((await db.wallets.get('A'))?.stars).toBe(1)
    expect((await db.pets.get('A'))?.xp).toBe(30)
    expect(await getAllProgress('B')).toEqual([])
  })
  it('keeps delayed A writes owned by A after switching to B; restores first errors',async()=>{
    const session=await openGameSession('A','free-kana','kana_catch')
    await saveCheckpoint('A',session.id,{queue:['a','i']},1)
    await submitGameAnswer('A',session.id,'q1','a','kana',false)
    setActiveProfileId('B')
    const restored=await openGameSession('A','free-kana','kana_catch')
    expect(restored.id).toBe(session.id);expect(restored.attempts.q1.firstAnswerCorrect).toBe(false)
    await submitGameAnswer('A',session.id,'q1','a','kana',true)
    const final=await finishGameSession('A',session.id)
    expect(final.summary).toMatchObject({correct:0,total:1,completionRate:1})
    expect(await getAllProgress('B')).toEqual([])
    await expect(submitGameAnswer('B',session.id,'q1','a','kana',true)).rejects.toThrow('belong')
  })
  it('retains a changed-content checkpoint instead of clearing answers',async()=>{
    const session=await openGameSession('A','old','kana_catch')
    await db.gameCheckpoints.update(session.id,{contentVersion:'old-version',checkpoint:{preserve:'yes'}})
    await expect(openGameSession('A','old','kana_catch')).rejects.toThrow('Content version')
    expect((await db.gameCheckpoints.get(session.id))?.checkpoint).toEqual({preserve:'yes'})
  })
  it('refuses direct URLs, missing required results and locked levels',async()=>{
    const first=levelsData().levels[0].level_id
    await expect(finishLevel('A','no-session',first)).rejects.toThrow('Invalid')
    const session=await openLevelSession('A',first)
    await expect(finishLevel('A',session.id,first)).rejects.toThrow('unfinished')
    await expect(openLevelSession('A',levelsData().levels.at(-1)!.level_id)).rejects.toThrow('locked')
    expect(await db.rewardReceipts.count()).toBe(0)
  })
  it('uses one transaction for level rewards and applies replay decay exactly once',async()=>{
    const first=levelsData().levels[0]
    const level=await openLevelSession('A',first.level_id)
    for(const c of first.challenges.filter(c=>c.required_for_completion!==false))await completeChallenge(level.id,c.challenge_id)
    const rewards=await Promise.all(Array.from({length:10},()=>finishLevel('A',level.id,first.level_id)))
    expect(rewards.every(r=>r.receipt.xp===first.xp_reward+30)).toBe(true)
    expect((await db.adventureProgress.get('A'))?.completed_levels[first.level_id].times_played).toBe(1)
    const replay=await openLevelSession('A',first.level_id)
    for(const c of first.challenges.filter(c=>c.required_for_completion!==false))await completeChallenge(replay.id,c.challenge_id)
    expect((await finishLevel('A',replay.id,first.level_id)).receipt.xp).toBe(Math.round((first.xp_reward+30)*.5))
  })
  it('rolls XP and level progress back on receipt/storage failure',async()=>{
    const first=levelsData().levels[0]
    const level=await openLevelSession('A',first.level_id)
    for(const c of first.challenges.filter(c=>c.required_for_completion!==false))await completeChallenge(level.id,c.challenge_id)
    const before=(await db.pets.get('A'))?.xp
    const fail=(_key: unknown, object: {id:string})=>{if(object.id.startsWith('level:'))throw new Error('simulated storage failure')}
    db.rewardReceipts.hook('creating',fail)
    await expect(finishLevel('A',level.id,first.level_id)).rejects.toThrow('simulated')
    db.rewardReceipts.hook('creating').unsubscribe(fail)
    expect((await db.pets.get('A'))?.xp).toBe(before)
    expect((await db.adventureProgress.get('A'))?.completed_levels[first.level_id]).toBeUndefined()
    expect((await db.levelSessions.get(level.id))?.status).toBe('active')
  })
})


it('recovers a stale content version without deleting its attempts',async()=>{
  const game=await openGameSession('A','old-route','kana')
  await submitGameAnswer('A',game.id,'q1','a','kana',false)
  await db.gameCheckpoints.update(game.id,{contentVersion:'expired'})
  await recoverGameRoute('A','old-route')
  expect((await db.gameCheckpoints.get(game.id))?.attempts.q1.firstAnswerCorrect).toBe(false)
  expect((await openGameSession('A','old-route','kana')).id).not.toBe(game.id)
})
it('reset/delete A never changes B or original shared backup data',async()=>{
  for(const profileId of ['A','B']) {
    const game=await openGameSession(profileId,'test','kana')
    await saveCheckpoint(profileId,game.id,{},1)
    await submitGameAnswer(profileId,game.id,'q1','a','kana',true)
    await finishGameSession(profileId,game.id)
  }
  await db.progress.put({id:'legacy',type:'kana',correct:5,incorrect:0,lastSeen:1,nextReview:2,streak:1})
  const before=await db.wallets.get('B')
  await resetProfileProgress('A')
  expect(await getAllProgress('A')).toEqual([]);expect((await getAllProgress('B'))[0].correct).toBe(1)
  expect(await db.wallets.get('B')).toEqual(before)
  await deleteProfile('A')
  expect(await db.profiles.get('B')).toBeDefined();expect(await db.progress.get('legacy')).toBeDefined()
})
it('normalizes broken preferences and defaults microphones off',async()=>{
  await db.preferences.put({profileId:'A',micMode:'enhanced',enhancedConsent:false,kanaDifficulty:'broken',disabledUnits:null} as never)
  expect(await getProfilePreferences('A')).toMatchObject({profileId:'A',micMode:'off',kanaDifficulty:1,disabledUnits:[]})
  expect(await getProfilePreferences('B')).toMatchObject({micMode:'off',enhancedConsent:false})
})
it('all L0–L10 required challenge services complete without any voice evidence',async()=>{
  for(const level of levelsData().levels) {
    const session=await openLevelSession('A',level.level_id)
    for(const challenge of level.challenges.filter(c=>c.required_for_completion!==false)) {
      expect(challenge.game_mode).not.toBe('kotodama_summon')
      const active=await launchLevelChallenge('A',session.id,challenge.challenge_id)
      expect(active.pending?.challengeId).toBe(challenge.challenge_id)
      const feature=challenge.game_mode==='dakuten_drag'?'dakuten_drag':'kana_catch'
      const game=await openGameSession('A',`${session.id}:${challenge.challenge_id}`,feature,{levelSessionId:session.id,challengeId:challenge.challenge_id})
      await saveCheckpoint('A',game.id,{},1)
      await submitGameAnswer('A',game.id,'q1','a','kana',true)
      await finishGameSession('A',game.id)
      await acceptChallengeResult('A',session.id,game.id)
    }
    await finishLevel('A',session.id,level.level_id)
  }
  expect(Object.keys((await db.adventureProgress.get('A'))!.completed_levels)).toHaveLength(11)
})
