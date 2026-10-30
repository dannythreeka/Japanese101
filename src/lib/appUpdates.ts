type UpdateState='idle'|'checking'|'ready'|'current'|'error'|'unsupported'
let state:UpdateState='idle',registration:ServiceWorkerRegistration|undefined,started=false
const listeners=new Set<()=>void>()
const publish=(next:UpdateState)=>{state=next;for(const listener of listeners)listener()}
export const updateSnapshot=()=>state
export function subscribeUpdates(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
/** Never skip waiting or reload clients. Activation follows the browser lifecycle after ALL old clients close. */
export function registerAppUpdates(){
  if(started||!import.meta.env.PROD)return
  started=true
  if(!('serviceWorker' in navigator)){publish('unsupported');return}
  const start=async()=>{
    try{
      registration=await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'})
      const observe=()=>{
        if(registration?.waiting)publish('ready')
        const installing=registration?.installing
        installing?.addEventListener('statechange',()=>{
          if(installing.state==='installed')publish(registration?.waiting?'ready':'current')
          if(installing.state==='redundant')publish('error')
        })
      }
      registration.addEventListener('updatefound',observe);observe()
      if(!registration.waiting&&!registration.installing)publish('current')
    }catch{publish('error')}
  }
  if(document.readyState==='complete')void start()
  else window.addEventListener('load',()=>{void start()},{once:true})
}
export async function checkAppUpdate(){
  if(!registration){publish('error');return}
  if(registration.waiting){publish('ready');return}
  publish('checking')
  try{await registration.update();if(registration.waiting)publish('ready');else if(!registration.installing)publish('current')}
  catch{publish('error')}
}
