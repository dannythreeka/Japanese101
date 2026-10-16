import { useEffect, useRef, useState } from 'react'
import { downloadPack, packManifest, packReady, type PackManifest } from '../lib/offlinePack'
import { useT } from '../hooks/useT'
export default function OfflinePack() {
  const t=useT(), [manifest,setManifest]=useState<PackManifest|null>(null)
  const [status,setStatus]=useState<'checking'|'missing'|'downloading'|'ready'|'error'>('checking')
  const [count,setCount]=useState(0), [revision,setRevision]=useState(0)
  const abort=useRef<AbortController|null>(null)
  useEffect(()=>{
    let active=true
    void packManifest().then(async m=>{const ready=await packReady(m);if(active){setManifest(m);setStatus(ready?'ready':'missing')}}).catch(()=>{if(active)setStatus('error')})
    return()=>{active=false;abort.current?.abort()}
  },[revision])
  async function download() {
    if(!manifest){setRevision(r=>r+1);return}
    const controller=new AbortController();abort.current?.abort();abort.current=controller
    setStatus('downloading')
    try {
      if(!('serviceWorker' in navigator))throw new Error('No offline app support')
      let timeout: ReturnType<typeof setTimeout>|undefined
      try {await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Offline app not ready')),8000)})])}finally{clearTimeout(timeout)}
      await downloadPack(manifest,controller.signal,setCount)
      if(!controller.signal.aborted)setStatus('ready')
    }catch{if(!controller.signal.aborted)setStatus('error')}
  }
  return <div className="w-full max-w-sm rounded-2xl bg-white/80 p-4" role="status"><p>{t(status==='ready'?'packReady':status==='error'?'packError':status==='checking'?'loading':'packMissing')}</p>{status==='downloading'?<p>{count}/{manifest?.assets.length}</p>:status!=='ready'&&status!=='checking'&&<button className="min-h-16 px-6" onClick={()=>{void download()}}>{t(status==='error'?'retry':'packDownload')}</button>}</div>
}
