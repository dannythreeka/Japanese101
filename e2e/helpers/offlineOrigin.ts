import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'
import type { AddressInfo } from 'node:net'

const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.wav':'audio/wav','.mp3':'audio/mpeg'}
/** Test-owned origin: shutting it down proves cached navigation works without touching the shared preview. */
export async function offlineOrigin(){
  const root=resolve('dist')
  async function serve(request:IncomingMessage,response:ServerResponse){
    const url=new URL(request.url??'/','http://localhost')
    const path=resolve(root,`.${url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)}`)
    if(!path.startsWith(root+sep)){response.writeHead(403).end();return}
    let buffer:Buffer
    try{buffer=await readFile(path)}catch{response.writeHead(404).end();return}
    const headers={'Content-Type':types[extname(path)]??'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'}
    const range=request.headers.range?.match(/^bytes=(\d+)-(\d*)$/)
    if(range){
      const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),buffer.length-1):buffer.length-1
      if(start>end||start>=buffer.length){response.writeHead(416).end();return}
      response.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${buffer.length}`,'Content-Length':end-start+1}).end(buffer.subarray(start,end+1));return
    }
    response.writeHead(200,{...headers,'Content-Length':buffer.length}).end(buffer)
  }
  const server=createServer((request,response)=>{void serve(request,response).catch(()=>{response.writeHead(500).end()})})
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve())})
  const origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return {origin,get listening(){return server.listening},stop:async()=>{
    if(!server.listening)return
    await new Promise<void>((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeAllConnections()})
  }}
}
