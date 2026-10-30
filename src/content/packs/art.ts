/** Small visual layouts only; importing a context image must not load every audio script. */
import art02 from '../../../public/assets/img/u02/manifest.json'
import art03 from '../../../public/assets/img/u03/manifest.json'
import art04 from '../../../public/assets/img/u04/manifest.json'
import art05 from '../../../public/assets/img/u05/manifest.json'
import art06 from '../../../public/assets/img/u06/manifest.json'
import art07 from '../../../public/assets/img/u07/manifest.json'
import worldArt from '../../../public/assets/img/journey/manifest.json'
import type {ArtAsset} from '../../world/validation'
const art:Record<string,ArtAsset[]>={U02:art02.assets,U03:art03.assets,U04:art04.assets,U05:art05.assets,U06:art06.assets,U07:art07.assets}
export const unitArt=(unitId:string)=>art[unitId]??[]
export const allUnitArt=Object.values(art).flat()
export const contextArt=(src:string):ArtAsset|undefined=>[...worldArt.assets,...allUnitArt].find(asset=>asset.src===src)
