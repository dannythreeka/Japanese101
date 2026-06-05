import { Router } from 'express'
import type { Request, Response } from 'express'
import { verifyToken, extractBearerToken } from '../auth.js'
import { readRow, writeRow } from '../sheets.js'
import type { SheetRow } from '../sheets.js'

const router = Router()

function requireAuth(req: Request, res: Response): boolean {
  const token = extractBearerToken(req.headers.authorization)
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'unauthorized' })
    return false
  }
  return true
}

router.get('/pull', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return
  const profileId = String(req.query.profileId ?? '')
  if (!profileId) { res.status(400).json({ error: 'profileId required' }); return }
  try {
    const row = await readRow(profileId)
    if (!row) { res.json(null); return }
    res.json(row)
  } catch (err) {
    console.error('pull error', err)
    res.status(500).json({ error: 'sheets_error' })
  }
})

router.post('/push', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return
  const body = req.body as Partial<SheetRow>
  if (!body.profileId) { res.status(400).json({ error: 'profileId required' }); return }
  const row: SheetRow = {
    profileId: body.profileId,
    adventure_progress: body.adventure_progress ?? null,
    pet_state: body.pet_state ?? null,
    kana_progress: body.kana_progress ?? [],
    updated_at: body.updated_at ?? Date.now(),
  }
  try {
    await writeRow(row)
    res.json({ ok: true })
  } catch (err) {
    console.error('push error', err)
    res.status(500).json({ error: 'sheets_error' })
  }
})

export default router
