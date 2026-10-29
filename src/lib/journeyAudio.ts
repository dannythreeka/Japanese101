import { duckBgm } from './audio'
let current:(()=>void)|undefined
export function claimJourneyAudio(stop:()=>void) { current=stop }
export function releaseJourneyAudio(stop:()=>void) { if(current===stop)current=undefined }
export function stopJourneyAudio() { const stop=current;current=undefined;stop?.();duckBgm(false) }
