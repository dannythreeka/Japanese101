import {expect,it} from 'vitest'
import {imageFrameStyle} from './imageFrame'
import {contextArt} from '../../content/packs/art'
it('uses the real nonuniform frame windows rather than assuming every grid row has half the image height',()=>{
 const src='/assets/img/u07/apple-counts.webp',asset=contextArt(src)!
 const top=imageFrameStyle({src,cell:0,alt:{zh:'test',ja:'test'}},asset),bottom=imageFrameStyle({src,cell:3,alt:{zh:'test',ja:'test'}},asset)
 expect(top.aspectRatio).toBe('627/587');expect(top.backgroundPosition).toBe('0% 0%')
 expect(bottom.aspectRatio).toBe('627/667');expect(bottom.backgroundPosition).toBe('100% 100%')
 expect(top.backgroundSize).not.toBe('200% 200%')
 const previous=imageFrameStyle({src,cell:3,alt:{zh:'test',ja:'test'}},contextArt('/assets/img/u06/cafeteria-requests.webp'))
 expect(previous.backgroundSize).toBe('200% 200%');expect(previous.backgroundPosition).toBe('100% 100%')
})
