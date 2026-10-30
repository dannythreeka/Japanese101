import {useEffect,useState} from 'react'
import {loadPack} from '../../content/packs/loader'
import type {UnitPack} from '../../content/contracts'
/** Old requests cannot render a previous unit after a route switch or unmount. */
export function usePack(id:string){
 const [result,setResult]=useState<{id:string;pack?:UnitPack;error?:boolean}>()
 useEffect(()=>{let active=true;void loadPack(id).then(pack=>{if(active)setResult({id,pack})}).catch(()=>{if(active)setResult({id,error:true})});return()=>{active=false}},[id])
 const current=result?.id===id?result:undefined
 return {pack:current?.pack,error:current?.error??false,retry:()=>window.location.reload()}
}
