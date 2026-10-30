// @vitest-environment node
/// <reference types="node" />
import {expect,it} from 'vitest'
import {cp,mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=fileURLToPath(new URL('../../',import.meta.url)),script=join(root,'scripts/unit-inventory.ts')
it('CLI preserves contradictory reviews and resets stale approvals only in an isolated fixture',async()=>{
  const temp=await mkdtemp(join(tmpdir(),'japanese101-review-audit-'))
  try{
    await mkdir(join(temp,'src/content/packs'),{recursive:true})
    for(const path of ['src/content/packs/u02.json','docs/content/U02','public/assets/audio/u02','public/assets/img/u02'])await cp(join(root,path),join(temp,path),{recursive:true})
    const file=join(temp,'docs/content/U02/review-ledger.json'),original=JSON.parse(await readFile(file,'utf8'))
    const contradictory=structuredClone(original)
    contradictory.items[0]={...contradictory.items[0],status:'APPROVED',reviewer:'fixture-independent-reviewer',reviewedAt:'2026-10-01T00:00:00Z'}
    contradictory.items.push({...contradictory.items[0],status:'NOT_RUN'})
    const before=JSON.stringify(contradictory);await writeFile(file,before)
    const run=()=>spawnSync(process.execPath,['--import',import.meta.resolve('tsx'),script,'--write'],{cwd:temp,encoding:'utf8',timeout:10000})
    const duplicate=run()
    expect(duplicate.status,duplicate.stderr).toBe(1)
    expect(duplicate.stdout).toContain('duplicate review records')
    expect(await readFile(file,'utf8')).toBe(before)
    const stale=structuredClone(original);stale.items[0]={...stale.items[0],sha256:'old-review-hash',status:'APPROVED',reviewer:'fixture-independent-reviewer',reviewedAt:'2026-10-01T00:00:00Z'}
    await writeFile(file,JSON.stringify(stale))
    const changed=run();expect(changed.status,changed.stderr).toBe(0)
    expect(JSON.parse(await readFile(file,'utf8')).items[0]).toMatchObject({status:'NOT_RUN',reviewer:null,reviewedAt:null,sha256:original.items[0].sha256})
    expect(JSON.parse(await readFile(join(root,'docs/content/U02/review-ledger.json'),'utf8'))).toEqual(original)
  }finally{await rm(temp,{recursive:true,force:true})}
})
