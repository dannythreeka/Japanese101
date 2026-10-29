/** Versioned game rules. Learning evidence is provided, never recalculated here. */
export const BATTLE_RULES_VERSION = 'battle-rules-v0.1'
export type Move = 'attack' | 'guard' | 'partner'
export interface CombatState { playerHp:number; enemyHp:number; turn:number; partnerUsed:boolean; status:'active'|'won'|'lost'|'retreated' }
export const initialCombat = (): CombatState => ({playerHp:40,enemyHp:30,turn:1,partnerUsed:false,status:'active'})
export const enemyIntent = (turn:number) => ({strong:turn%3===0,damage:turn%3===0 ? 8:4})
export function resolveTurn(state: CombatState, move: Move, correct: boolean, armor:number): CombatState {
  if (state.status!=='active' || !Number.isInteger(state.turn) || state.turn<1 || state.turn>8 || state.playerHp<1 || state.playerHp>40 || state.enemyHp<1 || state.enemyHp>30 || !Number.isFinite(armor) || armor<0 || !Number.isInteger(armor)) throw new Error('Invalid combat state')
  if (!['attack','guard','partner'].includes(move) || move==='partner' && state.partnerUsed) throw new Error('Move unavailable')
  const enemyHp=Math.max(0,state.enemyHp-(correct ? move==='partner' ? 12:move==='attack' ? 8:4:0))
  const enemyDamage=Math.max(1,enemyIntent(state.turn).damage/(move==='guard' ? 2:1)-Math.min(2,armor))
  const playerHp=enemyHp===0 ? state.playerHp:Math.max(0,state.playerHp-enemyDamage)
  return {...state,enemyHp,playerHp,partnerUsed:state.partnerUsed || move==='partner',status:enemyHp===0 ? 'won':playerHp===0 || state.turn===8 ? 'lost':'active'}
}
