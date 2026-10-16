/** Preview and atomic settlement share the same replay and three-star reward rules. */
export function levelRewardXp(base:number,stars:1|2|3,previousPlays:number):number {
  if(!Number.isInteger(base)||base<0||!Number.isInteger(previousPlays)||previousPlays<0||![1,2,3].includes(stars))throw new Error('Invalid reward history')
  const factor=previousPlays>=3?.1:previousPlays===2?.25:previousPlays===1?.5:1
  return Math.round((base+(stars===3?30:0))*factor)
}
