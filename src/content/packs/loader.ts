import type {UnitPack} from '../contracts'
import catalog from './catalog.json'
export const packCatalog:readonly {id:string;title:string;version:string}[]=catalog
const loaders:Record<string,()=>Promise<UnitPack>>={
 'KANA-HIRA':()=>import('./kana').then(m=>m.hiraganaPack),'KANA-KATA':()=>import('./kana').then(m=>m.katakanaPack),
 U01:()=>import('./u01').then(m=>m.u01),U02:()=>import('./u02').then(m=>m.u02),U03:()=>import('./u03').then(m=>m.u03),
 U04:()=>import('./u04').then(m=>m.u04),U05:()=>import('./u05').then(m=>m.u05),U06:()=>import('./u06').then(m=>m.u06),U07:()=>import('./u07').then(m=>m.u07),U08:()=>import('./u08').then(m=>m.u08),
}
const pending=new Map<string,Promise<UnitPack>>()
export function loadPack(id:string):Promise<UnitPack>{
 const expected=packCatalog.find(p=>p.id===id),loader=Object.hasOwn(loaders,id)?loaders[id]:undefined
 if(!expected||!loader)return Promise.reject(new Error('Unknown curriculum pack'))
 const old=pending.get(id);if(old)return old
 const next=loader().then(pack=>{
  if(pack.id!==expected.id||pack.version!==expected.version||pack.title!==expected.title)throw new Error('Curriculum metadata changed; reopen the application')
  return pack
 }).catch(error=>{pending.delete(id);throw error})
 pending.set(id,next);return next
}
export const loadAllPacks=()=>Promise.all(packCatalog.map(p=>loadPack(p.id)))
