import {AppDB,db as defaultDB} from './index'
import type {UnitPack} from '../content/contracts'
import type {MockPaper} from '../mock/contracts'
import {mockInventoryErrors} from '../mock/validation'
import {createMockSession,transitionMockSession,type MockCommand} from '../mock/session'
import {scoreMock} from '../mock/report'

/** All mutations await the IndexedDB commit. A failed receipt write also rolls back its answer/clock/section. */
export class MockRepository {
  private readonly paper:MockPaper
  private readonly database:AppDB
  private readonly clock:()=>number
  constructor(paper:MockPaper,daily:readonly UnitPack[],database:AppDB=defaultDB,clock:()=>number=Date.now){
    const errors=mockInventoryErrors([paper],daily)
    if(errors.length)throw new Error(errors.join('; '))
    this.paper=structuredClone(paper)
    this.database=database;this.clock=clock
  }
  private async owner(profileId:string){if(!await this.database.profiles.get(profileId))throw new Error('Player no longer exists')}
  private async session(profileId:string,id:string){
    await this.owner(profileId)
    const current=await this.database.mockSessions.get(id)
    if(!current||current.profileId!==profileId)throw new Error('Mock does not belong to this player')
    if(current.paperId!==this.paper.id)throw new Error('Wrong mock paper')
    return current
  }
  async create(profileId:string,id:string,practice=false){
    const d=this.database
    return d.transaction('rw',[d.profiles,d.mockSessions],async()=>{
      await this.owner(profileId)
      const existing=await d.mockSessions.get(id)
      if(existing){if(existing.profileId!==profileId||existing.paperId!==this.paper.id)throw new Error('Mock identity conflict');return existing}
      const ongoing=(await d.mockSessions.where('[profileId+paperId]').equals([profileId,this.paper.id]).toArray()).find(s=>!['submitted','interrupted'].includes(s.status))
      if(ongoing)return ongoing
      const session=createMockSession(id,profileId,this.paper,this.clock(),practice)
      await d.mockSessions.add(session);return session
    })
  }
  async read(profileId:string,id:string){return this.database.transaction('r',[this.database.profiles,this.database.mockSessions],()=>this.session(profileId,id))}
  async list(profileId:string){
    const d=this.database
    return d.transaction('r',[d.profiles,d.mockSessions],async()=>{await this.owner(profileId);return d.mockSessions.where('profileId').equals(profileId).toArray()})
  }
  async dispatch(profileId:string,id:string,expectedRevision:number,commandId:string,input:MockCommand){
    if(!commandId.trim()||commandId.length>200||!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw new Error('Invalid mock command identity/revision')
    const command=structuredClone(input),fingerprint=JSON.stringify({expectedRevision,command}),d=this.database
    return d.transaction('rw',[d.profiles,d.mockSessions,d.mockCommandReceipts],async()=>{
      const current=await this.session(profileId,id),old=await d.mockCommandReceipts.get(commandId)
      if(old){
        if(old.profileId!==profileId||old.sessionId!==id||old.fingerprint!==fingerprint)throw new Error('Mock command identity conflict')
        return {session:current,accepted:old.accepted,reason:old.reason,replayed:true}
      }
      if(current.status==='submitted'&&command.type==='submit-section')return {session:current,accepted:false,reason:'already-submitted',replayed:true}
      if(current.revision!==expectedRevision)throw new Error('Mock changed in another tab; reload before answering')
      const now=this.clock(),result=transitionMockSession(current,this.paper,command,now)
      if(result.session!==current)await d.mockSessions.put(result.session)
      await d.mockCommandReceipts.add({id:commandId,profileId,sessionId:id,fingerprint,accepted:result.accepted,reason:result.reason,revision:result.session.revision,createdAt:now})
      return {...result,replayed:false}
    })
  }
  async result(profileId:string,id:string){return scoreMock(await this.read(profileId,id),this.paper)}
}
