import 'fake-indexeddb/auto'
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {db} from './index'
import {JourneyRepository} from './journey'
import {hiraganaPack,katakanaPack} from '../content/packs/kana'
import {u01} from '../content/packs/u01'
import {mastery} from '../learning/rules'
const repo=new JourneyRepository(hiraganaPack)
beforeEach(async()=>{db.close();await db.delete();await db.open();await db.profiles.bulkPut(['A','B'].map(profile_id=>({profile_id,name:profile_id,avatar_emoji:'🦊',created_at:1,last_played:1})));await repo.openStudy('A')})
afterEach(async()=>{vi.restoreAllMocks();db.close();await db.delete()})
it('allows diagnostic before teaching, resumes it, and grants practice eligibility only after final save',async()=>{
  const check=await repo.startKanaPlacement('A',0)
  expect(check.questionIds).toHaveLength(5)
  expect((await repo.startKanaPlacement('A',1)).id).toBe(check.id)
  await expect(repo.startCheck('B')).rejects.toThrow()
  await expect(repo.submitCheck('B',check.id,0,{answerIds:['a'],hintUsed:false,audioPlayCount:1,responseMs:1000})).rejects.toThrow('belong')
  for(let i=0;i<5;i++){
    const q=hiraganaPack.questions.find(q=>q.id===check.questionIds[i])!
    const input={answerIds:i===0?q.choices.filter(c=>c.id!==q.answer[0]).slice(0,1).map(c=>c.id):q.answer,hintUsed:false,audioPlayCount:1,responseMs:1000}
    await Promise.all([repo.submitCheck('A',check.id,i,input),repo.submitCheck('A',check.id,i,input)])
    await repo.continueCheck('A',check.id,i)
  }
  expect(await db.learningAttempts.count()).toBe(5)
  expect((await repo.state('A')).placementSkills).toEqual([])
  await repo.finishCheck('A',check.id)
  const data=await repo.state('A')
  expect(data.placementSkills).toHaveLength(4)
  expect(data.study?.taughtAt).toEqual({});expect(data.study?.taughtCards).toEqual([])
  const battle=await repo.startBattle('A')
  expect(battle.questionIds).toHaveLength(4)
  expect(battle.questionIds).not.toContain('KANA-HIRA:practice:a')
  expect(mastery(data.attempts,data.placementSkills[0],undefined,{now:Date.now(),timeZone:'Asia/Taipei'})).not.toBe('stable')
  const kata=new JourneyRepository(katakanaPack);await kata.openStudy('A')
  expect((await kata.state('A')).placementSkills).toEqual([])
  await expect(kata.startBattle('A')).rejects.toThrow('Learn')
})
it('keeps ordinary prerequisites intact and rejects invalid group / non-kana requests',async()=>{
  await expect(repo.startCheck('A')).rejects.toThrow('Learn')
  for(const group of [-1,10,NaN,1.5])await expect(repo.startKanaPlacement('A',group)).rejects.toThrow('Invalid')
  const regular=new JourneyRepository(u01);await regular.openStudy('A')
  await expect(regular.startKanaPlacement('A',0)).rejects.toThrow('Invalid')
})
it('rolls back answers when persistence fails and never grants credit from a hint or forged result',async()=>{
  const check=await repo.startKanaPlacement('A',9);const q=hiraganaPack.questions.find(q=>q.id===check.questionIds[0])!
  const input={answerIds:q.answer,hintUsed:false,audioPlayCount:1,responseMs:1000}
  vi.spyOn(db.skillReviews,'put').mockRejectedValueOnce(new Error('quota'))
  await expect(repo.submitCheck('A',check.id,0,input)).rejects.toThrow('quota')
  expect(await db.learningAttempts.count()).toBe(0)
  expect((await db.learningChecks.get(check.id))?.phase).toBe('question')
  await repo.submitCheck('A',check.id,0,input);await repo.continueCheck('A',check.id,0);await repo.finishCheck('A',check.id)
  expect((await repo.state('A')).placementSkills).toHaveLength(1)
  await db.learningAttempts.update(`${check.id}:check-0`,{answerIds:['forged']})
  expect((await repo.state('A')).placementSkills).toEqual([])
})

it('cannot grant credit by truncating a diagnostic group or inventing completed answers',async()=>{
  const check=await repo.startKanaPlacement('A',0);const q=hiraganaPack.questions.find(q=>q.id===check.questionIds[0])!
  await repo.submitCheck('A',check.id,0,{answerIds:q.answer,hintUsed:false,audioPlayCount:1,responseMs:1000})
  await db.learningChecks.update(check.id,{phase:'finished'})
  expect((await repo.state('A')).placementSkills).toEqual([])
  await db.learningChecks.update(check.id,{questionIds:[q.id]})
  expect((await repo.state('A')).placementSkills).toEqual([])
})
