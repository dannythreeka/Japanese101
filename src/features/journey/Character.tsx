import { useContext, type CSSProperties } from 'react'
import type { Facing } from '../../world/map'
import PetAvatar from '../../components/PetAvatar'
import {JourneyPetContext} from './pet-context'
const url=(id:string)=>`${import.meta.env.BASE_URL}assets/img/journey/${id}.webp`
const facingRows:Record<Facing,number>={down:0,left:1,right:2,up:3}
const gearCells:Record<Facing,[number,number]>={down:[0,0],left:[1,0],right:[0,1],up:[1,1]}
export default function Character({kind='player',facing='down',frame=0,battle=false,items=[],size=88}: {kind?:'player'|'fox'|'opponent';facing?:Facing;frame?:number;battle?:boolean;items?:string[];size?:number}){
  const pet=useContext(JourneyPetContext)
  if(kind==='fox' && pet && pet.species!=='fox')return <span className="journey-character journey-character--legacy" style={{width:size,aspectRatio:'1'}} aria-label={`${pet.species} · ${pet.level}`}><span style={{display:'block',width:144,height:144,transform:`scale(${size/144})`,transformOrigin:'top left'}}><PetAvatar pet={pet} size="lg" animate={false}/></span></span>
  const row=kind==='opponent' ? 0:battle ? 4:facingRows[facing]
  const rows=kind==='opponent' ? 1:5
  const cell=Math.max(0,Math.min(2,frame))
  const pose:CSSProperties={backgroundImage:`url(${url(kind==='player'?'player-sheet':kind==='fox'?'fox-sheet':'opponent-sheet')})`,backgroundSize:`300% ${rows*100}%`,backgroundPosition:`${cell*50}% ${rows===1 ? 0:row/(rows-1)*100}%`}
  // Generated atlases have uneven padding. Explicit source windows avoid
  // clipping the fox's battle ears or showing a neighbouring guardian frame.
  if(kind==='fox' && battle){const w=323,h=379,x=cell*324,y=1240;pose.backgroundSize=`${971/w*100}% ${1619/h*100}%`;pose.backgroundPosition=`${x/(971-w)*100}% ${y/(1619-h)*100}%`}
  if(kind==='opponent'){const w=690,h=724,x=[0,715,1475][cell];pose.backgroundSize=`${2172/w*100}% ${724/h*100}%`;pose.backgroundPosition=`${x/(2172-w)*100}% 0%`}
  const gear=(id:string,asset:string,className:string)=>{
    const [x,y]=gearCells[facing]
    const hatCenter=battle ? [54,50,47][cell]:facing==='down' ? [59,50,50][cell]:facing==='left' ? [55,52,47][cell]:facing==='right' ? [59,54,52][cell]:[59,47,47][cell]
    return items.includes(id) ? <span key={id} className={`journey-wear ${className}`} style={{backgroundImage:`url(${url(asset)})`,backgroundSize:'200% 200%',backgroundPosition:`${x*100}% ${y*100}%`,...(id==='gear-travel-hat' ? {left:`${hatCenter-23}%`}:{})}}/>:null
  }
  return <span aria-hidden="true" className={`journey-character journey-character--${kind}`} style={{width:size,aspectRatio:'1'}}>
    <span className="journey-character__body" style={pose}/>
    {kind==='player' && <>{gear('gear-travel-pack','gear-pack',`journey-wear--pack journey-wear--${facing}`)}{gear('gear-travel-hat','gear-hat','journey-wear--hat')}</>}
    {kind==='fox' && gear('gear-companion-scarf','gear-scarf',`journey-wear--scarf journey-wear--${facing}`)}
  </span>
}
