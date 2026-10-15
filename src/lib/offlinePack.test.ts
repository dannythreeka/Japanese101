import { afterEach, beforeEach, it, expect, vi } from 'vitest'
import { downloadPack, packReady, type PackManifest } from './offlinePack'
const bytes=new TextEncoder().encode('audio'), hash=''
let saved: Map<string,Response>,put: ReturnType<typeof vi.fn>,manifest: PackManifest
beforeEach(async()=>{
  saved=new Map();put=vi.fn(async(key:string,response:Response)=>{saved.set(key,response)})
  vi.stubGlobal('caches',{open:async()=>({match:async(key:string)=>saved.get(key),put})})
  const digest=vi.fn(async()=>new Uint8Array([1,2]).buffer)
  vi.stubGlobal('crypto',{subtle:{digest}})
  const sha256='0102'
  manifest={version:'test',assets:[{path:'a.wav',bytes:bytes.length,sha256},{path:'b.svg',bytes:bytes.length,sha256}]}
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(bytes)))
})
afterEach(()=>vi.unstubAllGlobals())
it('only advertises a fully verified pack and retry fills missing files',async()=>{
  expect(await packReady(manifest)).toBe(false)
  await downloadPack(manifest,new AbortController().signal,()=>{})
  expect(await packReady(manifest)).toBe(true);expect(put).toHaveBeenCalledTimes(2)
  await downloadPack(manifest,new AbortController().signal,()=>{});expect(put).toHaveBeenCalledTimes(2)
})
it.each(['404','quota','corrupt'])('retains incomplete state on %s and recovers',async kind=>{
  if(kind==='404')vi.stubGlobal('fetch',vi.fn(async()=>new Response('missing',{status:404})))
  if(kind==='quota')put.mockRejectedValueOnce(new DOMException('full','QuotaExceededError'))
  if(kind==='corrupt')manifest.assets[0].sha256=hash
  await expect(downloadPack(manifest,new AbortController().signal,()=>{})).rejects.toThrow()
  expect(await packReady(manifest)).toBe(false)
})
