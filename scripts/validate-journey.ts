import {readFileSync,existsSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {journeyErrors} from '../src/world/validation'
import {journeyManifest} from '../src/world/manifest'
import {u01} from '../src/content/packs/u01'
import {availablePacks} from '../src/content/packs/registry'
import u02Art from '../public/assets/img/u02/manifest.json'
import u03Art from '../public/assets/img/u03/manifest.json'
import art from '../public/assets/img/journey/manifest.json'
import audio from '../public/assets/audio/u01/manifest.json'
import worldAudio from '../public/assets/audio/world/manifest.json'
import blueprint from '../docs/content/n5-manifest.json'
import {town,WORLD_VERSION} from '../src/world/map'
const formal=process.argv.includes('--release')
const assets=[...art.assets,...u02Art.assets,...u03Art.assets]
const knownSkills=[...blueprint.skills.map(s=>s.id),...availablePacks.filter(p=>p.id.startsWith('KANA-')).flatMap(p=>p.teaching.flatMap(c=>c.skillIds))]
const errors=journeyErrors(journeyManifest,availablePacks,assets,knownSkills,formal)
const hash=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex')
for(const asset of [...assets,...audio.assets,...worldAudio.assets]){
  const file=`public${asset.src}`
  if(!existsSync(file)){errors.push(`${asset.id}: missing file ${asset.src}`);continue}
  const data=readFileSync(file);if(data.length!==asset.bytes || hash(data)!==asset.sha256)errors.push(`${asset.id}: asset bytes/hash mismatch`)
}
if(worldAudio.worldVersion!==WORLD_VERSION)errors.push('world dialogue: version mismatch')
for(const destination of town.destinations)for(const [index,line] of (destination.dialogue ?? []).entries()){
  const a=worldAudio.assets.find(a=>a.src===line.audioSrc)
  if(!a || a.script!==line.ja || hash(a.script)!==a.scriptSha256)errors.push(`${destination.id}:${index}: missing/mismatched dialogue audio`)
  if(formal && a?.reviewStatus!=='APPROVED')errors.push(`${destination.id}:${index}: human dialogue listening review required`)
}
for(const q of u01.questions){
  for(const skill of q.skillIds)if(!blueprint.units[0].skillIds.includes(skill))errors.push(`${q.id}: skill ${skill} is not assigned to U01`)
  if(q.audioSrc && !audio.assets.some(a=>a.src===q.audioSrc))errors.push(`${q.id}: missing audio ${q.audioSrc}`)
  if(!q.promptJa || !q.explanationJa || q.partition==='practice' && !q.hintJa)errors.push(`${q.id}: missing Japanese operation text`)
}
for(const card of u01.teaching){if(card.audioSrc && !audio.assets.some(a=>a.src===card.audioSrc))errors.push(`${card.id}: missing teaching audio`)}
for(const a of audio.assets){
  if(hash(a.script)!==a.scriptSha256)errors.push(`${a.id}: script hash mismatch`)
  const source=u01.listening.find(l=>l.audioSrc===a.src)?.script ?? u01.teaching.find(c=>c.audioSrc===a.src)?.audioScript
  if(source!==a.script)errors.push(`${a.id}: audio script differs from content`)
  if(formal && a.reviewStatus!=='APPROVED')errors.push(`${a.id}: human listening review required`)
}
const typeCounts=Object.fromEntries(blueprint.questionTypes.map(type=>[type.id,u01.questions.filter(q=>q.partition==='practice' && q.typeId===type.id).length]))
for(const [type,count] of Object.entries(blueprint.units[0].typeCounts))if(typeCounts[type]!==count)errors.push(`${type}: practice distribution ${typeCounts[type]} != ${count}`)
const skills=[...new Set(u01.questions.map(q=>q.primarySkillId))].map(id=>({id,teaching:u01.teaching.filter(c=>c.skillIds.includes(id)).map(c=>c.id),practice:u01.questions.filter(q=>q.primarySkillId===id && q.partition==='practice').map(q=>q.id),checkFamilies:[...new Set(u01.questions.filter(q=>q.primarySkillId===id && q.partition==='check').map(q=>q.itemFamilyId))]}))
const report={version:u01.version,mode:formal?'release':'isolated draft structure',status:errors.length?'FAIL':'PASS',humanReview:u01.reviewStatus,audioHumanReview:audio.reviewStatus,visualHumanReview:art.reviewStatus,typeCounts,skills,errors}
if(process.argv.includes('--report'))writeFileSync('docs/content/U01/coverage.json',JSON.stringify(report,null,2)+'\n')
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Journey structure PASS: ${availablePacks.length} playable packs / ${assets.length} images / ${audio.assets.length} unit + ${worldAudio.assets.length} world audio. Human reviews remain ${u01.reviewStatus}.`)
