import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hiraganaPack,katakanaPack} from '../src/content/packs/kana'
import rawKana from '../src/data/kana.json' with {type:'json'}
import words from '../src/data/vocabulary.json' with {type:'json'}
import placementAudio from '../public/assets/audio/kana-placement/manifest.json' with {type:'json'}
import {validateQuestionBank} from '../src/content/contracts'
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const rows:{id:string;kind:string;sha256:string;status:string;reviewer:string|null;reviewedAt:string|null;src?:string;script?:string}[]=[]
const sources=new Set<string>()
for(const pack of [hiraganaPack,katakanaPack]){
  const errors=validateQuestionBank(pack.questions);if(errors.length)throw new Error(errors.join('\n'))
  for(const card of pack.teaching){rows.push({id:card.id,kind:'teaching',sha256:hash(JSON.stringify(card)),status:'NOT_RUN',reviewer:null,reviewedAt:null});if(card.audioSrc)sources.add(card.audioSrc)}
  for(const q of pack.questions){rows.push({id:q.id,kind:q.partition,sha256:hash(JSON.stringify(q)),status:'NOT_RUN',reviewer:null,reviewedAt:null});if(q.audioSrc)sources.add(q.audioSrc)}
}
for(const src of [...sources].sort()){
  if(!src.startsWith('/assets/audio/') || src.includes('..'))throw new Error(`Invalid audio path: ${src}`)
  const data=await readFile(`public${src}`)
  if(data.toString('ascii',0,4)!=='RIFF' || data.toString('ascii',8,12)!=='WAVE' || data.length<=44)throw new Error(`Invalid WAV container: ${src}`)
  const script=placementAudio.assets.find(a=>a.src===src)?.script ?? words.words.find(w=>w.audio.src===src)?.kana ?? rawKana.kana.find(k=>`/assets/audio/kana_${k.id}.wav`===src)?.hiragana
  if(!script)throw new Error(`Missing audio script: ${src}`)
  rows.push({id:`audio:${src}`,kind:'audio',src,script,sha256:hash(data),status:'NOT_RUN',reviewer:null,reviewedAt:null})
}
const file='docs/content/kana/review-ledger.json'
let previous:{items?:typeof rows}={}
try{previous=JSON.parse(await readFile(file,'utf8'))}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
const items=rows.map(row=>{const old=previous.items?.find(i=>i.id===row.id && i.sha256===row.sha256);return old?{...old,...row,status:old.status,reviewer:old.reviewer,reviewedAt:old.reviewedAt}:row})
const result={version:'kana-2-draft',reviewStatus:'DRAFT',counts:{teaching:92,practice:92,check:92,audio:sources.size},items}
if(process.argv.includes('--write')){await mkdir('docs/content/kana',{recursive:true});await writeFile(file,JSON.stringify(result,null,2)+'\n')}
console.log(JSON.stringify({version:result.version,counts:result.counts,items:items.length,notRun:items.filter(i=>i.status==='NOT_RUN').length}))

if(process.argv.includes('--release') && ([hiraganaPack,katakanaPack].some(p=>p.reviewStatus!=='APPROVED') || items.some(i=>i.status!=='APPROVED' || !i.reviewer || !i.reviewedAt)))throw new Error('Kana release blocked: human review missing or stale')
