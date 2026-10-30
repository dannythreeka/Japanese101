import type {Question} from '../../content/contracts'
import {contextArt} from '../../content/packs/art'
import {imageFrameStyle} from './imageFrame'
export default function ContextImage({image,lang}:{image:NonNullable<Question['image']>;lang:'zh'|'ja'}){
 return <div role="img" aria-label={image.alt[lang]} style={{width:'min(100%,360px)',backgroundImage:`url(${import.meta.env.BASE_URL}${image.src.slice(1)})`,...imageFrameStyle(image,contextArt(image.src)),borderRadius:16,justifySelf:'center'}}/>
}
