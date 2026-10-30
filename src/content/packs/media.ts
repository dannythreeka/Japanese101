/** Only produced assets are registered. Missing future units are never placeholders. */
import audio01 from '../../../public/assets/audio/u01/manifest.json'
import audio02 from '../../../public/assets/audio/u02/manifest.json'
import audio03 from '../../../public/assets/audio/u03/manifest.json'
import audio04 from '../../../public/assets/audio/u04/manifest.json'
import audio09 from '../../../public/assets/audio/u09/manifest.json'
import audio08 from '../../../public/assets/audio/u08/manifest.json'
import audio07 from '../../../public/assets/audio/u07/manifest.json'
import audio06 from '../../../public/assets/audio/u06/manifest.json'
import audio05 from '../../../public/assets/audio/u05/manifest.json'
type AudioManifest=typeof audio01
const audio:Record<string,AudioManifest>={U01:audio01,U02:audio02,U03:audio03,U04:audio04,U05:audio05,U06:audio06,U07:audio07,U08:audio08,U09:audio09}
export const unitAudio=(unitId:string)=>audio[unitId]
export {unitArt,allUnitArt} from './art'
