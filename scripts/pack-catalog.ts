/** Runtime menu metadata must match the actual, validated content registry. */
import {readFile,writeFile} from 'node:fs/promises'
import {availablePacks} from '../src/content/packs/registry'
const file='src/content/packs/catalog.json'
const catalog=availablePacks.map(({id,title,version})=>({id,title,version}))
const expected=JSON.stringify(catalog,null,2)+'\n'
if(process.argv.includes('--write'))await writeFile(file,expected)
else if(await readFile(file,'utf8')!==expected)throw new Error('Pack catalog is stale; run node --import tsx scripts/pack-catalog.ts --write')
console.log(`Pack catalog PASS: ${catalog.length} actual packs`)
