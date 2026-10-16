/** Draft content synthesis only. Does not grant human review or publish anything. */
import { readFile,writeFile,mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
const root=process.cwd()
const pack=JSON.parse(await readFile(path.join(root,'src/content/packs/u01.json'),'utf8')) as {version:string;listening:{id:string;script:string;audioSrc:string}[];teaching:{id:string;audioScript?:string;audioSrc?:string}[]}
const jobs=[...pack.listening.map(a=>({id:a.id,script:a.script,src:a.audioSrc})),...pack.teaching.filter(c=>c.audioScript && c.audioSrc).map(c=>({id:c.id,script:c.audioScript!,src:c.audioSrc!}))]
const sources=[...new Map(jobs.map(job=>[job.src,job])).values()]
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))
const hash=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex')
function trusted(url:string){const parsed=new URL(url);if(parsed.protocol!=='https:' || !/^audio\d*\.tts\.quest$/.test(parsed.hostname))throw new Error('Unexpected audio host');return parsed.href}
async function synthesize(script:string):Promise<Buffer>{
  for(let request=0;request<2;request++){
    const response=await fetch(`https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(script)}&speaker=2`,{signal:AbortSignal.timeout(15000)})
    if(!response.ok)throw new Error(`Synthesis HTTP ${response.status}`)
    const job=await response.json() as {success:boolean;retryAfter?:number;audioStatusUrl:string;wavDownloadUrl:string;speakerName?:string}
    if(!job.success){if(request===0 && job.retryAfter && job.retryAfter<=30){await delay(job.retryAfter*1000);continue}throw new Error('Synthesis unavailable or rate-limited')}
    if(job.speakerName && !job.speakerName.includes('四国めたん'))throw new Error('Unexpected voice identity')
    for(let poll=0;poll<20;poll++){
      await delay(2000)
      const status=await fetch(trusted(job.audioStatusUrl),{signal:AbortSignal.timeout(10000)})
      if(!status.ok)throw new Error(`Audio status HTTP ${status.status}`)
      const state=await status.json() as {isAudioReady:boolean;isAudioError:boolean}
      if(state.isAudioError)throw new Error('Voice engine rejected the text')
      if(state.isAudioReady){const file=await fetch(trusted(job.wavDownloadUrl),{signal:AbortSignal.timeout(20000)});if(!file.ok)throw new Error(`Audio download HTTP ${file.status}`);return Buffer.from(await file.arrayBuffer())}
    }
    throw new Error('Synthesis status timed out')
  }
  throw new Error('Synthesis unavailable')
}
function wavInfo(buffer:Buffer){
  if(buffer.toString('ascii',0,4)!=='RIFF' || buffer.toString('ascii',8,12)!=='WAVE')throw new Error('Not a WAV file')
  let rate=0,channels=0,bits=0,pcm:Buffer|undefined
  for(let offset=12;offset+8<=buffer.length;){const kind=buffer.toString('ascii',offset,offset+4);const length=buffer.readUInt32LE(offset+4);const start=offset+8;if(start+length>buffer.length)throw new Error('Truncated WAV');if(kind==='fmt '){if(buffer.readUInt16LE(start)!==1)throw new Error('Expected PCM');channels=buffer.readUInt16LE(start+2);rate=buffer.readUInt32LE(start+4);bits=buffer.readUInt16LE(start+14)}if(kind==='data')pcm=buffer.subarray(start,start+length);offset=start+length+(length%2)}
  if(!pcm || bits!==16 || !rate || !channels)throw new Error('Invalid PCM format')
  let peak=0,sum=0;for(let n=0;n+1<pcm.length;n+=2){const sample=pcm.readInt16LE(n)/32768;peak=Math.max(peak,Math.abs(sample));sum+=sample*sample}
  const duration=pcm.length/(rate*channels*2);const rms=Math.sqrt(sum/(pcm.length/2))
  if(duration<.3 || duration>90 || peak===0)throw new Error('Empty or implausible spoken audio')
  return {durationSeconds:Number(duration.toFixed(3)),sampleRate:rate,channels,bits,peak:Number(peak.toFixed(4)),rms:Number(rms.toFixed(4))}
}
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
