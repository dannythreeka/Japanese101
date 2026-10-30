import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {synthesize,wavInfo} from './audio-source'
const script='ほんをよみます。',src='/assets/audio/kana-placement/hon-wo.wav'
await mkdir('public/assets/audio/kana-placement',{recursive:true})
let bytes:Buffer
try{bytes=await readFile(`public${src}`)}catch{bytes=await synthesize(script);wavInfo(bytes);await writeFile(`public${src}`,bytes)}
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
await writeFile('public/assets/audio/kana-placement/manifest.json',JSON.stringify({version:'kana-placement-1-draft',reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,generator:'tts.quest v3 / VOICEVOX speaker 2',assets:[{id:'hon-wo',src,script,scriptSha256:hash(script),sha256:hash(bytes),credit:'VOICEVOX:四国めたん',...wavInfo(bytes)}]},null,2)+'\n')
console.log('Kana placement sentence ready; human listening NOT_RUN',wavInfo(bytes))
