/** Draft content synthesis only. Does not grant human review or publish anything. */
import { readFile,writeFile,mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import {synthesize,wavInfo} from './audio-source'
const root=process.cwd()
const pack=JSON.parse(await readFile(path.join(root,'src/content/packs/u01.json'),'utf8')) as {version:string;listening:{id:string;script:string;audioSrc:string}[];teaching:{id:string;audioScript?:string;audioSrc?:string}[]}
const jobs=[...pack.listening.map(a=>({id:a.id,script:a.script,src:a.audioSrc})),...pack.teaching.filter(c=>c.audioScript && c.audioSrc).map(c=>({id:c.id,script:c.audioScript!,src:c.audioSrc!}))]
const sources=[...new Map(jobs.map(job=>[job.src,job])).values()]
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))
const hash=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex')
await mkdir(path.join(root,'public/assets/audio/u01'),{recursive:true})
const manifest:{id:string;src:string;script:string;scriptSha256:string;sha256:string;bytes:number;reviewStatus:string;credit:string;durationSeconds:number;sampleRate:number;channels:number;bits:number;peak:number;rms:number}[]=[]
for(const job of sources){
  if(!job.src.startsWith('/assets/audio/u01/') || job.src.includes('..'))throw new Error('Invalid unit audio path')
  const destination=path.join(root,'public',job.src)
  let buffer:Buffer
  try{buffer=await readFile(destination)}catch{console.log(`Generating ${job.id}`);buffer=await synthesize(job.script);wavInfo(buffer);await writeFile(destination,buffer);await delay(2000)}
  manifest.push({id:job.id,src:job.src,script:job.script,scriptSha256:hash(job.script),sha256:hash(buffer),bytes:buffer.length,reviewStatus:'DRAFT',credit:'VOICEVOX:四国めたん',...wavInfo(buffer)})
  console.log(`Draft WAV ready: ${job.id}; ${manifest.at(-1)!.durationSeconds}s`)
  await writeFile(path.join(root,'public/assets/audio/u01/manifest.json'),JSON.stringify({version:pack.version,reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,generator:'tts.quest v3 / VOICEVOX speaker 2',softwareTerms:'https://voicevox.hiroshiba.jp/term/',voiceTerms:'https://zunko.jp/con_ongen_kiyaku.html',assets:manifest},null,2)+'\n')
}
console.log(`U01 draft audio generated: ${manifest.length}; human listening review NOT_RUN`)
