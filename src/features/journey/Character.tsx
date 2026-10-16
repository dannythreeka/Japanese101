import { useContext, type CSSProperties } from 'react'
import type { Facing } from '../../world/map'
import PetAvatar from '../../components/PetAvatar'
import {JourneyPetContext} from './pet-context'
import {atlasFrame} from '../../world/artFrames'
const url=(id:string)=>`${import.meta.env.BASE_URL}assets/img/journey/${id}.webp`
const facingRows:Record<Facing,number>={down:0,left:1,right:2,up:3}
const gearCells:Record<Facing,[number,number]>={down:[0,0],left:[1,0],right:[0,1],up:[1,1]}
export default function Character({kind='player',facing='down',frame=0,battle=false,items=[],size=88}: {kind?:'player'|'fox'|'opponent';facing?:Facing;frame?:number;battle?:boolean;items?:string[];size?:number}){
  const pet=useContext(JourneyPetContext)
  if(kind==='fox' && pet && pet.species!=='fox')return <span className="journey-character journey-character--legacy" style={{width:size,aspectRatio:'1'}} aria-label={`${pet.species} · ${pet.level}`}><span style={{display:'block',width:144,height:144,transform:`scale(${size/144})`,transformOrigin:'top left'}}><PetAvatar pet={pet} size="lg" animate={false}/></span></span>
  const row=kind==='opponent' ? 0:battle ? 4:facingRows[facing]
  const cell=Math.max(0,Math.min(2,frame))
  // Transparent-row inspection defines real boundaries, rather than assuming
  // a generated atlas has equal row spacing. Feet remain on one logical anchor.
  const asset=kind==='player'?'player-sheet':kind==='fox'?'fox-sheet':'opponent-sheet'
  const source=atlasFrame(asset,row*3+cell)
  const pose:CSSProperties={backgroundImage:`url(${url(asset)})`,backgroundSize:`${source.width/source.w*100}% ${source.height/source.h*100}%`,backgroundPosition:`${source.x/(source.width-source.w)*100}% ${source.height===source.h ? 0:source.y/(source.height-source.h)*100}%`,height:`${source.h/source.w*100}%`,top:'auto',bottom:0}
  const gear=(id:string,asset:string,className:string)=>{
    if(!items.includes(id))return null
    const [x,y]=gearCells[facing]
    const source=atlasFrame(asset,y*2+x)
    const hatCenter=battle ? [54,50,47][cell]:facing==='down' ? [59,50,50][cell]:facing==='left' ? [55,52,47][cell]:facing==='right' ? [59,54,52][cell]:[59,47,47][cell]
    return <span key={id} className={`journey-wear ${className}`} style={{backgroundImage:`url(${url(asset)})`,backgroundSize:`${source.width/source.w*100}% ${source.height/source.h*100}%`,backgroundPosition:`${source.x/(source.width-source.w)*100}% ${source.y/(source.height-source.h)*100}%`,...(id==='gear-travel-hat' ? {left:`${hatCenter-23}%`}:{}),...(id==='gear-companion-scarf' && battle ? {left:`${[59,66,62][cell]}%`,top:`${[41,28,46][cell]}%`,width:'36%',height:'22%'}:{})}}/>
  }
  const packBehind=kind==='player' && (battle || facing==='left' || facing==='right')
  return <span aria-hidden="true" className={`journey-character journey-character--${kind}`} style={{width:size,aspectRatio:'1'}}>
    {packBehind && gear('gear-travel-pack','gear-pack',`journey-wear--pack journey-wear--${facing}`)}
    <span className="journey-character__body" style={pose}/>
    {kind==='player' && <>{!packBehind && gear('gear-travel-pack','gear-pack',`journey-wear--pack journey-wear--${facing}`)}{gear('gear-travel-hat','gear-hat','journey-wear--hat')}</>}
    {kind==='fox' && gear('gear-companion-scarf','gear-scarf',`journey-wear--scarf journey-wear--${facing}`)}
  </span>
}
