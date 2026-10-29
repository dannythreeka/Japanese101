/** Generate actual audio for an authored draft; never infer human approval from synthesis. */
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {parseUnitPack} from '../src/content/contracts'
import {synthesize,wavInfo} from './audio-source'
const id=process.argv[2]
if(!/^U(?:0[2-9]|1[0-9]|2[0-4])$/.test(id ?? ''))throw new Error('Expected unit ID U02–U24')
const slug=id.toLowerCase(),dir=`public/assets/audio/${slug}`
const pack=parseUnitPack(JSON.parse(await readFile(`src/content/packs/${slug}.json`,'utf8')))
if(pack.reviewStatus!=='DRAFT')throw new Error('Synthesis requires an explicit new draft, not an approved pack')
const hash=(data:string|Buffer)=>createHash('sha256').update(data).digest('hex')
type Asset={id:string;src:string;script:string;scriptSha256:string;sha256:string;bytes:number;reviewStatus:'DRAFT';credit:string}&ReturnType<typeof wavInfo>
let previous:{assets:Asset[]}={assets:[]}
try{previous=JSON.parse(await readFile(`${dir}/manifest.json`,'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
const jobs=[...pack.listening.map(a=>({id:a.id,src:a.audioSrc,script:a.script})),...pack.teaching.filter(c=>c.audioSrc&&c.audioScript).map(c=>({id:c.id,src:c.audioSrc!,script:c.audioScript!}))]
const sources=new Map<string,typeof jobs[number]>()
for(const job of jobs){if(sources.has(job.src)&&sources.get(job.src)!.script!==job.script)throw new Error('Audio path reused with different script');sources.set(job.src,job)}
await mkdir(dir,{recursive:true})
const assets:Asset[]=[]
let generated=0
for(const job of sources.values()){
  if(!job.src.startsWith(`/assets/audio/${slug}/`) || job.src.includes('..'))throw new Error('Invalid audio path')
  let buffer:Buffer|undefined
  try{buffer=await readFile(`public${job.src}`)}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
  const old=previous.assets.find(a=>a.src===job.src)
  if(buffer && (!old || old.scriptSha256!==hash(job.script) || old.sha256!==hash(buffer)))throw new Error(`${job.id}: existing audio has no matching provenance; use a new versioned path`)
  if(!buffer){if(generated++)await new Promise(resolve=>setTimeout(resolve,3000));console.log(`Generating ${job.id}`);buffer=await synthesize(job.script);wavInfo(buffer);await writeFile(`public${job.src}`,buffer)}
  assets.push({...job,scriptSha256:hash(job.script),sha256:hash(buffer),bytes:buffer.length,reviewStatus:'DRAFT',credit:'VOICEVOX:四国めたん',...wavInfo(buffer)})
  await writeFile(`${dir}/manifest.json`,JSON.stringify({version:pack.version,reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,generator:'tts.quest v3 / VOICEVOX speaker 2',softwareTerms:'https://voicevox.hiroshiba.jp/term/',voiceTerms:'https://zunko.jp/con_ongen_kiyaku.html',assets},null,2)+'\n')
  console.log(`Draft ${job.id}: ${assets.at(-1)!.durationSeconds}s; human review NOT_RUN`)
}
