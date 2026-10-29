import {expect,it} from 'vitest'
import {attemptUnit,teachingEvidence} from './report'
import {u01} from '../content/packs/u01'
import {u02} from '../content/packs/u02'
import type {Attempt} from '../content/contracts'
import type {BattleSession,StudyPlan} from '../db/journey-models'
it('attributes historical colliding items by session and retains unknown items without inventing a unit',()=>{
  const a={profileId:'A',sessionId:'session',itemId:'historical'} as Attempt
  const battle={id:'session',profileId:'A',unitId:'U02'} as BattleSession
  expect(attemptUnit(a,{battles:[battle],checks:[]},[u01,u02])).toBe('U02')
  expect(attemptUnit({...a,profileId:'B'},{battles:[battle],checks:[]},[u01,u02])).toBeUndefined()
  expect(attemptUnit({...a,itemId:u02.questions[0].itemId},{battles:[],checks:[]},[u01,u02])).toBe('U02')
})
it('uses real U02 teaching timestamps rather than the U01 plan for G04, and earliest real shared instruction',()=>{
  const base={profileId:'A',contentVersion:'draft',taughtCards:[],date:'2026-10-30',gradeBand:1 as const,questionIds:[],updatedAt:40}
  const plans:StudyPlan[]=[{...base,unitId:'U01',taughtAt:{'G01':10,'V-CONTEXT':20},timeZone:'Asia/Taipei'},{...base,unitId:'U02',taughtAt:{'G04':30,'V-CONTEXT':40},timeZone:'Asia/Taipei'}]
  expect(teachingEvidence('G04',{plans},[u01,u02]).taughtAt).toBe(30)
  expect(teachingEvidence('V-CONTEXT',{plans},[u01,u02]).taughtAt).toBe(20)
  expect(teachingEvidence('G05',{plans},[u01,u02]).taughtAt).toBeUndefined()
})
