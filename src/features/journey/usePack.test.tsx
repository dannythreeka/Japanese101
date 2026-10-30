import {act,renderHook,waitFor} from '@testing-library/react'
import {expect,it,vi} from 'vitest'
import type {UnitPack} from '../../content/contracts'
const {load}=vi.hoisted(()=>({load:vi.fn()}))
vi.mock('../../content/packs/loader',()=>({loadPack:load}))
import {usePack} from './usePack'
it('ignores a previous unit that completes after the route has loaded a different unit',async()=>{
 let first!:(pack:UnitPack)=>void
 load.mockImplementation((id:string)=>id==='U06'?new Promise<UnitPack>(resolve=>{first=resolve}):Promise.resolve({id:'U02'} as UnitPack))
 const {result,rerender}=renderHook(({id})=>usePack(id),{initialProps:{id:'U06'}})
 expect(result.current.pack).toBeUndefined()
 rerender({id:'U02'});await waitFor(()=>expect(result.current.pack?.id).toBe('U02'))
 await act(async()=>{first({id:'U06'} as UnitPack)})
 expect(result.current.pack?.id).toBe('U02')
})
