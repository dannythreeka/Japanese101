import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getActiveProfileId, getProfile, getAllProfiles, getOrCreatePet } from '../../db'
import { JourneyRepository } from '../../db/journey'
import { u01 } from '../../content/packs/u01'
import type { Profile } from '../../types/profile'
import type { PetState } from '../../types'
export type JourneyState=Awaited<ReturnType<JourneyRepository['state']>>
export function useJourney(){
  const [profileId]=useState(getActiveProfileId)
  const repo=useMemo(()=>new JourneyRepository(u01),[])
  const [data,setData]=useState<JourneyState>()
  const [profile,setProfile]=useState<Profile|null>(null)
  const [profiles,setProfiles]=useState<Profile[]>([])
  const [pet,setPet]=useState<PetState|null>(null)
  const [error,setError]=useState<'storage'|'version'|'catalog'|'conflict'|'unavailable'|null>(null)
  const [pending,setPending]=useState(false)
  const mounted=useRef(false);const requests=useRef(0);const busy=useRef(false);const retryRef=useRef<(()=>Promise<void>)|null>(null)
  const reload=useCallback(async()=>{
    const request=++requests.current
    await repo.openStudy(profileId)
    const [next,profile,profiles,pet]=await Promise.all([repo.state(profileId),getProfile(profileId),getAllProfiles(),getOrCreatePet(profileId)])
    if(mounted.current && request===requests.current){setData(next);setProfile(profile);setProfiles(profiles);setPet(pet)}
    return next
  },[repo,profileId])
  useEffect(()=>{
    let active=true;mounted.current=true
    void reload().catch(e=>{if(active)setError(e instanceof Error && /Catalog/.test(e.message) ? 'catalog':e instanceof Error && /version/.test(e.message) ? 'version':'unavailable')})
    return ()=>{active=false;mounted.current=false}
  },[reload])
  const perform=useCallback(async(action:()=>Promise<void>)=>{
    if(busy.current)return
    busy.current=true;setPending(true);setError(null);retryRef.current=action
    try{await action();await reload();if(mounted.current)retryRef.current=null}
    catch(e){
      if(e instanceof Error && /Not enough coins|locked during battle|Move unavailable/.test(e.message)){
        retryRef.current=null
        try{await reload();if(mounted.current)setError('conflict')}catch{if(mounted.current)setError('storage')}
      }else if(mounted.current)setError(e instanceof Error && /Catalog/.test(e.message) ? 'catalog':e instanceof Error && /version/.test(e.message) ? 'version':'storage')
    }
    finally{busy.current=false;if(mounted.current)setPending(false)}
  },[reload])
  const retry=useCallback(()=>{if(retryRef.current)void perform(retryRef.current);else void reload().then(()=>setError(null)).catch(()=>setError('unavailable'))},[perform,reload])
  return {profileId,repo,data,setData,profile,profiles,pet,error,setError,pending,perform,reload,retry}
}
