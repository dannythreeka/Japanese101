import { town, WORLD_VERSION } from './map'
import { u01 } from '../content/packs/u01'
import { BATTLE_RULES_VERSION } from '../battle/rules'
import { CATALOG_VERSION } from '../economy/catalog'
/** Unit encounters reuse destinations; a future unit does not require another town. */
export const journeyManifest={
  version:'journey-manifest-v1',worldVersion:WORLD_VERSION,mapId:town.id,
  rulesVersion:BATTLE_RULES_VERSION,catalogVersion:CATALOG_VERSION,
  entrances:['home','dojo','shop'],npcs:['gardener','traveler'],
  actors:{player:'player-sheet',companion:'fox-sheet',opponent:'opponent-sheet',mentor:'mentor'},
  equipment:{'gear-travel-hat':{slot:'head',asset:'gear-hat'},'gear-travel-pack':{slot:'back',asset:'gear-pack'},'gear-companion-scarf':{slot:'neck',asset:'gear-scarf'}},
  encounters:[{id:'u01-dojo',mapId:town.id,destinationId:'dojo',unitId:u01.id,contentVersion:u01.version,teachingIds:u01.teaching.map(c=>c.id),practiceIds:u01.questions.filter(q=>q.partition==='practice').map(q=>q.id),checkIds:u01.questions.filter(q=>q.partition==='check').map(q=>q.id),moves:['attack','guard','partner']}],
}
