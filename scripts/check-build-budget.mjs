/** A real build budget, not a relaxed bundler warning threshold. */
import {readdir,readFile,writeFile} from 'node:fs/promises'
import {gzipSync} from 'node:zlib'
const files=(await readdir('dist/assets')).filter(f=>f.endsWith('.js'))
const assets=await Promise.all(files.map(async file=>{const data=await readFile(`dist/assets/${file}`);return {file,bytes:data.length,gzipBytes:gzipSync(data).length}}))
assets.sort((a,b)=>b.bytes-a.bytes)
const limit=500000,over=assets.filter(a=>a.bytes>limit)
await writeFile('dist/build-budget.json',JSON.stringify({scope:'individual minified JavaScript chunks; not total offline media',limitBytes:limit,assets},null,2)+'\n')
if(over.length)throw new Error(`JavaScript chunk budget exceeded: ${over.map(a=>`${a.file} ${a.bytes}/${limit}`).join(', ')}`)
console.log(`Build budget PASS: largest JavaScript ${assets[0]?.file} ${assets[0]?.bytes}/${limit} bytes`)
