/** Four decorative dialogue clips; never count as U01's six listening materials. */
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {town,WORLD_VERSION} from '../src/world/map'
import {synthesize,wavInfo} from './audio-source'
const hash=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex')
const assets=[]
await mkdir('public/assets/audio/world',{recursive:true})
for(const destination of town.destinations)for(const [index,line] of (destination.dialogue ?? []).entries()){
  if(!line.audioSrc)throw new Error(`Missing dialogue audio path: ${destination.id}`)
  const id=`${destination.id}-${index+1}`,src=line.audioSrc,file=`public${src}`
  let bytes:Buffer
  try{bytes=await readFile(file)}catch{console.log(`Generating ${id}`);bytes=await synthesize(line.ja);wavInfo(bytes);await writeFile(file,bytes)}
  assets.push({id,src,script:line.ja,scriptSha256:hash(line.ja),sha256:hash(bytes),bytes:bytes.length,reviewStatus:'DRAFT',credit:'VOICEVOX:四国めたん',...wavInfo(bytes)})
  await writeFile('public/assets/audio/world/manifest.json',JSON.stringify({version:'world-voice-v1',worldVersion:WORLD_VERSION,reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,generator:'tts.quest v3 / VOICEVOX speaker 2',assets},null,2)+'\n')
  console.log(`Draft world WAV ready: ${id}`)
}
