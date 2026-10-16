import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
function entries(dir, prefix='') {
  return readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
    const path=`${prefix}${entry.name}`
    if(entry.isDirectory())return entries(`${dir}/${entry.name}`,`${path}/`)
    if(!/\.(wav|svg|mp3|webp)$/.test(path) && !['assets/img/journey/manifest.json','assets/audio/u01/manifest.json','assets/audio/world/manifest.json'].includes(path))return []
    const buffer=readFileSync(`${dir}/${entry.name}`)
    return [{path,bytes:buffer.byteLength,sha256:createHash('sha256').update(buffer).digest('hex')}]
  })
}
const assets=entries('public')
const version=createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,16)
writeFileSync('public/offline-manifest.json',JSON.stringify({version,assets},null,2)+'\n')
console.log(`Offline manifest ${version}: ${assets.length} assets`)
