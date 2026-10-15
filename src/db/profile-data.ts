import { db } from './index'

/** Serial read-modify-write: an async A operation never looks up current player B. */
export async function incrementStars(profileId: string, amount: number): Promise<number> {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid star increment')
  return db.transaction('rw', [db.profiles, db.wallets], async () => {
    if (!await db.profiles.get(profileId)) throw new Error('Player no longer exists')
    const wallet = (await db.wallets.get(profileId)) ?? { profileId, stars: 0 }
    wallet.stars += amount
    await db.wallets.put(wallet)
    return wallet.stars
  })
}
export async function claimDailyTask(profileId: string, date: string, taskId: string, amount: number): Promise<boolean> {
  return db.transaction('rw', [db.profiles, db.wallets, db.dailyClaims], async () => {
    if (await db.dailyClaims.get([profileId, date, taskId])) return false
    await incrementStars(profileId, amount)
    await db.dailyClaims.add({ profileId, date, taskId })
    return true
  })
}
