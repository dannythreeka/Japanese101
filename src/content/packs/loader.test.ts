import {expect,it} from 'vitest'
import {availablePacks} from './registry'
import {packCatalog,loadPack,loadAllPacks} from './loader'
it('keeps runtime menus and asynchronous content identical to the actual validated registry',async()=>{
 expect(packCatalog).toEqual(availablePacks.map(({id,title,version})=>({id,title,version})))
 const packs=await loadAllPacks()
 expect(packs.map(p=>p.id)).toEqual(availablePacks.map(p=>p.id))
 for(let n=0;n<packs.length;n++)expect(packs[n]).toEqual(availablePacks[n])
 expect(loadPack('U06')).toBe(loadPack('U06'))
})
it('rejects missing and prototype IDs instead of substituting another unit',async()=>{
 for(const id of ['U24','unknown','__proto__','constructor'])await expect(loadPack(id)).rejects.toThrow('Unknown curriculum pack')
})
