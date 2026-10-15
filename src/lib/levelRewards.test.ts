import { it, expect } from 'vitest'
import { levelRewardXp } from './levelRewards'
it.each([[0,80,110],[1,40,55],[2,20,28],[3,8,11],[10,8,11]])('replay %i previews and awards %i–%i XP',(played,minimum,maximum)=>{
  expect(levelRewardXp(80,1,played)).toBe(minimum)
  expect(levelRewardXp(80,2,played)).toBe(minimum)
  expect(levelRewardXp(80,3,played)).toBe(maximum)
})
it('rejects damaged replay history rather than inventing a full reward',()=>{
  for(const count of [-1,NaN,Infinity,'1'])expect(()=>levelRewardXp(80,3,count as number)).toThrow('Invalid reward history')
})
