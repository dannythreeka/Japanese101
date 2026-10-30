type UpdateState='idle'|'checking'|'ready'|'current'|'error'|'unsupported'
let state:UpdateState='idle',registration:ServiceWorkerRegistration|undefined,started=false
const listeners=new Set<()=>void>()
const publish=(next:UpdateState)=>{state=next;for(const listener of listeners)listener()}
export const updateSnapshot=()=>state
export function subscribeUpdates(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
/** Installation time scales with the verified offline pack. Wait for its lifecycle, not an arbitrary wall-clock deadline. */
export async function offlineAppReady(signal:AbortSignal):Promise<void>{
  signal.throwIfAborted()
  if(!('serviceWorker' in navigator))throw new Error('No offline app support')
  registerAppUpdates()
  await new Promise<void>((resolve,reject)=>{
    let finished=false
    let unsubscribe=()=>{}
    const clean=()=>{finished=true;unsubscribe();signal.removeEventListener('abort',aborted)}
    const fail=(error:unknown)=>{if(finished)return;clean();reject(error)}
    const succeed=()=>{if(finished)return;clean();resolve()}
    const aborted=()=>fail(signal.reason)
    const changed=()=>{if(state==='error'&&!registration?.active&&!navigator.serviceWorker.controller)fail(new Error('Offline app installation failed'))}
    unsubscribe=subscribeUpdates(changed)
    signal.addEventListener('abort',aborted,{once:true})
    navigator.serviceWorker.ready.then(succeed,fail)
    queueMicrotask(changed)
  })
}
/** Never skip waiting or reload clients. Activation follows the browser lifecycle after ALL old clients close. */
export function registerAppUpdates(){
  if(started||!import.meta.env.PROD)return
  started=true
  if(!('serviceWorker' in navigator)){publish('unsupported');return}
  const start=async()=>{
    try{
      publish('checking')
      registration=await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'})
      const observe=()=>{
        if(registration?.waiting)publish('ready')
        const installing=registration?.installing
        installing?.addEventListener('statechange',()=>{
          if(installing.state==='installed')publish(registration?.waiting?'ready':'current')
          if(installing.state==='redundant'){if(!registration?.active)started=false;publish('error')}
        })
      }
      registration.addEventListener('updatefound',observe);observe()
      if(!registration.waiting&&!registration.installing)publish('current')
    }catch{started=false;publish('error')}
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
