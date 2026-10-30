/** Only produced assets are registered. Missing future units are never placeholders. */
import audio01 from '../../../public/assets/audio/u01/manifest.json'
import audio02 from '../../../public/assets/audio/u02/manifest.json'
import audio03 from '../../../public/assets/audio/u03/manifest.json'
import audio04 from '../../../public/assets/audio/u04/manifest.json'
import audio06 from '../../../public/assets/audio/u06/manifest.json'
import art06 from '../../../public/assets/img/u06/manifest.json'
import audio05 from '../../../public/assets/audio/u05/manifest.json'
import art05 from '../../../public/assets/img/u05/manifest.json'
import art02 from '../../../public/assets/img/u02/manifest.json'
import art03 from '../../../public/assets/img/u03/manifest.json'
import art04 from '../../../public/assets/img/u04/manifest.json'
import type {ArtAsset} from '../../world/validation'
type AudioManifest=typeof audio01
const audio:Record<string,AudioManifest>={U01:audio01,U02:audio02,U03:audio03,U04:audio04,U05:audio05,U06:audio06}
const art:Record<string,ArtAsset[]>={U02:art02.assets,U03:art03.assets,U04:art04.assets,U05:art05.assets,U06:art06.assets}
export const unitAudio=(unitId:string)=>audio[unitId]
export const unitArt=(unitId:string)=>art[unitId]??[]
export const allUnitArt=Object.values(art).flat()
