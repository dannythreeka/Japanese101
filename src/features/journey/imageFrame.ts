import type {Question} from '../../content/contracts'
import type {ArtAsset} from '../../world/validation'
export function imageFrameStyle(image:NonNullable<Question['image']>,asset:ArtAsset|undefined){
 const frame=asset?.frameWindows?.[image.cell]
 if(asset&&frame&&frame.w>0&&frame.h>0)return {
  aspectRatio:`${frame.w}/${frame.h}`,
  backgroundSize:`${asset.width/frame.w*100}% ${asset.height/frame.h*100}%`,
  backgroundPosition:`${asset.width===frame.w?0:frame.x/(asset.width-frame.w)*100}% ${asset.height===frame.h?0:frame.y/(asset.height-frame.h)*100}%`,
 }
 return {aspectRatio:'1',backgroundSize:'200% 200%',backgroundPosition:`${image.cell%2*100}% ${Math.floor(image.cell/2)*100}%`}
}
