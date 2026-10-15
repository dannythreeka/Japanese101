export type SfxKey = 'correct' | 'wrong' | 'star' | 'pop' | 'levelup' | 'tap' | 'combo'
const cache: Partial<Record<SfxKey, HTMLAudioElement>> = {}
let globalVolume=1, sfxEnabled=true, bgmEnabled=true, bgm:HTMLAudioElement|null=null, bgmVolume=.3, ducked=false
function updateVolumes(){Object.values(cache).forEach(sound=>{sound.volume=globalVolume*.7});if(bgm)bgm.volume=(ducked?.05:bgmVolume)*globalVolume}
function effect(key:SfxKey):HTMLAudioElement {
  if(cache[key])return cache[key]!
  const sound=new Audio(`${import.meta.env.BASE_URL}sfx/${key}.mp3`)
  sound.preload='auto';sound.volume=globalVolume*.7;cache[key]=sound
  return sound
}
export function playSfx(key:SfxKey):void {
  if(!sfxEnabled)return
  try{const sound=effect(key);sound.pause();sound.currentTime=0;void sound.play().catch(()=>{})}catch{/* Optional feedback never affects an answer. */}
}
export function preloadSfx(keys:SfxKey[]):void {for(const key of keys){try{effect(key).load()}catch{/* Unsupported audio remains silent. */}}}
export function setSfxEnabled(enabled:boolean):void {sfxEnabled=enabled;if(!enabled)Object.values(cache).forEach(sound=>sound.pause())}
export function setGlobalVolume(volume:number):void {globalVolume=Math.max(0,Math.min(1,volume));updateVolumes()}
export function isSfxEnabled():boolean{return sfxEnabled}
export function getGlobalVolume():number{return globalVolume}
export function playBgm(src:string,volume=.3):void {
  stopBgm();if(!bgmEnabled)return
  try {const sound=new Audio(src);bgm=sound;bgm.loop=true;bgmVolume=volume;updateVolumes();void sound.play().catch(()=>{if(bgm===sound)stopBgm()})}catch{stopBgm()}
}
export function stopBgm():void {if(bgm){bgm.pause();bgm.removeAttribute('src');bgm.load();bgm=null}}
export function setBgmEnabled(enabled:boolean):void {bgmEnabled=enabled;if(!enabled)stopBgm()}
export function isBgmEnabled():boolean{return bgmEnabled}
export function duckBgm(duck:boolean):void {ducked=duck;updateVolumes()}
export function stopGameAudio():void {
  for(const key of Object.keys(cache) as SfxKey[]){const sound=cache[key];if(sound){sound.pause();sound.removeAttribute('src');sound.load();delete cache[key]}}
  stopBgm()
}
