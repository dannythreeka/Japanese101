import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {parseUnitPack} from '../src/content/contracts'
import {curriculumErrors,grammarPrerequisiteErrors} from '../src/content/inventory'
import {curriculumCoverage} from '../src/content/coverage'
import {auditReviews,type ReviewRecord,type ReviewTarget} from '../src/content/review-audit'
import blueprint from '../docs/content/n5-manifest.json' with {type:'json'}
import {wavInfo} from './audio-source'
const canonical=(value:unknown):unknown=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([key,v])=>[key,canonical(v)])):value
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const files=(await readdir('src/content/packs')).filter(f=>/^u\d{2}\.json$/.test(f)).sort()
const packs=await Promise.all(files.map(async f=>parseUnitPack(JSON.parse(await readFile(`src/content/packs/${f}`,'utf8')))))
const errors=curriculumErrors(packs,blueprint.units),release=process.argv.includes('--release')
errors.push(...grammarPrerequisiteErrors(packs,blueprint.skills))
const coverage=curriculumCoverage(packs,blueprint.skills)
errors.push(...coverage.errors)
const reviewAudit:{unitId:string;items:ReturnType<typeof auditReviews>}[]=[]
for(const pack of packs){
  const dir=`docs/content/${pack.id}`,audioDir=`public/assets/audio/${pack.id.toLowerCase()}`
  type Row={id:string;kind:string;sha256:string;status:string;reviewer:string|null;reviewedAt:string|null;src?:string;script?:string}
  const rows:Row[]=[]
  for(const field of ['vocabulary','kanji','grammar','teaching','readings','listening','questions'] as const)for(const item of pack[field])rows.push({id:item.id,kind:field,sha256:hash(JSON.stringify(item)),status:'NOT_RUN',reviewer:null,reviewedAt:null})
  const audio=JSON.parse(await readFile(`${audioDir}/manifest.json`,'utf8')) as {version:string;reviewStatus:string;assets:{id:string;src:string;script:string;scriptSha256:string;sha256:string;bytes:number;reviewStatus:string}[]}
  if(audio.version!==pack.version)errors.push(`${pack.id}: audio version mismatch`)
  if(release)for(const q of pack.questions)if(q.choices.some(c=>!c.lang))errors.push(`${q.id}: release requires explicit choice languages`)
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
    try{const data=await readFile(`public${src}`);const manifest=JSON.parse(await readFile(`public${src.slice(0,src.lastIndexOf('/'))}/manifest.json`,'utf8'));const asset=manifest.assets.find((a:{src:string})=>a.src===src);if(!asset || asset.sha256!==hash(data) || asset.bytes!==data.length)errors.push(`${src}: stale image provenance`);if(release&&(manifest.reviewStatus!=='APPROVED'||asset?.reviewStatus!=='APPROVED'))errors.push(`${src}: release requires image approval`);rows.push({id:`image:${src}`,kind:'image',src,sha256:hash(data),status:'NOT_RUN',reviewer:null,reviewedAt:null})}catch(e){errors.push(`${src}: ${String(e)}`)}
  }
  // Preserve the established U01 human ledger format; new units get the generalized hash ledger.
  if(pack.id!=='U01'){
    const file=`${dir}/review-ledger.json`
    let previous:{items?:Row[];reviewStatus?:string}={}
    try{previous=JSON.parse(await readFile(file,'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}
    const items=rows.map(row=>{const old=previous.items?.find(i=>i.id===row.id&&i.kind===row.kind&&i.sha256===row.sha256);return old?{...old,...row,status:old.status,reviewer:old.reviewer,reviewedAt:old.reviewedAt}:row})
    const skills=pack.grammar.map(g=>({id:g.id,prerequisites:g.prerequisites,teaching:pack.teaching.filter(c=>c.grammarIds?.includes(g.id)).map(c=>c.id),practice:pack.questions.filter(q=>q.partition==='practice'&&q.primarySkillId===g.id).map(q=>q.id),checkFamilies:[...new Set(pack.questions.filter(q=>q.partition==='check'&&q.primarySkillId===g.id).map(q=>q.itemFamilyId))],delayedRule:'At least 48h after teaching, two calendar dates, at least 4/5 distinct-family first answers correct without hints; content family adequacy awaits human review'}))
    const audit=auditReviews(rows,previous.items??[],{author:'Codex'})
    if(process.argv.includes('--write')&&!audit.some(i=>i.problems.includes('DUPLICATE_RECORD'))){await mkdir(dir,{recursive:true});await writeFile(file,JSON.stringify({unitId:pack.id,version:pack.version,reviewStatus:previous.reviewStatus==='APPROVED'&&audit.every(i=>i.metadataValid)?'APPROVED':'DRAFT',items},null,2)+'\n');await writeFile(`${dir}/coverage.json`,JSON.stringify({unitId:pack.id,version:pack.version,mode:'isolated draft structure',skills,audio:required.size,images:images.length,reviewItems:items.length},null,2)+'\n')}
    reviewAudit.push({unitId:pack.id,items:audit})
    for(const item of audit)if(item.problems.includes('DUPLICATE_RECORD'))errors.push(`${item.id}: duplicate review records`)
    if(release)for(const item of audit)if(!item.metadataValid)errors.push(`${pack.id}/${item.kind}/${item.id}: ${item.problems.join(', ')}`)
  }
  if(pack.id==='U01'){
    const legacy=JSON.parse(await readFile(`${dir}/review-ledger.json`,'utf8')) as {entries:ReviewRecord[]}
    const kinds={vocabulary:'vocabulary',kanji:'kanji',grammar:'grammar',teaching:'teaching',readings:'reading',listening:'listening-script',questions:'question'}
    const targets:ReviewTarget[]=[]
    for(const field of Object.keys(kinds) as (keyof typeof kinds)[])for(const item of pack[field])targets.push({id:item.id,kind:kinds[field],version:pack.version,sha256:hash(JSON.stringify(canonical(item)))})
    for(const a of audio.assets)targets.push({id:a.id,kind:'audio',version:pack.version,sha256:a.sha256})
    for(const [file,kind] of [['public/assets/img/journey/manifest.json','art'],['public/assets/audio/world/manifest.json','world-audio']]){
      const manifest=JSON.parse(await readFile(file,'utf8')) as {version:string;reviewStatus:string;assets:{id:string;src:string;sha256:string;reviewStatus:string}[]}
      for(const a of manifest.assets){if(release&&(manifest.reviewStatus!=='APPROVED'||a.reviewStatus!=='APPROVED'))errors.push(`${a.id}: release requires ${kind} approval`);const digest=hash(await readFile(`public${a.src}`));if(digest!==a.sha256)errors.push(`${a.id}: legacy asset hash mismatch`);targets.push({id:a.id,kind,version:manifest.version,sha256:digest})}
    }
    const audit=auditReviews(targets,legacy.entries,{legacy:true,author:'Codex'})
    reviewAudit.push({unitId:pack.id,items:audit})
    for(const item of audit)if(item.problems.includes('DUPLICATE_RECORD'))errors.push(`${item.id}: duplicate review records`)
    if(release)for(const item of audit)if(!item.metadataValid)errors.push(`${pack.id}/${item.kind}/${item.id}: ${item.problems.join(', ')}`)
  }
  if(release&&(pack.reviewStatus!=='APPROVED'||audio.reviewStatus!=='APPROVED'||audio.assets.some(a=>a.reviewStatus!=='APPROVED')))errors.push(`${pack.id}: release requires content and audio approval`)
}
const missing=blueprint.units.filter(u=>!packs.some(p=>p.id===u.id)).map(u=>u.id)
if(release&&missing.length)errors.push(`Full curriculum incomplete: ${missing.join(', ')}`)
if(release)for(const skill of coverage.skills)if(skill.missing.length)errors.push(`${skill.id}: ${skill.missing.join(', ')}`)
const reviewSummary={items:reviewAudit.reduce((n,p)=>n+p.items.length,0),validMetadata:reviewAudit.reduce((n,p)=>n+p.items.filter(i=>i.metadataValid).length,0)}
if(process.argv.includes('--write'))await writeFile('docs/content/curriculum-coverage.json',JSON.stringify({schema:'curriculum-coverage-v1',sourceVersions:packs.map(p=>({id:p.id,version:p.version})),...coverage,reviewSummary,reviewAudit},null,2)+'\n')
console.log(JSON.stringify({mode:release?'release':'draft inventory',coverage:coverage.summary,review:reviewSummary,actualUnits:packs.map(p=>p.id),missingUnits:missing,vocabulary:packs.reduce((n,p)=>n+p.vocabulary.length,0),practice:packs.reduce((n,p)=>n+p.questions.filter(q=>q.partition==='practice').length,0),errors},null,2))
if(errors.length)process.exitCode=1
