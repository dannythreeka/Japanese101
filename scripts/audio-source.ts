/** Existing free VOICEVOX synthesis and PCM integrity checks; no review approval. */
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))
function trusted(url:string){const parsed=new URL(url);if(parsed.protocol!=='https:' || !/^audio\d*\.tts\.quest$/.test(parsed.hostname))throw new Error('Unexpected audio host');return parsed.href}
export async function synthesize(script:string):Promise<Buffer>{
  for(let request=0;request<3;request++){
    const response=await fetch(`https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(script)}&speaker=2`,{signal:AbortSignal.timeout(15000)})
    if(response.status===429 && request<2){
      const retry=response.headers.get('retry-after')
      const seconds=retry===null ? 5*(request+1) : /^\d+$/.test(retry) ? Number(retry) : Math.ceil((Date.parse(retry)-Date.now())/1000)
      if(Number.isFinite(seconds)&&seconds>=0&&seconds<=30){await delay(Math.max(2,seconds)*1000);continue}
    }
    if(!response.ok)throw new Error(`Synthesis HTTP ${response.status}`)
    const job=await response.json() as {success:boolean;retryAfter?:number;audioStatusUrl:string;wavDownloadUrl:string;speakerName?:string}
    if(!job.success){if(request===0 && job.retryAfter && job.retryAfter<=30){await delay(job.retryAfter*1000);continue}throw new Error('Synthesis unavailable or rate-limited')}
    if(job.speakerName && !job.speakerName.includes('四国めたん'))throw new Error('Unexpected voice identity')
    // Longer teaching scripts can exceed the old 40s queue allowance. Keep one
    // accepted job and a wall-clock deadline; do not submit duplicate synthesis.
    const deadline=Date.now()+120000
    for(let poll=0;poll<60 && Date.now()<deadline;poll++){
      await delay(Math.min(2000,deadline-Date.now()))
      const remaining=deadline-Date.now();if(remaining<=0)break
      const status=await fetch(trusted(job.audioStatusUrl),{signal:AbortSignal.timeout(Math.min(10000,remaining))})
      if(!status.ok)throw new Error(`Audio status HTTP ${status.status}`)
      const state=await status.json() as {isAudioReady:boolean;isAudioError:boolean}
      if(state.isAudioError)throw new Error('Voice engine rejected the text')
      if(state.isAudioReady){const file=await fetch(trusted(job.wavDownloadUrl),{signal:AbortSignal.timeout(20000)});if(!file.ok)throw new Error(`Audio download HTTP ${file.status}`);return Buffer.from(await file.arrayBuffer())}
    }
    throw new Error('Synthesis status timed out')
  }
  throw new Error('Synthesis unavailable')
}
export function wavInfo(buffer:Buffer){
  if(buffer.toString('ascii',0,4)!=='RIFF' || buffer.toString('ascii',8,12)!=='WAVE')throw new Error('Not a WAV file')
  let rate=0,channels=0,bits=0,pcm:Buffer|undefined
  for(let offset=12;offset+8<=buffer.length;){const kind=buffer.toString('ascii',offset,offset+4);const length=buffer.readUInt32LE(offset+4);const start=offset+8;if(start+length>buffer.length)throw new Error('Truncated WAV');if(kind==='fmt '){if(buffer.readUInt16LE(start)!==1)throw new Error('Expected PCM');channels=buffer.readUInt16LE(start+2);rate=buffer.readUInt32LE(start+4);bits=buffer.readUInt16LE(start+14)}if(kind==='data')pcm=buffer.subarray(start,start+length);offset=start+length+(length%2)}
  if(!pcm || bits!==16 || !rate || !channels)throw new Error('Invalid PCM format')
  let peak=0,sum=0;for(let n=0;n+1<pcm.length;n+=2){const sample=pcm.readInt16LE(n)/32768;peak=Math.max(peak,Math.abs(sample));sum+=sample*sample}
  const duration=pcm.length/(rate*channels*2);const rms=Math.sqrt(sum/(pcm.length/2))
  if(duration<.3 || duration>90 || peak===0)throw new Error('Empty or implausible spoken audio')
  return {durationSeconds:Number(duration.toFixed(3)),sampleRate:rate,channels,bits,peak:Number(peak.toFixed(4)),rms:Number(rms.toFixed(4))}
}
