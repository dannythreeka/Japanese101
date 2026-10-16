import type { Attempt } from '../content/contracts'
import type { CombatState, Move } from '../battle/rules'
import type { EquipmentSlot } from '../economy/catalog'
import type { Facing, Point } from '../world/map'
import type { ReviewSchedule } from '../learning/rules'
export interface WorldCheckpoint { profileId:string; mapId:string; worldVersion:string; position:Point; facing:Facing; storyFlags:string[]; updatedAt:number }
export interface StudyPlan { profileId:string; unitId:string; contentVersion:string; taughtCards:string[]; taughtAt:Record<string,number>; date:string; timeZone:string; gradeBand:1|2|3; questionIds:string[]; updatedAt:number }
export interface SkillReview extends ReviewSchedule { profileId:string; skillId:string; timeZone:string }
export interface BattleSession extends CombatState { id:string; profileId:string; challengeId:string; unitId:string; contentVersion:string; rulesVersion:string; phase:'choosing'|'question'|'feedback'|'finished'; move?:Move; questionIds:string[]; currentQuestionId?:string; lastAttemptId?:string; feedbackBefore?:{playerHp:number;enemyHp:number}; endReason?:'questions-complete'|'version-recovery'; loadoutSnapshot:string[]; createdAt:number; updatedAt:number }
export interface CoinWallet { profileId:string; balance:number }
export interface CoinLedger { id:string; profileId:string; kind:'reward'|'purchase'; amount:number; balanceAfter:number; battleId?:string; purchaseId?:string; createdAt:number }
export interface InventoryItem { profileId:string; itemId:string; acquiredAt:number; purchaseId:string }
export interface Equipment { profileId:string; slots:Partial<Record<EquipmentSlot,string>> }
export interface PurchaseReceipt { id:string; profileId:string; itemId:string; catalogVersion:string; price:number; createdAt:number }
export interface FirstWin { profileId:string; challengeId:string; battleId:string }
export interface LearningCheck { id:string; profileId:string; unitId:string; contentVersion:string; questionIds:string[]; index:number; phase:'question'|'acknowledge'|'review'|'finished'; createdAt:number; updatedAt:number }
export interface JourneyTables { attempts:Attempt[]; world:WorldCheckpoint[]; plans:StudyPlan[]; reviews:SkillReview[]; battles:BattleSession[]; checks:LearningCheck[]; wallets:CoinWallet[]; ledger:CoinLedger[]; inventory:InventoryItem[]; equipment:Equipment[]; purchases:PurchaseReceipt[]; firstWins:FirstWin[] }
