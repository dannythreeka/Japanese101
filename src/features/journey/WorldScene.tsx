import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/journey-ui'
import { findPath, near, safePoint, town, walkable, type Destination, type Facing, type Point } from '../../world/map'
import Character from './Character'
import { useJourneyText } from './text'
import './journey.css'

const directions:Record<Facing,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}
const keyDirections:Record<string,Facing>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}
export default function WorldScene({initialPosition,initialFacing,items,paused,onPersist,onEnter,onPause}: {initialPosition:Point;initialFacing:Facing;items:string[];paused:boolean;onPersist:(p:Point,f:Facing)=>Promise<void>;onEnter:(d:Destination,p:Point,f:Facing)=>void;onPause:()=>void}){
  const {lang,t}=useJourneyText()
  const [position,setPosition]=useState(()=>safePoint(initialPosition));const [companion,setCompanion]=useState(()=>safePoint(initialPosition));const [facing,setFacing]=useState(initialFacing)
  const [moving,setMoving]=useState(false);const [frame,setFrame]=useState(0);const [notice,setNotice]=useState('');const [control,setControl]=useState(false)
  const [view,setView]=useState({width:1024,height:640})
  const viewport=useRef<HTMLDivElement>(null);const current=useRef(position);const look=useRef(facing);const path=useRef<Point[]>([]);const held=useRef<Facing|null>(null)
  const callbacks=useRef({onPersist,onEnter,onPause,paused});useEffect(()=>{callbacks.current={onPersist,onEnter,onPause,paused}},[onPersist,onEnter,onPause,paused])
  const dirty=useRef(false)
  const stop=useCallback(()=>{path.current=[];held.current=null;setMoving(false);setFrame(0);if(dirty.current){dirty.current=false;void callbacks.current.onPersist({...current.current},look.current).catch(()=>{})}},[])
  useEffect(()=>{
    const element=viewport.current;if(!element)return
    const observer=new ResizeObserver(()=>{const box=element.getBoundingClientRect();setView({width:box.width,height:box.height})})
    observer.observe(element);return ()=>observer.disconnect()
  },[])
  useEffect(()=>{
    if(!moving)return
    let raf=0;let last=performance.now();let step=0
    const tick=(time:number)=>{
      if(callbacks.current.paused){stop();return}
      if(time-last>=150){
        last=time
        let next=path.current.shift()
        if(!next && held.current){const delta=directions[held.current];const candidate={x:current.current.x+delta.x,y:current.current.y+delta.y};if(walkable(candidate))next=candidate}
        if(!next){stop();return}
        const previous=current.current
        const direction:Facing=next.x>previous.x ? 'right':next.x<previous.x ? 'left':next.y>previous.y ? 'down':'up'
        setCompanion(previous);current.current=next;look.current=direction;dirty.current=true;setPosition(next);setFacing(direction);setFrame(++step%2+1)
      }
      raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(raf)
  },[moving,stop])
  useEffect(()=>{
    const blur=()=>stop()
    const visibility=()=>{if(document.hidden)stop()}
    const cancel=()=>stop()
    const release=()=>{if(held.current)stop()}
    const down=(event:KeyboardEvent)=>{
      if(callbacks.current.paused || !viewport.current || !(document.activeElement===document.body || viewport.current.parentElement?.contains(document.activeElement)))return
      if(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable="true"]'))return
      const direction=keyDirections[event.key]
      if(direction){event.preventDefault();held.current=direction;path.current=[];setMoving(true)}
      else if(event.key==='Escape'){event.preventDefault();stop();callbacks.current.onPause()}
      else if((event.key==='Enter' || event.key===' ') && !(event.target instanceof HTMLElement && event.target.closest('button,a'))){
        const destination=town.destinations.find(d=>near(current.current,d.point))
        if(destination){event.preventDefault();stop();callbacks.current.onEnter(destination,{...current.current},look.current)}
      }
    }
    const up=(event:KeyboardEvent)=>{if(keyDirections[event.key]===held.current)stop()}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);window.addEventListener('pointercancel',cancel);window.addEventListener('pointerup',release);document.addEventListener('visibilitychange',visibility)
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);window.removeEventListener('pointercancel',cancel);window.removeEventListener('pointerup',release);document.removeEventListener('visibilitychange',visibility);path.current=[];held.current=null;if(dirty.current){dirty.current=false;void callbacks.current.onPersist({...current.current},look.current).catch(()=>{})}}
  },[stop])
  useEffect(()=>{if(paused){path.current=[];held.current=null;if(dirty.current){dirty.current=false;void callbacks.current.onPersist({...current.current},look.current).catch(()=>{})}}},[paused])
  const x=Math.min(0,Math.max(view.width-town.width*town.tileSize,view.width/2-(position.x+.5)*town.tileSize))
  const y=Math.min(0,Math.max(view.height-town.height*town.tileSize,view.height/2-(position.y+.5)*town.tileSize))
  const nearby=town.destinations.find(d=>near(position,d.point))
  function pointAt(clientX:number,clientY:number){const box=viewport.current!.querySelector('.journey-world')!.getBoundingClientRect();return {x:Math.floor((clientX-box.left)/town.tileSize),y:Math.floor((clientY-box.top)/town.tileSize)}}
  return <section className="journey-world-wrap">
    <p className="journey-world-hint">{t('walkHint')}</p>
    <div ref={viewport} className="journey-world-viewport" tabIndex={0} role="region" aria-label={t('town')} onClick={event=>{
      if(paused)return
      viewport.current?.focus();const next=findPath(current.current,pointAt(event.clientX,event.clientY))
      if(!next){setNotice(t('unreachable'));return}
      setNotice('');held.current=null;path.current=next;setMoving(next.length>0)
    }}>
      <div className="journey-world" style={{width:town.width*town.tileSize,height:town.height*town.tileSize,transform:`translate3d(${x}px,${y}px,0)`}}>
        <img className="journey-ground" src={`${import.meta.env.BASE_URL}assets/img/journey/terrain.webp`} alt="" draggable={false}/>
        <div className="journey-river" aria-hidden="true"/><div className="journey-bridge" aria-hidden="true"/>
        {town.destinations.map(destination=>{
          const building=destination.footprint
          const actor=destination.actorPosition ?? destination.point
          return <div key={destination.id} className={`journey-map-object ${building?'is-building':'is-resident'}`} style={{left:building ? building.x*town.tileSize:(actor.x+.5)*town.tileSize,top:building ? (building.y+building.h)*town.tileSize:(actor.y+.5)*town.tileSize,width:building ? building.w*town.tileSize:88,height:building ? building.w*town.tileSize:88,zIndex:Math.floor((building ? building.y+building.h:actor.y)*10)}}>
            <img src={`${import.meta.env.BASE_URL}assets/img/journey/${destination.asset}.webp`} alt="" draggable={false}/>
            <span className="journey-place-label">{destination.name[lang]}</span>
          </div>
        })}
        <div className="journey-map-character" data-testid="world-player" data-x={position.x} data-y={position.y} style={{left:(position.x+.5)*town.tileSize,top:(position.y+.5)*town.tileSize,zIndex:position.y*10+5}}><Character facing={facing} frame={frame} items={items}/></div>
        <div className="journey-map-character" style={{left:(companion.x+.5)*town.tileSize-32,top:(companion.y+.5)*town.tileSize+8,zIndex:companion.y*10+4}}><Character kind="fox" facing={facing} frame={frame} items={items} size={68}/></div>
      </div>
    </div>
    <div className="journey-world-bar"><div className="journey-actions"><Button variant="secondary" aria-pressed={control} onClick={()=>{stop();setControl(!control)}}>{t('directionControl')}</Button><Button variant="quiet" onClick={()=>{stop();viewport.current?.focus()}}>{t('center')}</Button></div>
      {nearby && <Button disabled={paused} onClick={()=>{stop();onEnter(nearby,{...current.current},look.current)}}>{nearby.name[lang]} ›</Button>}
    </div>
    {control && <div className="journey-direction-pad" role="group" aria-label={t('directionControl')}>{(['up','left','down','right'] as Facing[]).map(direction=><Button key={direction} variant="secondary" aria-label={t(direction)} onPointerDown={event=>{event.preventDefault();if(paused)return;held.current=direction;path.current=[];setMoving(true)}} onClick={event=>{if(event.detail===0 && !paused){const delta=directions[direction];const target={x:current.current.x+delta.x,y:current.current.y+delta.y};if(walkable(target)){path.current=[target];held.current=null;setMoving(true)}}}}>{direction==='up'?'↑':direction==='left'?'←':direction==='down'?'↓':'→'}</Button>)}</div>}
    <p className="journey-world-notice" role="status">{notice}</p>
  </section>
}
