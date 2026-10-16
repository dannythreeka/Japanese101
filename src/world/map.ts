export type Facing = 'up'|'down'|'left'|'right'
export interface Point { x:number; y:number }
export interface Rectangle extends Point { w:number; h:number }
export interface Destination { id:string; kind:'home'|'dojo'|'shop'|'npc'; point:Point; actorPosition?:Point; footprint?:Rectangle; name:{zh:string;ja:string}; asset?:string; dialogue?:{zh:string;ja:string}[] }
interface Town { id:string; width:number; height:number; tileSize:number; spawn:Point; destinations:Destination[] }
export const WORLD_VERSION='town-v1'
export const town:Town={id:'travel-town',width:32,height:24,tileSize:40,spawn:{x:8,y:19},destinations:[
  {id:'home',kind:'home',point:{x:6,y:18},footprint:{x:3,y:14,w:6,h:4},name:{zh:'旅行者的家',ja:'たびびとのいえ'},asset:'home'},
  {id:'dojo',kind:'dojo',point:{x:10,y:8},footprint:{x:6,y:3,w:8,h:5},name:{zh:'初芽道館',ja:'はじめのどうじょう'},asset:'dojo'},
  {id:'shop',kind:'shop',point:{x:24,y:10},footprint:{x:21,y:5,w:7,h:5},name:{zh:'小路裝備店',ja:'こみちのおみせ'},asset:'shop'},
  {id:'gardener',kind:'npc',point:{x:16,y:12},actorPosition:{x:16,y:11},name:{zh:'花園裡的小晴',ja:'にわのハル'},asset:'npc-haru',dialogue:[{zh:'歡迎來到小鎮。我是小晴，正在照顧這片花園。',ja:'ようこそ。わたしはハルです。にわのせわをしています。'},{zh:'想認識大家，可以先到初芽道館。手帳裡也能找到路。',ja:'どうじょうで、じこしょうかいをれんしゅうできます。てちょうでもみちをしらべられます。'}]},
  {id:'traveler',kind:'npc',point:{x:24,y:16},actorPosition:{x:24,y:15},name:{zh:'旅行中的阿律',ja:'たびびとのリツ'},asset:'npc-ritsu',dialogue:[{zh:'我是阿律。夥伴正陪我旅行，你也帶著夥伴嗎？',ja:'わたしはリツです。なかまとたびをしています。'},{zh:'道館的金幣可以買裝備。也可以先在小鎮慢慢逛逛。',ja:'どうじょうのコインでどうぐをかえます。まちをさんぽしてもいいですよ。'}]},
] satisfies Destination[]}
const inside=(p:Point,r:Rectangle)=>p.x>=r.x && p.x<r.x+r.w && p.y>=r.y && p.y<r.y+r.h
export function walkable(p:Point): boolean {
  if(!p || typeof p!=='object')return false
  return Number.isInteger(p.x) && Number.isInteger(p.y) && p.x>=1 && p.y>=1 && p.x<town.width-1 && p.y<town.height-1 && !(p.x>=29 && (p.y<13 || p.y>15)) && !town.destinations.some(d=>d.footprint && inside(p,d.footprint) || d.actorPosition && p.x===d.actorPosition.x && p.y===d.actorPosition.y)
}
export function safePoint(input:Point): Point { return walkable(input) ? {...input}:{...town.spawn} }
export const near=(a:Point,b:Point)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=1
const key=(p:Point)=>`${p.x},${p.y}`
/** Bounded BFS; an unreachable click never teleports through an obstacle. */
export function findPath(start:Point,end:Point): Point[] | null {
  if (!walkable(start) || !walkable(end)) return null
  const queue:Point[]=[start];const parents=new Map<string,Point|null>([[key(start),null]])
  for (let head=0;head<queue.length;head++) {
    const current=queue[head]
    if (key(current)===key(end)) {
      const path:Point[]=[];let p:Point|null=current
      while(p && key(p)!==key(start)){path.unshift(p);p=parents.get(key(p)) ?? null}
      return path
    }
    for (const next of [{x:current.x+1,y:current.y},{x:current.x-1,y:current.y},{x:current.x,y:current.y+1},{x:current.x,y:current.y-1}]) if(walkable(next) && !parents.has(key(next))){parents.set(key(next),current);queue.push(next)}
  }
  return null
}
