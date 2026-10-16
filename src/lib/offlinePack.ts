export interface PackManifest {version: string; assets: {path: string; bytes: number; sha256: string}[]}
const base=import.meta.env.BASE_URL
const cacheName=(m: PackManifest)=>`japanese101-pack-${m.version}`
export async function packManifest(): Promise<PackManifest> {
  const response=await fetch(`${base}offline-manifest.json`)
  if(!response.ok)throw new Error('教材清單下載失敗')
  const data=await response.json() as PackManifest
  if(!data.version||!Array.isArray(data.assets)||!data.assets.length)throw new Error('教材清單不完整')
  return data
}
export async function packReady(manifest: PackManifest): Promise<boolean> {
  const cache=await caches.open(cacheName(manifest))
  for(const asset of manifest.assets)if(!await cache.match(`${base}${asset.path}`))return false
  return true
}
/** Only a complete, byte/hash-verified pack is advertised; partial data is retained for retry. */
export async function downloadPack(manifest: PackManifest, signal: AbortSignal, progress: (count: number)=>void): Promise<void> {
  const cache=await caches.open(cacheName(manifest))
  for(let i=0;i<manifest.assets.length;i++) {
    signal.throwIfAborted()
    const asset=manifest.assets[i],url=`${base}${asset.path}`
    if(!await cache.match(url)) {
      const response=await fetch(url,{signal})
      if(!response.ok)throw new Error(`教材下載失敗 (${response.status})`)
      const buffer=await response.clone().arrayBuffer()
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(b=>b.toString(16).padStart(2,'0')).join('')
      if(buffer.byteLength!==asset.bytes||hash!==asset.sha256)throw new Error('教材驗證失敗，請重試')
      await cache.put(url,response)
    }
    progress(i+1)
  }
  if(!await packReady(manifest))throw new Error('教材仍未完整下載')
}
