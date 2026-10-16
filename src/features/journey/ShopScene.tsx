import { useState } from 'react'
import { Button, StatePanel } from '../../components/ui/journey-ui'
import { catalog, catalogItem, type EquipmentSlot } from '../../economy/catalog'
import type { Facing } from '../../world/map'
import type { InventoryItem } from '../../db/journey-models'
import Character from './Character'
import { useJourneyText } from './text'
const assets:Record<string,string>={'gear-travel-hat':'gear-hat','gear-travel-pack':'gear-pack','gear-companion-scarf':'gear-scarf'}
export default function ShopScene({coins,inventory,equipment,pending,locked,bag=false,onBuy,onEquip,onBack}: {coins:number;inventory:InventoryItem[];equipment:Partial<Record<EquipmentSlot,string>>;pending:boolean;locked:boolean;bag?:boolean;onBuy:(id:string)=>void;onEquip:(id:string,enabled:boolean)=>void;onBack:()=>void}){
  const {lang,t}=useJourneyText();const [tryOn,setTryOn]=useState<string|null>(null);const [facing,setFacing]=useState<Facing>('down')
  const preview=Object.values(equipment).filter(id=>!tryOn || catalogItem(id).slot!==catalogItem(tryOn).slot)
  if(tryOn)preview.push(tryOn)
  const products=bag ? catalog.filter(item=>inventory.some(i=>i.itemId===item.id)):catalog
  return <>
    <div className="journey-content-header"><div><h1>{bag ? t('backpack'):t('shop')}</h1><p>{t('coins')} {coins}</p></div><Button variant="secondary" onClick={onBack}>{t('returnTown')}</Button></div>
    {locked && <p className="journey-card">{t('equipmentLocked')}</p>}
    <div className="journey-shop-layout"><div className="journey-stack">
      {!products.length && <StatePanel state="empty" title={t('emptyBag')}/>}
      {products.map(item=>{
        const owned=inventory.some(i=>i.itemId===item.id);const equipped=equipment[item.slot]===item.id
        return <article className="journey-card journey-stack" key={item.id}><div className="journey-item-heading"><span className="journey-gear-thumbnail" aria-hidden="true" style={{backgroundImage:`url(${import.meta.env.BASE_URL}assets/img/journey/${assets[item.id]}.webp)`}}/><div><h2>{item.name[lang]}</h2><p>{item.price} {t('coins')}</p></div></div><p>{item.description[lang]}</p>
          <div className="journey-actions"><Button variant="secondary" onClick={()=>setTryOn(item.id)} aria-pressed={tryOn===item.id}>{t('tryOn')}</Button>
            {owned ? <Button disabled={pending || locked} onClick={()=>onEquip(item.id,!equipped)}>{equipped ? t('unequip'):t('equip')}</Button>:<Button disabled={pending || locked || coins<item.price} onClick={()=>onBuy(item.id)}>{t('buy')}</Button>}
          </div>{owned && <p className="journey-muted">{equipped ? t('equipped'):t('owned')}</p>}{!owned && coins<item.price && <p className="journey-muted">{t('notEnough')}</p>}
        </article>
      })}
    </div><div className="journey-shop-preview"><h2>{t('tryOn')}</h2><div className="journey-shop-figures"><Character facing={facing} items={preview} size={260}/><Character kind="fox" facing={facing} items={preview} size={150}/></div><div className="journey-actions">{(['down','left','right','up'] as Facing[]).map(face=><Button key={face} variant="quiet" aria-label={t(face)} aria-pressed={face===facing} onClick={()=>setFacing(face)}>{face==='down'?'↓':face==='up'?'↑':face==='left'?'←':'→'}</Button>)}</div><Button variant="quiet" onClick={()=>setTryOn(null)}>{t('back')}</Button></div></div>
  </>
}
