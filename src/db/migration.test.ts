import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { AppDB } from './index'

const names: string[] = []
afterEach(async () => { for (const name of names.splice(0)) await Dexie.delete(name) })

describe('v1–v4 to v5 profile-safe migration', () => {
  for (const version of [1, 2, 3, 4]) it(`preserves all v${version} raw data without assigning it to a child`, async () => {
    const name = `migration-${crypto.randomUUID()}`; names.push(name)
    const old = new Dexie(name)
    old.version(version).stores({ progress: 'id, type, nextReview, lastSeen', sessions: 'id, date, feature', ...(version >= 2 ? { pets: 'petId' } : {}), ...(version >= 3 ? { adventureProgress: 'id' } : {}), ...(version >= 4 ? { profiles: 'profile_id, created_at' } : {}) })
    await old.open()
    const raw = { id: 'old-item', type: 'broken-but-preserved', correct: 'invalid', extra: 'keep me' }
    await old.table('progress').put(raw)
    await old.table('sessions').put({ id: 'old-session', date: 42, correct: 3, total: 5 })
    old.close()
    const next = new AppDB(name); await next.open()
    expect(await next.progress.toArray()).toEqual([raw])
    expect(await next.playerProgress.count()).toBe(0)
    expect(await next.playerSessions.count()).toBe(0)
    expect((await next.migrationBackups.get('pre-v5'))?.tables.progress).toEqual([raw])
    next.close(); await next.open()
    expect((await next.migrationBackups.get('pre-v5'))?.tables.progress).toEqual([raw])
    next.close()
  })
  it('opens an empty database without inventing a legacy migration', async () => {
    const name = `fresh-${crypto.randomUUID()}`;names.push(name)
    const db = new AppDB(name); await db.open()
    expect(await db.migrationBackups.count()).toBe(0)
    expect(await db.playerProgress.count()).toBe(0)
    db.close()
  })
})

it('rolls back a failed backup write and leaves the original version and records intact', async () => {
  const name = `abort-${crypto.randomUUID()}`; names.push(name)
  const old = new Dexie(name); old.version(4).stores({ progress:'id', sessions:'id', pets:'petId', adventureProgress:'id', profiles:'profile_id' })
  await old.open(); await old.table('progress').put({id:'precious',raw:'keep'}); old.close()
  const next = new AppDB(name)
  next.migrationBackups.hook('creating', () => { throw new DOMException('Simulated full storage', 'QuotaExceededError') })
  await expect(next.open()).rejects.toBeDefined(); next.close()
  const recovered = new Dexie(name); await recovered.open()
  expect(recovered.verno).toBe(4)
  expect(await recovered.table('progress').get('precious')).toEqual({id:'precious',raw:'keep'})
  recovered.close()
})
