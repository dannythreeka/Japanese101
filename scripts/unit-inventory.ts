import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {parseUnitPack} from '../src/content/contracts'
import {curriculumErrors} from '../src/content/inventory'
import blueprint from '../docs/content/n5-manifest.json' with {type:'json'}
import {wavInfo} from './audio-source'
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const files=(await readdir('src/content/packs')).filter(f=>/^u\d{2}\.json$/.test(f)).sort()
const packs=await Promise.all(files.map(async f=>parseUnitPack(JSON.parse(await readFile(`src/content/packs/${f}`,'utf8')))))
const errors=curriculumErrors(packs,blueprint.units),release=process.argv.includes('--release')
for(const pack of packs){
  const dir=`docs/content/${pack.id}`,audioDir=`public/assets/audio/${pack.id.toLowerCase()}`
  type Row={id:string;kind:string;sha256:string;status:string;reviewer:string|null;reviewedAt:string|null;src?:string;script?:string}
  const rows:Row[]=[]
  for(const field of ['vocabulary','kanji','grammar','teaching','readings','listening','questions'] as const)for(const item of pack[field])rows.push({id:item.id,kind:field,sha256:hash(JSON.stringify(item)),status:'NOT_RUN',reviewer:null,reviewedAt:null})
  const audio=JSON.parse(await readFile(`${audioDir}/manifest.json`,'utf8')) as {version:string;reviewStatus:string;assets:{id:string;src:string;script:string;scriptSha256:string;sha256:string;bytes:number;reviewStatus:string}[]}
  if(audio.version!==pack.version)errors.push(`${pack.id}: audio version mismatch`)
  const required=new Map<string,string>()
  for(const a of pack.listening)required.set(a.audioSrc,a.script)
  for(const c of pack.teaching)if(c.audioSrc){if(c.audioScript)required.set(c.audioSrc,c.audioScript);else if(!required.has(c.audioSrc))errors.push(`${c.id}: missing teaching script`)}
  for(const q of pack.questions)if(q.audioSrc && !required.has(q.audioSrc))errors.push(`${q.id}: audio has no authored script`)
  for(const [src,script] of required){
    if(!src.startsWith(`/assets/audio/${pack.id.toLowerCase()}/`) || src.includes('..')){errors.push(`${pack.id}: invalid asset path`);continue}
    const a=audio.assets.find(a=>a.src===src)
    try{
      const data=await readFile(`public${src}`);wavInfo(data)
      if(!a || a.script!==script || a.scriptSha256!==hash(script) || a.sha256!==hash(data) || a.bytes!==data.length)errors.push(`${src}: missing/stale audio provenance`)
      rows.push({id:`audio:${src}`,kind:'audio',src,script,sha256:hash(data),status:'NOT_RUN',reviewer:null,reviewedAt:null})
    }catch(e){errors.push(`${src}: ${String(e)}`)}
  }
  const images=[...new Set(pack.questions.flatMap(q=>q.image?[q.image.src]:[]))]
  for(const src of images){
    if(!src.startsWith('/assets/img/') || src.includes('..')){errors.push(`${pack.id}: invalid image path`);continue}
    try{const data=await readFile(`public${src}`);const manifest=JSON.parse(await readFile(`public${src.slice(0,src.lastIndexOf('/'))}/manifest.json`,'utf8'));const asset=manifest.assets.find((a:{src:string})=>a.src===src);if(!asset || asset.sha256!==hash(data) || asset.bytes!==data.length)errors.push(`${src}: stale image provenance`);rows.push({id:`image:${src}`,kind:'image',src,sha256:hash(data),status:'NOT_RUN',reviewer:null,reviewedAt:null})}catch(e){errors.push(`${src}: ${String(e)}`)}
  }
  // Preserve the established U01 human ledger format; new units get the generalized hash ledger.
  if(pack.id!=='U01'){
    const file=`${dir}/review-ledger.json`
    let previous:{items?:Row[]}={}
    try{previous=JSON.parse(await readFile(file,'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
    const items=rows.map(row=>{const old=previous.items?.find(i=>i.id===row.id&&i.sha256===row.sha256);return old?{...old,...row,status:old.status,reviewer:old.reviewer,reviewedAt:old.reviewedAt}:row})
    const skills=pack.grammar.map(g=>({id:g.id,prerequisites:g.prerequisites,teaching:pack.teaching.filter(c=>c.grammarIds?.includes(g.id)).map(c=>c.id),practice:pack.questions.filter(q=>q.partition==='practice'&&q.primarySkillId===g.id).map(q=>q.id),checkFamilies:[...new Set(pack.questions.filter(q=>q.partition==='check'&&q.primarySkillId===g.id).map(q=>q.itemFamilyId))],delayedRule:'At least 48h after teaching, two calendar dates, at least 4/5 distinct-family first answers correct without hints; content family adequacy awaits human review'}))
    if(process.argv.includes('--write')){await mkdir(dir,{recursive:true});await writeFile(file,JSON.stringify({unitId:pack.id,version:pack.version,reviewStatus:'DRAFT',items},null,2)+'\n');await writeFile(`${dir}/coverage.json`,JSON.stringify({unitId:pack.id,version:pack.version,mode:'isolated draft structure',skills,audio:required.size,images:images.length,reviewItems:items.length},null,2)+'\n')}
    if(release&&items.some(i=>i.status!=='APPROVED'||!i.reviewer||!i.reviewedAt))errors.push(`${pack.id}: missing or stale human review`)
  }
  if(release&&(pack.reviewStatus!=='APPROVED'||audio.reviewStatus!=='APPROVED'||audio.assets.some(a=>a.reviewStatus!=='APPROVED')))errors.push(`${pack.id}: release requires content and audio approval`)
}
const missing=blueprint.units.filter(u=>!packs.some(p=>p.id===u.id)).map(u=>u.id)
if(release&&missing.length)errors.push(`Full curriculum incomplete: ${missing.join(', ')}`)
console.log(JSON.stringify({mode:release?'release':'draft inventory',actualUnits:packs.map(p=>p.id),missingUnits:missing,vocabulary:packs.reduce((n,p)=>n+p.vocabulary.length,0),practice:packs.reduce((n,p)=>n+p.questions.filter(q=>q.partition==='practice').length,0),errors},null,2))
if(errors.length)process.exitCode=1
