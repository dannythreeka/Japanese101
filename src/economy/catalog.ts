export const CATALOG_VERSION = 'economy-v0.1'
export type EquipmentSlot = 'head' | 'back' | 'neck'
export interface CatalogItem { id:string; slot:EquipmentSlot; target:'player'|'fox'; price:number; armor:number; name:{zh:string;ja:string}; description:{zh:string;ja:string} }
export const catalog: readonly CatalogItem[] = [
  {id:'gear-travel-hat',slot:'head',target:'player',price:40,armor:1,name:{zh:'旅行帽',ja:'たびのぼうし'},description:{zh:'一起遮陽探路，受到的傷害減少 1。',ja:'ひざしをよけて、うけるダメージを1へらす。'}},
  {id:'gear-companion-scarf',slot:'neck',target:'fox',price:60,armor:1,name:{zh:'夥伴圍巾',ja:'なかまのスカーフ'},description:{zh:'給夥伴的旅行禮物，受到的傷害減少 1。',ja:'なかまへのおくりもの。うけるダメージを1へらす。'}},
  {id:'gear-travel-pack',slot:'back',target:'player',price:80,armor:1,name:{zh:'旅行背包',ja:'たびのリュック'},description:{zh:'帶著回憶出發，受到的傷害減少 1。',ja:'おもいでをつめて。うけるダメージを1へらす。'}},
]
export function catalogItem(id:string): CatalogItem {
  const item=catalog.find(item=>item.id===id)
  if (!item) throw new Error('Unknown item')
  return item
}
export function armorFor(items: readonly string[]): number {
  return Math.min(2,[...new Set(items)].reduce((sum,id)=>sum+catalogItem(id).armor,0))
}
