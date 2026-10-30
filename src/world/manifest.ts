import { town, WORLD_VERSION } from './map'
import {availablePacks} from '../content/packs/registry'
import { BATTLE_RULES_VERSION } from '../battle/rules'
import { CATALOG_VERSION } from '../economy/catalog'
/** Unit encounters reuse destinations; a future unit does not require another town. */
export const journeyManifest={
  version:'journey-manifest-v2-multi-unit',worldVersion:WORLD_VERSION,mapId:town.id,
  rulesVersion:BATTLE_RULES_VERSION,catalogVersion:CATALOG_VERSION,
  entrances:['home','dojo','shop'],npcs:['gardener','traveler'],
  actors:{player:'player-sheet',companion:'fox-sheet',opponent:'opponent-sheet',mentor:'mentor'},
  equipment:{'gear-travel-hat':{slot:'head',asset:'gear-hat'},'gear-travel-pack':{slot:'back',asset:'gear-pack'},'gear-companion-scarf':{slot:'neck',asset:'gear-scarf'}},
  encounters:availablePacks.map(pack=>({id:`${pack.id.toLowerCase()}-dojo`,mapId:town.id,destinationId:'dojo',unitId:pack.id,contentVersion:pack.version,teachingIds:pack.teaching.map(c=>c.id),practiceIds:pack.questions.filter(q=>q.partition==='practice').map(q=>q.id),checkIds:pack.questions.filter(q=>q.partition==='check').map(q=>q.id),moves:['attack','guard','partner']})),
}
